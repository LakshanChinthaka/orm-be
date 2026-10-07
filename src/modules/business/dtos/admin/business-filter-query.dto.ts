import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessFilterQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'Acme',
    description: 'Matches business name, email or display ID',
  })
  search?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  industryTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({ required: false, example: true })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, example: 1, default: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ required: false, example: 20, default: 20 })
  limit?: number;
}
