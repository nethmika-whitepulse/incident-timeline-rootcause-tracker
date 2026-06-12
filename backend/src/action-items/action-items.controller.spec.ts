import { Test, TestingModule }   from '@nestjs/testing';
import { ActionItemsController } from './action-items.controller';
import { ActionItemsService }    from './action-items.service';
import { ActionItemStatus }      from './schemas/action-item.schema';

const mockActionItemsService = {
  create:         jest.fn(),
  findByIncident: jest.fn(),
  update:         jest.fn(),
  remove:         jest.fn(),
};

describe('ActionItemsController', () => {
  let controller: ActionItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionItemsController],
      providers: [{ provide: ActionItemsService, useValue: mockActionItemsService }],
    }).compile();
    controller = module.get<ActionItemsController>(ActionItemsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create() should call service.create', async () => {
    const dto = { incidentId: 'inc1', title: 'Add circuit breaker', owner: 'Jane', dueDate: '2024-07-01' };
    mockActionItemsService.create.mockResolvedValue({ _id: 'ai1', ...dto });
    const result = await controller.create(dto as any);
    expect(result).toHaveProperty('_id');
  });

  it('findByIncident() should return action items', async () => {
    mockActionItemsService.findByIncident.mockResolvedValue([{ _id: 'ai1' }, { _id: 'ai2' }]);
    const result = await controller.findByIncident('inc1');
    expect(result).toHaveLength(2);
  });

  it('update() should mark an item Done', async () => {
    mockActionItemsService.update.mockResolvedValue({ _id: 'ai1', status: ActionItemStatus.Done });
    const result = await controller.update('ai1', { status: ActionItemStatus.Done } as any);
    expect(result).toHaveProperty('status', ActionItemStatus.Done);
  });

  it('remove() should delete an action item', async () => {
    mockActionItemsService.remove.mockResolvedValue({ message: 'Action item deleted' });
    const result = await controller.remove('ai1');
    expect(result).toHaveProperty('message');
  });
});
