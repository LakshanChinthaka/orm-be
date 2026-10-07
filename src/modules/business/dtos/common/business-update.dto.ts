import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessUpdateRequestDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  industryTypeId?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  @ApiProperty({ example: 'Acme Holdings', required: false })
  businessName?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'info@acme.com', required: false })
  businessEmail?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  @ApiProperty({ example: '+94771234567', required: false })
  businessContactNo?: string;
}
