import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const toTitleCase = (value: string) => {
  const normalized = value.trim().toLocaleLowerCase();

  return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
};

export class SubscriptionStatusDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? toTitleCase(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @ApiProperty({ example: 'active' })
  subscriptionStatus: string;
}
