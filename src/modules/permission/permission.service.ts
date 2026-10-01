import { Injectable, ConflictException } from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { UserRole } from './entities/user-role.entity.js';
import { UserRoleRequestDto } from './dtos/index.js';
import { UserRoleResponseDto } from './dtos/index.js';

@Injectable()
export class PermissionService {
  constructor(private readonly em: EntityManager) {}

  // user status
  async createUserRole(dto: UserRoleRequestDto): Promise<UserRoleResponseDto> {
    try {
      const newRole = this.em.create(UserRole, {
        userRole: dto.userRole,
      });
      await this.em.flush();

      return newRole;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `User status ${dto.userRole} already exists`,
        );
      }
      throw e;
    }
  }

  // user role
  async findAllUserRole(): Promise<UserRoleResponseDto[]> {
    return this.em.findAll(UserRole);
  }
}
