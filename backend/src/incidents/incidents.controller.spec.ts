import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsController } from './incidents.controller';
import { IncidentsService }    from './incidents.service';
import { Severity, IncidentStatus } from './schemas/incident.schema';

const mockIncidentsService = {
  create:  jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update:  jest.fn(),
  remove:  jest.fn(),
};

const mockUser = { userId: 'user123', email: 'jane@example.com' };
const VALID_ID  = '64e0000000000000000000ab';

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
    it('should call service.create with dto and userId', async () => {
      const dto = { title: 'DB outage', severity: Severity.P1 };
      mockIncidentsService.create.mockResolvedValue({ _id: 'inc1', ...dto });

      const result = await controller.create(dto as any, { user: mockUser });

      expect(mockIncidentsService.create).toHaveBeenCalledWith(dto, mockUser.userId);
      expect(result).toHaveProperty('_id');
    });
  });

  describe('findAll()', () => {
    it('should return all incidents with no filters', async () => {
      mockIncidentsService.findAll.mockResolvedValue([{ _id: 'inc1' }, { _id: 'inc2' }]);

      const result = await controller.findAll();

      expect(mockIncidentsService.findAll).toHaveBeenCalledWith({ status: undefined, severity: undefined });
      expect(result).toHaveLength(2);
    });

    it('should pass status filter to the service', async () => {
      mockIncidentsService.findAll.mockResolvedValue([{ _id: 'inc1', status: IncidentStatus.Open }]);

      await controller.findAll(IncidentStatus.Open);

      expect(mockIncidentsService.findAll).toHaveBeenCalledWith({
        status:   IncidentStatus.Open,
        severity: undefined,
      });
    });
  });

  describe('findOne()', () => {
    it('should return a single incident', async () => {
      mockIncidentsService.findOne.mockResolvedValue({ _id: VALID_ID, title: 'DB outage' });

      const result = await controller.findOne(VALID_ID);

      expect(result).toHaveProperty('title', 'DB outage');
    });
  });

  describe('update()', () => {
    it('should update and return the incident', async () => {
      mockIncidentsService.update.mockResolvedValue({ _id: VALID_ID, status: IncidentStatus.Resolved });

      const result = await controller.update(VALID_ID, { status: IncidentStatus.Resolved } as any);

      expect(result).toHaveProperty('status', IncidentStatus.Resolved);
    });
  });

  describe('remove()', () => {
    it('should delete and confirm', async () => {
      mockIncidentsService.remove.mockResolvedValue({ message: 'Incident deleted' });

      const result = await controller.remove(VALID_ID);

      expect(result).toHaveProperty('message');
    });
  });
});
