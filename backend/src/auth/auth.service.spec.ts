import { Test, TestingModule } from '@nestjs/testing';
import { AuthService }        from './auth.service';
import { getModelToken }      from '@nestjs/mongoose';
import { JwtService }         from '@nestjs/jwt';
import { ConfigService }      from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User }               from './schemas/user.schema';
import * as bcrypt            from 'bcryptjs';

const mockUserModel = {
  findOne:   jest.fn(),
  findById:  jest.fn(),
  create:    jest.fn(),
  updateOne: jest.fn(),
};

const mockJwtService = {
  sign:   jest.fn().mockReturnValue('signed.jwt.token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_REFRESH_SECRET')     return 'refresh-secret';
    if (key === 'JWT_REFRESH_EXPIRES_IN') return '30d';
    return undefined;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService,               useValue: mockJwtService  },
        { provide: ConfigService,            useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register() ─────────────────────────────────────────────────────────────
  // register() calls findOne() without .select() — use mockResolvedValue directly
  describe('register()', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'jane@example.com' });

      await expect(
        service.register({ name: 'Jane', email: 'jane@example.com', password: 'pass1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password and create the user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({ _id: 'abc123' });

      const result = await service.register({
        name: 'Jane', email: 'jane@example.com', password: 'pass1234',
      });

      expect(mockUserModel.create).toHaveBeenCalled();
      expect(result).toHaveProperty('userId', 'abc123');
    });
  });

  // ── login() ────────────────────────────────────────────────────────────────
  // login() calls findOne().select('+password') — mock must return a chainable object
  describe('login()', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({ email: 'ghost@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ email: 'jane@example.com', password: 'hashed' }),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return an access_token and refresh_token on valid credentials', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'abc123', email: 'jane@example.com', password: 'hashed',
        }),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.login({ email: 'jane@example.com', password: 'pass1234' });

      expect(result).toHaveProperty('access_token', 'signed.jwt.token');
      expect(result).toHaveProperty('refresh_token', 'signed.jwt.token');
      // the refresh token's hash gets persisted so it can be looked up on refresh/logout
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'abc123' },
        expect.objectContaining({ refreshTokenHash: expect.any(String) }),
      );
    });
  });

  // ── refresh() ──────────────────────────────────────────────────────────────
  describe('refresh()', () => {
    it('should throw UnauthorizedException if the refresh token signature/expiry is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });

      await expect(service.refresh('bad.token.here')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the user has no stored refresh token hash', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'abc123', email: 'jane@example.com' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.refresh('some.token.here')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the token does not match the stored hash (revoked/rotated)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'abc123', email: 'jane@example.com' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'abc123', email: 'jane@example.com', refreshTokenHash: 'stored-hash' }),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.refresh('some.token.here')).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate and return a new token pair on a valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'abc123', email: 'jane@example.com' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'abc123', email: 'jane@example.com', refreshTokenHash: 'stored-hash' }),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.refresh('some.token.here');

      expect(result).toHaveProperty('access_token', 'signed.jwt.token');
      expect(result).toHaveProperty('refresh_token', 'signed.jwt.token');
    });
  });

  // ── logout() ───────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should unset the stored refresh token hash', async () => {
      mockUserModel.updateOne.mockResolvedValue({});

      const result = await service.logout('abc123');

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: 'abc123' },
        { $unset: { refreshTokenHash: 1 } },
      );
      expect(result).toHaveProperty('message');
    });
  });

  // ── me() ───────────────────────────────────────────────────────────────────
  describe('me()', () => {
    it('should throw UnauthorizedException if the user no longer exists', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.me('deleted-id')).rejects.toThrow(UnauthorizedException);
    });

    it('should return the current user profile', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'abc123', name: 'Jane', email: 'jane@example.com' });

      const result = await service.me('abc123');

      expect(result).toEqual({ userId: 'abc123', name: 'Jane', email: 'jane@example.com' });
    });
  });
});
