import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator.js';
import { UserType } from '../../modules/auth/auth.service.js';
import { RoleHasPermission } from '../../modules/permission/entities/role-has-permission.entity.js';
import { StaffHasPermission } from '../../modules/permission/entities/staff-has-permission.entity.js';
import { RolePermission } from '../../modules/permission/entities/role-permission.entity.js';
import { UserRole } from '../../modules/permission/entities/user-role.entity.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract required permissions attached via @Permissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Route is public or requires no specific permissions
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    // 2. Retrieve authenticated payload attached by JwtAuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    console.log({ requiredPermissions, user });
    // 3. WILDCARD BYPASS: Platform Super Admin bypasses all granular checks
    if (
      user.userType === UserType.PLATFORM &&
      (await this.isSuperAdmin(user.userRoleId))
    )
      return true;

    // 4. Resolve active permissions based on actor type
    let effectivePermissions: Set<string>;

    if (user.userType === UserType.STAFF) {
      // Option B: Staff permissions (Base Role + Direct Overrides)
      effectivePermissions = await this.resolveStaffPermissions(
        user.sub, // staffId
        user.userRoleId,
      );
    } else {
      // Platform AppUsers (Business Owners, System Operators)
      effectivePermissions = await this.resolveRolePermissions(user.userRoleId);
    }

    // 5. Enforce required permission checks
    const hasAllPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Forbidden resource: You do not have sufficient permissions to execute this action',
      );
    }

    return true;
  }

  /**
   * Resolves base permissions assigned to a global role
   */
  private async resolveRolePermissions(
    userRoleId: string,
  ): Promise<Set<string>> {
    const roleMappings = await this.em.find(RoleHasPermission, {
      userRoleId,
    });

    const names = await this.resolvePermissionNames(
      roleMappings.map((mapping) => mapping.permissionId),
    );
    return new Set<string>(names.values());
  }

  private async isSuperAdmin(userRoleId: string): Promise<boolean> {
    const role = await this.em.findOne(
      UserRole,
      { id: userRoleId },
      { fields: ['roleSlug'] },
    );
    return role?.roleSlug === 'super_admin';
  }

  /**
   * Maps permission ids to permission names.
   * permissionId relations use mapToPk(), so populate only yields the raw id.
   */
  private async resolvePermissionNames(
    permissionIds: string[],
  ): Promise<Map<string, string>> {
    if (permissionIds.length === 0) return new Map();

    const permissions = await this.em.find(
      RolePermission,
      { id: { $in: permissionIds } },
      { fields: ['permissionName'] },
    );
    return new Map(permissions.map((p) => [p.id, p.permissionName]));
  }

  /**
   * Resolves staff permissions using Option B:
   * 1. Start with Base Role permissions
   * 2. Apply Direct Staff Overrides (isGranted: true -> Add, isGranted: false -> Delete)
   */

  private async resolveStaffPermissions(
    staffId: string,
    userRoleId: string,
  ): Promise<Set<string>> {
    // Step A: Load base permissions from role_has_permission
    const effectivePermissions = await this.resolveRolePermissions(userRoleId);

    // Step B: Load direct staff overrides from staff_has_permission
    const staffOverrides = await this.em.find(StaffHasPermission, {
      staffId,
    });
    const overrideNames = await this.resolvePermissionNames(
      staffOverrides.map((override) => override.permissionId),
    );

    // Step C: Apply Owner's direct toggles ("Check and Checkout")
    for (const override of staffOverrides) {
      const permissionName = overrideNames.get(override.permissionId);
      if (!permissionName) continue;
      if (override.isGranted) {
        effectivePermissions.add(permissionName); // Explicit Grant
      } else {
        effectivePermissions.delete(permissionName); // Explicit Revoke/Checkout
      }
    }

    return effectivePermissions;
  }
}
