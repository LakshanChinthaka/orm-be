import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  Min,
  IsInt,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriceInputDto } from '../common/price-input.dto.js';

const toTitleCase = (value: string) => {
  const normalized = value.trim().toLocaleLowerCase();

  return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
};

export class SubscriptionPlanCreateRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  subscriptionStatusId: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? toTitleCase(value) : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: 'Pro Tier', required: false })
  subscriptionName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  @ApiProperty({ example: 'pro-tier is good' })
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  @ApiProperty({
    example: 14,
    required: false,
    minimum: 0,
    maximum: 100000,
  })
  trialDays?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false, required: false })
  isFeatured?: boolean;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one billing cycle price must be provided',
  })
  @ValidateNested({ each: true })
  @Type(() => PriceInputDto)
  @ApiProperty({
    type: [PriceInputDto],
    description: 'List of active billing cycle prices for this plan',
  })
  prices: PriceInputDto[];

  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one subscription feature must be provided',
  })
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  subscriptionFeatures: string[];
}
