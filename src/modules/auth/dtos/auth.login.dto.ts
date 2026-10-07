import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'example@gmail.com' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Test@123#' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'STAFF' })
  userType: string;
}
