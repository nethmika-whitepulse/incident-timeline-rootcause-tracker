import { IsString, IsNotEmpty, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token issued at login' })
  @IsJWT()       // rejects non-JWT-shaped strings
  @IsNotEmpty()  // rejects empty string
  @IsString()
  refresh_token: string;
}
