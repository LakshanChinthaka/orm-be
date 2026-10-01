import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdminPlanFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'active' })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Basic' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({ required: false, example: false })
  includeInactive?: boolean;
}
