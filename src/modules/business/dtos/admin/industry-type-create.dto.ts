import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IndustryTypeCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Retail',
    required: true,
  })
  industryType: string;
}
