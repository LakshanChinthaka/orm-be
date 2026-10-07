import {
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsISO31661Alpha2,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CountryCreateDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ example: 'SRI LANKA', required: true })
  countryName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsISO31661Alpha2()
  @ApiProperty({ example: 'LK', required: true })
  countryCode: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
    default: true,
  })
  isActive?: boolean;
}
