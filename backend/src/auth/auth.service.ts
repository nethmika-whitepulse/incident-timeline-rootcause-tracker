import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService }  from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model }       from 'mongoose';
import * as bcrypt     from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto }        from './dto/register.dto';
import { LoginDto }           from './dto/login.dto';

type TokenPayload = { sub: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user   = await this.userModel.create({ ...dto, password: hashed });

    return { message: 'User registered successfully', userId: user._id };
  }

  async login(dto: LoginDto) {
    // password has select:false on the schema — must explicitly include it here
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: TokenPayload = { sub: String(user._id), email: user.email };
    return this.issueTokenPair(payload);
  }

  // Exchanges a refresh token for a new access/refresh token pair. The
  // refresh token is rotated on every use — the old one is invalidated even
  // if it hasn't expired yet, so a leaked refresh token only has a single
  // window of use before the legitimate client's next refresh locks it out.
  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash');

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      // Doesn't match what's on file — either a stale/rotated token being
      // replayed, or someone guessing. Either way, don't honor it.
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    return this.issueTokenPair({ sub: String(user._id), email: user.email });
  }

  // Revokes the stored refresh token so it can no longer be exchanged for a
  // new access token, even if it hasn't expired yet.
  async logout(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } });
    return { message: 'Logged out successfully' };
  }

  // Used to verify a session is still valid against the database rather
  // than trusting the JWT payload alone — catches a user that was deleted
  // or whose access was revoked after the access token was issued.
  async me(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User no longer exists');

    return { userId: user._id, name: user.name, email: user.email };
  }

  // Signs a fresh access/refresh pair, persists a hash of the refresh token
  // on the user document (so it can be looked up and revoked later), and
  // returns both tokens to the caller.
  private async issueTokenPair(payload: TokenPayload) {
    const accessToken  = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret:    this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne({ _id: payload.sub }, { refreshTokenHash });

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
