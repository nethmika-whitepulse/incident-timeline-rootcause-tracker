import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken }        from '@nestjs/mongoose';
import { DashboardService }     from './dashboard.service';
import { Incident, IncidentStatus } from '../incidents/schemas/incident.schema';

// ── Mock Mongoose model ───────────────────────────────────────────────────────
const mockIncidentModel = {
  countDocuments: jest.fn(),
  aggregate:      jest.fn(),
  find:           jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Incident.name), useValue: mockIncidentModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    // Build a fresh chain mock per test so sort/limit/select never bleed
    // between tests — each jest.fn() call creates a new independent mock
    const freshChain = {
      sort:   jest.fn().mockReturnThis(),
      limit:  jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([]),
    };
    mockIncidentModel.find.mockReturnValue(freshChain);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummary()', () => {

    // ── openCount ─────────────────────────────────────────────────────────────
    it('should query countDocuments with the Open status filter', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(3);
      mockIncidentModel.aggregate.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(mockIncidentModel.countDocuments).toHaveBeenCalledWith({ status: IncidentStatus.Open });
      expect(result.openCount).toBe(3);
    });

    // ── bySeverity ────────────────────────────────────────────────────────────
    it('should return incidents grouped by severity using the correct pipeline', async () => {
      const severityBreakdown = [{ _id: 'P1', count: 2 }, { _id: 'P2', count: 5 }];
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate
        .mockResolvedValueOnce(severityBreakdown)  // 1st call — bySeverity
        .mockResolvedValueOnce([]);                 // 2nd call — meanResolution

      const result = await service.getSummary();

      expect(mockIncidentModel.aggregate).toHaveBeenNthCalledWith(1, [
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort:  { _id: 1 } },
      ]);
      expect(result.bySeverity).toEqual(severityBreakdown);
    });

    // ── recentlyClosed ────────────────────────────────────────────────────────
    it('should query the 5 most recently closed incidents with correct chain', async () => {
      const closedIncidents = [{ title: 'DB outage', severity: 'P1', updatedAt: new Date() }];
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate.mockResolvedValue([]);

      // Override the fresh chain's terminal method for this test
      const chain = { sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue(closedIncidents) };
      mockIncidentModel.find.mockReturnValue(chain);

      const result = await service.getSummary();

      expect(mockIncidentModel.find).toHaveBeenCalledWith({ status: IncidentStatus.Closed });
      expect(chain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(chain.select).toHaveBeenCalledWith('title severity updatedAt');
      expect(result.recentlyClosed).toEqual(closedIncidents);
    });

    // ── meanResolutionMinutes — happy path ────────────────────────────────────
    it('should return meanResolutionMinutes using the correct aggregation pipeline', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ meanResolutionMinutes: 47.5 }]);

      const result = await service.getSummary();

      expect(mockIncidentModel.aggregate).toHaveBeenNthCalledWith(2, [
        { $match: { startTime: { $exists: true }, endTime: { $exists: true } } },
        {
          $project: {
            durationMinutes: {
              $divide: [{ $subtract: ['$endTime', '$startTime'] }, 60000],
            },
          },
        },
        { $group: { _id: null, meanResolutionMinutes: { $avg: '$durationMinutes' } } },
      ]);
      expect(result.meanResolutionMinutes).toBe(47.5);
    });

    // ── meanResolutionMinutes — no resolved incidents ─────────────────────────
    it('should return null for meanResolutionMinutes when aggregation returns empty array', async () => {
      // No incidents have both startTime and endTime — $match filters everything out
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.meanResolutionMinutes).toBeNull();
    });

    // ── meanResolutionMinutes — field missing from result document ─────────────
    // If the aggregation returns a document but meanResolutionMinutes is absent
    // (e.g. all durations were null), the ?. operator returns undefined and
    // the ?? null coalesces it to null rather than leaking undefined to the client.
    it('should return null when aggregation result document is missing the meanResolutionMinutes field', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate
        .mockResolvedValueOnce([])   // bySeverity
        .mockResolvedValueOnce([{}]); // meanResolution returns doc with no field

      const result = await service.getSummary();

      expect(result.meanResolutionMinutes).toBeNull();
    });
  });
});
