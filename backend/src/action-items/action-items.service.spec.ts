import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException }    from '@nestjs/common';
import { getModelToken }        from '@nestjs/mongoose';
import { ActionItemsService }   from './action-items.service';
import { ActionItem }           from './schemas/action-item.schema';
import { ActionItemStatus }     from './schemas/action-item.schema';

const mockModel = {
  create:            jest.fn(),
  find:              jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const VALID_ID    = '64e0000000000000000000ab';
const INCIDENT_ID = '64e0000000000000000000cd';

describe('ActionItemsService', () => {
  let service: ActionItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionItemsService,
        { provide: getModelToken(ActionItem.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<ActionItemsService>(ActionItemsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return an action item', async () => {
      const dto = {
        incidentId: INCIDENT_ID,
        title:      'Add circuit breaker to DB connection',
        owner:      'Nethmika',
        dueDate:    '2024-07-01',
      };
      mockModel.create.mockResolvedValue({ _id: VALID_ID, ...dto, status: ActionItemStatus.Open });

      const result = await service.create(dto as any);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('status', ActionItemStatus.Open);
    });
  });

  // ── findByIncident() ───────────────────────────────────────────────────────
  describe('findByIncident()', () => {
    it('should return all action items for an incident', async () => {
      mockModel.find.mockResolvedValue([{ _id: 'ai1' }, { _id: 'ai2' }]);

      const result = await service.findByIncident(INCIDENT_ID);

      expect(mockModel.find).toHaveBeenCalledWith({ incidentId: INCIDENT_ID });
      expect(result).toHaveLength(2);
    });
  });

  // ── update() ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the action item', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({
        _id: VALID_ID, status: ActionItemStatus.Done,
      });

      const result = await service.update(VALID_ID, { status: ActionItemStatus.Done } as any);

      expect(result).toHaveProperty('status', ActionItemStatus.Done);
    });

    it('should throw NotFoundException when action item does not exist', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.update(VALID_ID, { status: ActionItemStatus.Done } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove() ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return a confirmation message', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue({ _id: VALID_ID });

      const result = await service.remove(VALID_ID);

      expect(result).toEqual({ message: 'Action item deleted' });
    });

    it('should throw NotFoundException when action item does not exist', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
