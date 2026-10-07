import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class IndustryTypeFilterQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Basic' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({ required: false, example: false })
  isActive?: boolean;
}
