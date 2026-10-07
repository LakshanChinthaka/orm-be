import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessDetailQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({
    required: false,
    example: true,
    default: false,
    description: 'Include business meta data (tax ID, about us, ...)',
  })
  includeMeta?: boolean;
}
