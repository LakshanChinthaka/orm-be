import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressCreateDto } from '../../../address/dtos/index.js';

export class BusinessLocationCreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  locationTypeId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  @ApiProperty({ example: 'Colombo Branch', required: true })
  locationName: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'colombo@example.com', required: false })
  businessEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ example: '+94771234567', required: false })
  businessLocationContactNo?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true, required: false, default: true })
  isActive?: boolean;

  @ValidateNested()
  @Type(() => AddressCreateDto)
  @IsOptional()
  @ApiProperty({ type: () => AddressCreateDto, required: false })
  address?: AddressCreateDto;
}
