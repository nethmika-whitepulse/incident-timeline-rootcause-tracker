import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException }    from '@nestjs/common';
import { getModelToken }        from '@nestjs/mongoose';
import { TimelineService }      from './timeline.service';
import { TimelineEvent }        from './schemas/timeline-event.schema';

const mockModel = {
  create:            jest.fn(),
  find:              jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const VALID_ID      = '64e0000000000000000000ab';
const INCIDENT_ID   = '64e0000000000000000000cd';

describe('TimelineService', () => {
  let service: TimelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        { provide: getModelToken(TimelineEvent.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return a timeline event', async () => {
      const dto = {
        incidentId: INCIDENT_ID,
        timestamp:  '2024-06-01T09:10:00Z',
        description: 'Alert triggered',
        author: 'Nethmika',
      };
      mockModel.create.mockResolvedValue({ _id: VALID_ID, ...dto });

      const result = await service.create(dto as any);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('_id', VALID_ID);
    });
  });

  // ── findByIncident() ───────────────────────────────────────────────────────
  describe('findByIncident()', () => {
    it('should return events sorted chronologically', async () => {
      const sortMock = jest.fn().mockResolvedValue([
        { timestamp: '09:10', description: 'Alert triggered' },
        { timestamp: '09:20', description: 'Engineer assigned' },
      ]);
      mockModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findByIncident(INCIDENT_ID);

      expect(mockModel.find).toHaveBeenCalledWith({ incidentId: INCIDENT_ID });
      expect(sortMock).toHaveBeenCalledWith({ timestamp: 1 });
      expect(result).toHaveLength(2);
    });
  });

  // ── update() ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the timeline event', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({
        _id: VALID_ID, description: 'Updated description',
      });

      const result = await service.update(VALID_ID, { description: 'Updated description' } as any);

      expect(result).toHaveProperty('description', 'Updated description');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.update(VALID_ID, { description: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove() ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return a confirmation message', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue({ _id: VALID_ID });

      const result = await service.remove(VALID_ID);

      expect(result).toEqual({ message: 'Timeline event deleted' });
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
