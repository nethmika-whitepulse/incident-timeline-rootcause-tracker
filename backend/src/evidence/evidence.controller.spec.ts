import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceController } from './evidence.controller';
import { EvidenceService }    from './evidence.service';
import { EvidenceType }       from './schemas/evidence.schema';

const mockEvidenceService = {
  create:          jest.fn(),
  findByIncident:  jest.fn(),
  remove:          jest.fn(),
};

describe('EvidenceController', () => {
  let controller: EvidenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenceController],
      providers: [{ provide: EvidenceService, useValue: mockEvidenceService }],
    }).compile();
    controller = module.get<EvidenceController>(EvidenceController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create() should call service.create', async () => {
    const dto = { incidentId: 'inc1', type: EvidenceType.Log, uploadedBy: 'Nethmika', notes: 'stack trace' };
    mockEvidenceService.create.mockResolvedValue({ _id: 'ev1', ...dto });
    const result = await controller.create(dto as any, undefined);
    expect(mockEvidenceService.create).toHaveBeenCalledWith(dto, undefined);
    expect(result).toHaveProperty('_id');
  });

  it('findByIncident() should return evidence list', async () => {
    mockEvidenceService.findByIncident.mockResolvedValue([{ _id: 'ev1' }]);
    const result = await controller.findByIncident('inc1');
    expect(result).toHaveLength(1);
  });

  it('remove() should delete evidence', async () => {
    mockEvidenceService.remove.mockResolvedValue({ message: 'Evidence deleted' });
    const result = await controller.remove('ev1');
    expect(result).toHaveProperty('message');
  });
});
