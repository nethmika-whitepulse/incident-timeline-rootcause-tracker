import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login:    jest.fn(),
  refresh:  jest.fn(),
  logout:   jest.fn(),
  me:       jest.fn(),
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
      const dto = { name: 'Nethmika', email: 'nethmika@example.com', password: 'pass1234' };
      mockAuthService.register.mockResolvedValue({ message: 'User registered successfully', userId: 'abc123' });

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('userId');
    });
  });

  describe('login()', () => {
    it('should return an access_token and refresh_token on valid credentials', async () => {
      const dto = { email: 'nethmika@example.com', password: 'pass1234' };
      mockAuthService.login.mockResolvedValue({ access_token: 'jwt.token.here', refresh_token: 'refresh.token.here' });

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('refresh()', () => {
    it('should call authService.refresh with the provided refresh token', async () => {
      const dto = { refresh_token: 'refresh.token.here' };
      mockAuthService.refresh.mockResolvedValue({ access_token: 'new.access', refresh_token: 'new.refresh' });

      const result = await controller.refresh(dto);

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh.token.here');
      expect(result).toHaveProperty('access_token', 'new.access');
    });
  });

  describe('logout()', () => {
    it('should call authService.logout with the authenticated user id', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });

      const result = await controller.logout({ user: { userId: 'abc123' } });

      expect(mockAuthService.logout).toHaveBeenCalledWith('abc123');
      expect(result).toHaveProperty('message');
    });
  });

  describe('me()', () => {
    it('should call authService.me with the authenticated user id', async () => {
      mockAuthService.me.mockResolvedValue({ userId: 'abc123', name: 'Nethmika', email: 'nethmika@example.com' });

      const result = await controller.me({ user: { userId: 'abc123' } });

      expect(mockAuthService.me).toHaveBeenCalledWith('abc123');
      expect(result).toHaveProperty('email', 'nethmika@example.com');
    });
  });
});
