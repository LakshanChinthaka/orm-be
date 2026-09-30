import { Injectable, ConflictException } from '@nestjs/common';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/postgresql';
import { UserRole } from './entities/user-role.entity.js';
import { UserRoleRequestDto } from './dto/user-role-request.dto.js';
import { UserRoleResponseDto } from './dto/user-role-response.dto.js';

@Injectable()
export class PermissionService {
  constructor(private readonly em: EntityManager) {}

  // user status
  async createUserPermission(
    dto: UserRoleRequestDto,
  ): Promise<UserRoleRequestDto> {
    try {
      const newStatus = this.em.create(UserRole, {
        userRole: dto.userRole,
      });
      await this.em.flush();

      return newStatus;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `User status ${dto.userRole} already exists`,
        );
      }
      throw e;
    }
  }

  // user status
  async findAllUserStatus(): Promise<UserRoleResponseDto[]> {
    return this.em.findAll(UserRole);
  }
}
