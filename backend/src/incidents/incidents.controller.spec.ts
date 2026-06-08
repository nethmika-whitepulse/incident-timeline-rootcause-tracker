import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsController } from './incidents.controller';
import { IncidentsService }    from './incidents.service';
import { Severity }            from './schemas/incident.schema';

const mockIncidentsService = {
  create:  jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update:  jest.fn(),
  remove:  jest.fn(),
};

const mockUser = { userId: 'user123', email: 'jane@example.com' };

describe('IncidentsController', () => {
  let controller: IncidentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsController],
      providers: [{ provide: IncidentsService, useValue: mockIncidentsService }],
    }).compile();

    controller = module.get<IncidentsController>(IncidentsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('should create an incident', async () => {
      const dto = { title: 'DB outage', severity: Severity.P1 };
      mockIncidentsService.create.mockResolvedValue({ _id: 'inc1', ...dto });

      const result = await controller.create(dto as any, { user: mockUser });

      expect(mockIncidentsService.create).toHaveBeenCalledWith(dto, mockUser.userId);
      expect(result).toHaveProperty('_id');
    });
  });

  describe('findAll()', () => {
    it('should return an array of incidents', async () => {
      mockIncidentsService.findAll.mockResolvedValue([{ _id: 'inc1' }, { _id: 'inc2' }]);
      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('should return a single incident', async () => {
      mockIncidentsService.findOne.mockResolvedValue({ _id: 'inc1', title: 'DB outage' });
      const result = await controller.findOne('inc1');
      expect(result).toHaveProperty('title', 'DB outage');
    });
  });

  describe('update()', () => {
    it('should update and return the incident', async () => {
      mockIncidentsService.update.mockResolvedValue({ _id: 'inc1', status: 'Resolved' });
      const result = await controller.update('inc1', { status: 'Resolved' } as any);
      expect(result).toHaveProperty('status', 'Resolved');
    });
  });

  describe('remove()', () => {
    it('should delete and confirm', async () => {
      mockIncidentsService.remove.mockResolvedValue({ message: 'Incident deleted' });
      const result = await controller.remove('inc1');
      expect(result).toHaveProperty('message');
    });
  });
});
