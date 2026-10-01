import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PriceInputDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['monthly', 'yearly', 'quarterly'], {
    message: 'billingCycle must be either monthly, yearly, or quarterly',
  })
  @ApiProperty({
    example: 'monthly',
    enum: ['monthly', 'yearly', 'quarterly'],
  })
  billingCycle: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty({ example: 29.99 })
  amount: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty({
    example: 35.99,
    required: false,
  })
  originalAmount?: number;
}
