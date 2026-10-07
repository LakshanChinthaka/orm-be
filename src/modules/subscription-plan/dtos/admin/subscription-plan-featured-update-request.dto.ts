import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanFeaturedUpdateRequestDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  isFeatured: boolean;
}
