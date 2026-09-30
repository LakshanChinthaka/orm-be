import { defineEntity, p } from '@mikro-orm/postgresql';

const UserRoleSchema = defineEntity({
  name: 'UserRole',
  tableName: 'user_role',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('user_role_id')
      .defaultRaw('gen_random_uuid()'),
    userRole: p.string().length(40).unique().fieldName('user_role'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class UserRole extends UserRoleSchema.class {}
UserRoleSchema.setClass(UserRole);
