import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException }    from '@nestjs/common';
import { getModelToken }        from '@nestjs/mongoose';
import { EvidenceService }      from './evidence.service';
import { Evidence, EvidenceType } from './schemas/evidence.schema';

const mockModel = {
  create:            jest.fn(),
  find:              jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const VALID_ID    = '64e0000000000000000000ab';
const INCIDENT_ID = '64e0000000000000000000cd';

describe('EvidenceService', () => {
  let service: EvidenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        { provide: getModelToken(Evidence.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<EvidenceService>(EvidenceService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create evidence with file metadata when a file is provided', async () => {
      const dto  = { incidentId: INCIDENT_ID, type: EvidenceType.Screenshot, uploadedBy: 'Jane' };
      const file = { originalname: 'screenshot.png', path: 'uploads/screenshot.png' } as any;
      mockModel.create.mockResolvedValue({ _id: VALID_ID, ...dto, filename: file.originalname });

      const result = await service.create(dto as any, file);

      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        filename: 'screenshot.png',
        filePath: 'uploads/screenshot.png',
      });
      expect(result).toHaveProperty('filename', 'screenshot.png');
    });

    it('should create evidence with no filename when no file is provided', async () => {
      const dto = { incidentId: INCIDENT_ID, type: EvidenceType.Note, uploadedBy: 'Jane', notes: 'stack trace here' };
      mockModel.create.mockResolvedValue({ _id: VALID_ID, ...dto });

      await service.create(dto as any, undefined);

      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        filename: undefined,
        filePath: undefined,
      });
    });
  });

  // ── findByIncident() ───────────────────────────────────────────────────────
  describe('findByIncident()', () => {
    it('should return all evidence for an incident', async () => {
      mockModel.find.mockResolvedValue([{ _id: 'ev1' }, { _id: 'ev2' }]);

      const result = await service.findByIncident(INCIDENT_ID);

      expect(mockModel.find).toHaveBeenCalledWith({ incidentId: INCIDENT_ID });
      expect(result).toHaveLength(2);
    });
  });

  // ── remove() ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return a confirmation message', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue({ _id: VALID_ID });

      const result = await service.remove(VALID_ID);

      expect(result).toEqual({ message: 'Evidence deleted' });
    });

    it('should throw NotFoundException when evidence does not exist', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
