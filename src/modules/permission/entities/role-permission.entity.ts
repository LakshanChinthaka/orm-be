import { defineEntity, p } from '@mikro-orm/postgresql';

const RolePermissionSchema = defineEntity({
  name: 'RolePermission',
  tableName: 'role_permission',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('permission_id')
      .defaultRaw('gen_random_uuid()'),

    // e.g., "staff:create", "orders:refund", "inventory:read"
    permissionName: p
      .string()
      .length(100)
      .unique()
      .index('idx_permission_name')
      .fieldName('permission_name'),

    // e.g., "staff", "orders", "inventory" (NO UNIQUE CONSTRAIN HERE!)
    permissionModule: p
      .string()
      .length(50)
      .index('idx_permission_module')
      .fieldName('permission_module'),

    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class RolePermission extends RolePermissionSchema.class {}
RolePermissionSchema.setClass(RolePermission);
