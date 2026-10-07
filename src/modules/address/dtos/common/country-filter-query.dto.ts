import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CountryFilterQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Sri' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({ required: false, example: true })
  isActive?: boolean;
}
