import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'Jone doe' })
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'jone@example.com' })
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @ApiProperty({ example: 'Test@123#' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty({ example: '0762074300' })
  contactNo: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  userRoleId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  userStatusId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  hearAboutId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  subscriptionId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'ABC Property Pvt Ltd' })
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty({ example: '0762073703' })
  businessContactNo: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @ApiProperty({ example: 'jonebusiness@example.com' })
  businessEmail?: string;
}
