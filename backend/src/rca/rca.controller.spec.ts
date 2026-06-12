import { Test, TestingModule } from '@nestjs/testing';
import { RcaController } from './rca.controller';
import { RcaService }    from './rca.service';

const mockRcaService = {
  create:          jest.fn(),
  findByIncident:  jest.fn(),
  update:          jest.fn(),
};

describe('RcaController', () => {
  let controller: RcaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RcaController],
      providers: [{ provide: RcaService, useValue: mockRcaService }],
    }).compile();
    controller = module.get<RcaController>(RcaController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create() should call service.create', async () => {
    const dto = { incidentId: 'inc1', rootCause: 'Memory leak', resolution: 'Rolled back deployment' };
    mockRcaService.create.mockResolvedValue({ _id: 'rca1', ...dto });
    const result = await controller.create(dto as any);
    expect(mockRcaService.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('_id');
  });

  it('findByIncident() should return the RCA', async () => {
    mockRcaService.findByIncident.mockResolvedValue({ incidentId: 'inc1', rootCause: 'Memory leak' });
    const result = await controller.findByIncident('inc1');
    expect(result).toHaveProperty('rootCause');
  });

  it('update() should update the RCA', async () => {
    mockRcaService.update.mockResolvedValue({ incidentId: 'inc1', lessonsLearned: 'Add alerts' });
    const result = await controller.update('inc1', { lessonsLearned: 'Add alerts' } as any);
    expect(result).toHaveProperty('lessonsLearned');
  });
});
