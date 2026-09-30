import { ApiProperty } from '@nestjs/swagger';

export class UserStatusResponseDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxx'})
  id: string;

  @ApiProperty({ example: 'active'})
  userStatus: string;

  @ApiProperty({ example: 'true' })
  isActive: boolean;

  @ApiProperty({ example: '2024-20-xxxxxx'})
  createdAt: Date;
}


