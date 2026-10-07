import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessLocationTypeCreateRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: 'Warehouse', required: true })
  locationType: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true, required: false, default: true })
  isActive?: boolean;
}
