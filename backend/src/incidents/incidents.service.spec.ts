import { Test, TestingModule }  from '@nestjs/testing';
import { NotFoundException }     from '@nestjs/common';
import { getModelToken }         from '@nestjs/mongoose';
import { IncidentsService }      from './incidents.service';
import { Incident }              from './schemas/incident.schema';
import { Severity, IncidentStatus } from './schemas/incident.schema';

// ── Mock Mongoose model ───────────────────────────────────────────────────────
const mockIncidentModel = {
  create:              jest.fn(),
  find:                jest.fn(),
  findById:            jest.fn(),
  findByIdAndUpdate:   jest.fn(),
  findByIdAndDelete:   jest.fn(),
};

// Chainable query mock (find().populate().sort())
const chainMock = {
  populate: jest.fn().mockReturnThis(),
  sort:     jest.fn().mockReturnThis(),
};

const VALID_ID   = '64e0000000000000000000ab';
const INVALID_ID = 'nonexistent';

describe('IncidentsService', () => {
  let service: IncidentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getModelToken(Incident.name), useValue: mockIncidentModel },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return a new incident', async () => {
      const dto    = { title: 'DB outage', severity: Severity.P1 };
      const userId = 'user123';
      mockIncidentModel.create.mockResolvedValue({ _id: 'inc1', ...dto, createdBy: userId });

      const result = await service.create(dto as any, userId);

      expect(mockIncidentModel.create).toHaveBeenCalledWith({ ...dto, createdBy: userId });
      expect(result).toHaveProperty('_id', 'inc1');
    });
  });

  // ── findAll() ──────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return all incidents when no filter is given', async () => {
      mockIncidentModel.find.mockReturnValue({
        ...chainMock,
        sort: jest.fn().mockResolvedValue([{ _id: 'inc1' }, { _id: 'inc2' }]),
      });

      const result = await service.findAll();

      expect(mockIncidentModel.find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
    });

    it('should apply status filter when provided', async () => {
      mockIncidentModel.find.mockReturnValue({
        ...chainMock,
        sort: jest.fn().mockResolvedValue([{ _id: 'inc1', status: IncidentStatus.Open }]),
      });

      await service.findAll({ status: IncidentStatus.Open });

      expect(mockIncidentModel.find).toHaveBeenCalledWith({ status: IncidentStatus.Open });
    });

    it('should apply severity filter when provided', async () => {
      mockIncidentModel.find.mockReturnValue({
        ...chainMock,
        sort: jest.fn().mockResolvedValue([]),
      });

      await service.findAll({ severity: Severity.P1 });

      expect(mockIncidentModel.find).toHaveBeenCalledWith({ severity: Severity.P1 });
    });

    it('should apply both filters when both are provided', async () => {
      mockIncidentModel.find.mockReturnValue({
        ...chainMock,
        sort: jest.fn().mockResolvedValue([]),
      });

      await service.findAll({ status: IncidentStatus.Open, severity: Severity.P2 });

      expect(mockIncidentModel.find).toHaveBeenCalledWith({
        status:   IncidentStatus.Open,
        severity: Severity.P2,
      });
    });
  });

  // ── findOne() ──────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return the incident when found', async () => {
      mockIncidentModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: VALID_ID, title: 'DB outage' }),
      });

      const result = await service.findOne(VALID_ID);

      expect(result).toHaveProperty('title', 'DB outage');
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── update() ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the incident', async () => {
      mockIncidentModel.findByIdAndUpdate.mockReturnValue({
        then: jest.fn(),
      });
      mockIncidentModel.findByIdAndUpdate.mockResolvedValue({
        _id: VALID_ID, status: IncidentStatus.Resolved,
      });

      const result = await service.update(VALID_ID, { status: IncidentStatus.Resolved } as any);

      expect(result).toHaveProperty('status', IncidentStatus.Resolved);
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.update(VALID_ID, { status: IncidentStatus.Resolved } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove() ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return a confirmation message', async () => {
      mockIncidentModel.findByIdAndDelete.mockResolvedValue({ _id: VALID_ID });

      const result = await service.remove(VALID_ID);

      expect(result).toEqual({ message: 'Incident deleted' });
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
