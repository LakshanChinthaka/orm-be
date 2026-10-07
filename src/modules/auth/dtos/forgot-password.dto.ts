import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'example@gmail.com' })
  username: string;

  @IsString()
  @ApiProperty({ example: 'STAFF' })
  userType: string;
}
