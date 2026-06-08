import { Test, TestingModule } from '@nestjs/testing';
import { TimelineController } from './timeline.controller';
import { TimelineService }    from './timeline.service';

const mockTimelineService = {
  create:          jest.fn(),
  findByIncident:  jest.fn(),
  update:          jest.fn(),
  remove:          jest.fn(),
};

describe('TimelineController', () => {
  let controller: TimelineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimelineController],
      providers: [{ provide: TimelineService, useValue: mockTimelineService }],
    }).compile();
    controller = module.get<TimelineController>(TimelineController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create() should call service.create with dto', async () => {
    const dto = { incidentId: 'inc1', timestamp: '2024-06-01T09:10:00Z', description: 'Alert triggered', author: 'Jane' };
    mockTimelineService.create.mockResolvedValue({ _id: 'evt1', ...dto });
    const result = await controller.create(dto as any);
    expect(mockTimelineService.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('_id');
  });

  it('findByIncident() should return events in order', async () => {
    mockTimelineService.findByIncident.mockResolvedValue([{ timestamp: '09:10' }, { timestamp: '09:20' }]);
    const result = await controller.findByIncident('inc1');
    expect(result).toHaveLength(2);
  });

  it('update() should update a timeline event', async () => {
    mockTimelineService.update.mockResolvedValue({ _id: 'evt1', description: 'Updated' });
    const result = await controller.update('evt1', { description: 'Updated' } as any);
    expect(result).toHaveProperty('description', 'Updated');
  });

  it('remove() should delete an event', async () => {
    mockTimelineService.remove.mockResolvedValue({ message: 'Timeline event deleted' });
    const result = await controller.remove('evt1');
    expect(result).toHaveProperty('message');
  });
});
