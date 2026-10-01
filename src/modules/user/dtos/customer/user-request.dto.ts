import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  IsUUID,
  IsEmail
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRequestDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  userRoleId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  hearAboutId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  userStatusId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

}
