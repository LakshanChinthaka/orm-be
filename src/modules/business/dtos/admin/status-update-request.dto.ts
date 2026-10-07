import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StatusUpdateRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ example: false, required: true })
  isActive: boolean;
}
