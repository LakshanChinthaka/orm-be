import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'token-from-the-reset-link' })
  token: string;

  // Same rules as UserRegisterDto.password
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @ApiProperty({ example: 'Test@123#' })
  newPass: string;
}
