import { ApiProperty } from '@nestjs/swagger';

export class UserRoleResponseDto {
  @ApiProperty({ example: 'xxxx-xxxx-xxxx' })
  id: string;

  @ApiProperty({ example: 'admin' })
  userRole: string;

  @ApiProperty({ example: '2024-20-xxxxxx' })
  createdAt: Date;

  @ApiProperty({ example: '2024-20-xxxxxx' })
  updatedAt: Date;
}
