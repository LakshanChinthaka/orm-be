import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserType } from '../../modules/auth/auth.service.js';
import { UserRole } from '../../modules/permission/entities/user-role.entity.js';

/**
 * Restricts a route to platform super admins. Must run after JwtAuthGuard.
 * Usage: @UseGuards(JwtAuthGuard, SuperAdminGuard)
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly em: EntityManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.userType === UserType.PLATFORM) {
      const role = await this.em.findOne(
        UserRole,
        { id: user.userRoleId },
        { fields: ['roleSlug'] },
      );

      if (role?.roleSlug === 'super_admin') return true;
    }

    throw new ForbiddenException('Only super admins can access this resource');
  }
}
