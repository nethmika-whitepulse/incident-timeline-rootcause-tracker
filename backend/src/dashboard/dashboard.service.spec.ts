import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Incident, IncidentStatus } from '../incidents/schemas/incident.schema';

// ── Mock Mongoose model ───────────────────────────────────────────────────────
const mockIncidentModel = {
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  find: jest.fn(),
};

// Chainable mock for find().sort().limit().select()
const findChainMock = {
  sort:   jest.fn().mockReturnThis(),
  limit:  jest.fn().mockReturnThis(),
  select: jest.fn(),
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

    // Reset the chain mock's terminal method each test
    mockIncidentModel.find.mockReturnValue(findChainMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummary()', () => {
    it('should return openCount from countDocuments with the Open status filter', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(3);
      mockIncidentModel.aggregate.mockResolvedValue([]);
      findChainMock.select.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(mockIncidentModel.countDocuments).toHaveBeenCalledWith({ status: IncidentStatus.Open });
      expect(result.openCount).toBe(3);
    });

    it('should return incidents grouped by severity from the first aggregation', async () => {
      const severityBreakdown = [
        { _id: 'P1', count: 2 },
        { _id: 'P2', count: 5 },
      ];
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate
        .mockResolvedValueOnce(severityBreakdown) // bySeverity (1st aggregate call)
        .mockResolvedValueOnce([]);               // meanResolution (2nd aggregate call)
      findChainMock.select.mockResolvedValue([]);

      const result = await service.getSummary();

      // Verify the grouping/sort pipeline shape
      expect(mockIncidentModel.aggregate).toHaveBeenNthCalledWith(1, [
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      expect(result.bySeverity).toEqual(severityBreakdown);
    });

    it('should return the 5 most recently closed incidents', async () => {
      const closedIncidents = [{ title: 'DB outage', severity: 'P1', updatedAt: new Date() }];
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate.mockResolvedValue([]);
      findChainMock.select.mockResolvedValue(closedIncidents);

      const result = await service.getSummary();

      expect(mockIncidentModel.find).toHaveBeenCalledWith({ status: IncidentStatus.Closed });
      expect(findChainMock.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(findChainMock.limit).toHaveBeenCalledWith(5);
      expect(findChainMock.select).toHaveBeenCalledWith('title severity updatedAt');
      expect(result.recentlyClosed).toEqual(closedIncidents);
    });

    it('should return meanResolutionMinutes from the second aggregation', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      mockIncidentModel.aggregate
        .mockResolvedValueOnce([])                          // bySeverity
        .mockResolvedValueOnce([{ meanResolutionMinutes: 47.5 }]); // meanResolution
      findChainMock.select.mockResolvedValue([]);

      const result = await service.getSummary();

      // Verify the duration/avg pipeline shape
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

    it('should return null for meanResolutionMinutes when no incidents have been resolved', async () => {
      mockIncidentModel.countDocuments.mockResolvedValue(0);
      // Empty aggregation result — no documents matched $match
      mockIncidentModel.aggregate.mockResolvedValue([]);
      findChainMock.select.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.meanResolutionMinutes).toBeNull();
    });
  });
});
