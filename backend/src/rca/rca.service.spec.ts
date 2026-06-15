import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException }    from '@nestjs/common';
import { getModelToken }        from '@nestjs/mongoose';
import { RcaService }           from './rca.service';
import { Rca }                  from './schemas/rca.schema';

const mockModel = {
  create:           jest.fn(),
  findOne:          jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const INCIDENT_ID = '64e0000000000000000000ab';

describe('RcaService', () => {
  let service: RcaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RcaService,
        { provide: getModelToken(Rca.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<RcaService>(RcaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return an RCA document', async () => {
      const dto = {
        incidentId:  INCIDENT_ID,
        rootCause:   'Memory leak in connection pool',
        resolution:  'Rolled back deployment to v1.2.3',
      };
      mockModel.create.mockResolvedValue({ _id: 'rca1', ...dto });

      const result = await service.create(dto as any);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('rootCause', dto.rootCause);
    });
  });

  // ── findByIncident() ───────────────────────────────────────────────────────
  describe('findByIncident()', () => {
    it('should return the RCA when found', async () => {
      mockModel.findOne.mockResolvedValue({ incidentId: INCIDENT_ID, rootCause: 'Memory leak' });

      const result = await service.findByIncident(INCIDENT_ID);

      expect(mockModel.findOne).toHaveBeenCalledWith({ incidentId: INCIDENT_ID });
      expect(result).toHaveProperty('rootCause');
    });

    it('should throw NotFoundException when no RCA exists for the incident', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.findByIncident(INCIDENT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── update() ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the RCA', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue({
        incidentId: INCIDENT_ID,
        lessonsLearned: 'Add connection pool monitoring alerts',
      });

      const result = await service.update(INCIDENT_ID, { lessonsLearned: 'Add alerts' } as any);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { incidentId: INCIDENT_ID },
        { lessonsLearned: 'Add alerts' },
        { new: true },
      );
      expect(result).toHaveProperty('lessonsLearned');
    });

    it('should throw NotFoundException when RCA does not exist', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        service.update(INCIDENT_ID, { lessonsLearned: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
