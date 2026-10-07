import {
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddressCreateDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  countryId: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: '123 Main Street', required: true })
  addressLine1: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: '123 Main Street', required: false })
  addressLine2?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(170)
  @ApiProperty({ example: 'Colombo', required: true })
  city: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({ example: 'Western Province', required: false })
  region?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({ example: '80360', required: false })
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
    default: true,
  })
  isActive?: boolean;
}
