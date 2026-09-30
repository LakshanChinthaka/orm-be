import { defineEntity, p } from '@mikro-orm/postgresql';
import { RolePermission } from './role-permission.entity.js';
import { UserRole } from './user-role.entity.js';

// Join table — the current database has no dedicated primary key on this
// table (just the two FK columns), so both FKs together form the entity's
// composite primary key here.
const RoleHasPermissionSchema = defineEntity({
  name: 'RoleHasPermission',
  tableName: 'role_has_permission',
  properties: {
    permissionId: () =>
      p
        .manyToOne(RolePermission)
        .mapToPk()
        .primary()
        .joinColumn('permission_id')
        .deleteRule('cascade'),
    userRoleId: () =>
      p
        .manyToOne(UserRole)
        .mapToPk()
        .primary()
        .joinColumn('user_role_id')
        .deleteRule('cascade'),
  },
});

export class RoleHasPermission extends RoleHasPermissionSchema.class {}
RoleHasPermissionSchema.setClass(RoleHasPermission);
