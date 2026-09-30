import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'xxx-xxx-xxx' })
  subscriptionStatusId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'monthly' })
  billingCycle: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: 'Basic' })
  subscriptionName: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  @ApiProperty({
    example: 30,
    required: false,
    minimum: 0,
    maximum: 100000,
  })
  trialDays?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    example: 1500,
    minimum: 0,
  })
  amount: number;

  @IsUUID('4', { each: true })
  @ApiProperty({
    example: ['xxx-xxx-xxx', 'xxx-xxx-xxx'],
    type: [String],
  })
  subscriptionFeatures: string[];
}
