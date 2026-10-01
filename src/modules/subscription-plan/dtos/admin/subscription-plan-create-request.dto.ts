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
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriceInputDto } from '../common/price-input.dto.js';

export class SubscriptionPlanCreateRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  subscriptionStatusId: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  @ApiProperty({ example: 'Pro Tier', required: false })
  subscriptionName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: 'pro-tier' })
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
