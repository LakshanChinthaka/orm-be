import {IsString,IsBoolean, IsNotEmpty,MaxLength,MinLength, IsOptional} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class UserStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({example: 'active'})
  userStatus: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}