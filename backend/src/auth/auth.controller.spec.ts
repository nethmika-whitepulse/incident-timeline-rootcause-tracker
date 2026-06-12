import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login:    jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register()', () => {
    it('should call authService.register with the DTO', async () => {
      const dto = { name: 'Jane', email: 'jane@example.com', password: 'pass1234' };
      mockAuthService.register.mockResolvedValue({ message: 'User registered successfully', userId: 'abc123' });

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('userId');
    });
  });

  describe('login()', () => {
    it('should return an access_token on valid credentials', async () => {
      const dto = { email: 'jane@example.com', password: 'pass1234' };
      mockAuthService.login.mockResolvedValue({ access_token: 'jwt.token.here' });

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('access_token');
    });
  });
});
