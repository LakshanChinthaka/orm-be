import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminHearAboutRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @ApiProperty({ example: 'facebook' })
  hearAboutName: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  isActive?: boolean;
}
