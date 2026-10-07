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
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx', required: true })
  subscriptionPlanId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx', required: true })
  subscriptionPlanPriceId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx', required: true })
  paymentMethodId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'Jone doe', required: true })
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'jone@example.com' })
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @ApiProperty({ example: 'Test@123#', required: true })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty({ example: '0762074300', required: true })
  contactNo: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'xxx-xxx-xxx', required: false })
  hearAboutId?: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx', required: true })
  industryTypeId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'ABC Property Pvt Ltd', required: true })
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty({ example: '0762073703' })
  businessContactNo: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'jonebusiness@example.com', required: false })
  businessEmail?: string;
}
