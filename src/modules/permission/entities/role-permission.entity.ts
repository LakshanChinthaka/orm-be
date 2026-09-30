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
    permissionName: p.string().length(50).unique().fieldName('permission_name'),
    permissionModule: p
      .string()
      .length(50)
      .unique()
      .fieldName('permission_module'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class RolePermission extends RolePermissionSchema.class {}
RolePermissionSchema.setClass(RolePermission);
