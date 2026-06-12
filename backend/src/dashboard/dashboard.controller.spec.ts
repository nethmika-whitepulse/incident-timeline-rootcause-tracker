import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService }    from './dashboard.service';

const mockDashboardService = {
  getSummary: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();
    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => jest.clearAllMocks());

  it('getSummary() should return dashboard data', async () => {
    const mockSummary = {
      openCount:              3,
      bySeverity:             [{ _id: 'P1', count: 2 }, { _id: 'P2', count: 1 }],
      recentlyClosed:         [{ title: 'DB outage' }],
      meanResolutionMinutes:  47.5,
    };
    mockDashboardService.getSummary.mockResolvedValue(mockSummary);

    const result = await controller.getSummary();

    expect(result).toHaveProperty('openCount', 3);
    expect(result).toHaveProperty('bySeverity');
    expect(result).toHaveProperty('meanResolutionMinutes');
    expect(result.bySeverity).toHaveLength(2);
  });
});
