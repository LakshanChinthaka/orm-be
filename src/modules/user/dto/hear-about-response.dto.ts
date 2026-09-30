import { ApiProperty } from '@nestjs/swagger';

export class HearAboutResponseDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxx' })
  id: string;

  @ApiProperty({ example: 'facebook' })
  hearAboutName: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-20-xxxxxx' })
  createdAt: Date;
}
