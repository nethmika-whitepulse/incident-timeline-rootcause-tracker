import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService }  from '@nestjs/jwt';
import { Model }       from 'mongoose';
import * as bcrypt     from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto }        from './dto/register.dto';
import { LoginDto }           from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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

    const payload = { sub: user._id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }
}
