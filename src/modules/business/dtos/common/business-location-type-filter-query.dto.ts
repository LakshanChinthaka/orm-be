import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessLocationTypeFilterQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Ware' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({ required: false, example: true })
  isActive?: boolean;
}
