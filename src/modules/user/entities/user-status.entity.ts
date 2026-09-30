import { defineEntity, p } from '@mikro-orm/postgresql';

const UserStatusSchema = defineEntity({
  name: 'UserStatus',
  tableName: 'user_status',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('user_status_id')
      .defaultRaw('gen_random_uuid()'),
    userStatus: p.string().length(30).unique().fieldName('user_status'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class UserStatus extends UserStatusSchema.class {}
UserStatusSchema.setClass(UserStatus);
