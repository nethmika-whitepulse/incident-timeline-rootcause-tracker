import { Test, TestingModule } from '@nestjs/testing';
import { AuthService }        from './auth.service';
import { getModelToken }      from '@nestjs/mongoose';
import { JwtService }         from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User }               from '../incidents/schemas/user.schema';
import * as bcrypt            from 'bcryptjs';

const mockUserModel = {
  findOne: jest.fn(),
  create:  jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService,              useValue: mockJwtService  },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

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

  describe('login()', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'jane@example.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return a signed JWT on valid credentials', async () => {
      mockUserModel.findOne.mockResolvedValue({ _id: 'abc123', email: 'jane@example.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: 'jane@example.com', password: 'pass1234' });

      expect(result).toHaveProperty('access_token', 'signed.jwt.token');
    });
  });
});
