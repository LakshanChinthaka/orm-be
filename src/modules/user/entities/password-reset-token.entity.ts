import { defineEntity, p } from '@mikro-orm/postgresql';
import { AppUser } from './app-user.entity.js';
import { Staff } from '../../staff/entities/staff.entity.js';
// import { Staff } from '../../staff/entities/staff.entity.js';

const PasswordResetTokenSchema = defineEntity({
  name: 'PasswordResetToken',
  tableName: 'password_reset_token',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('reset_token_id')
      .defaultRaw('gen_random_uuid()'),
    userId: () =>
      p
        .manyToOne(AppUser)
        .mapToPk()
        .nullable()
        .joinColumn('user_id')
        .deleteRule('cascade'),
    staffId: () =>
      p
        .manyToOne(Staff)
        .mapToPk()
        .nullable()
        .joinColumn('staff_id')
        .deleteRule('cascade'),
    userType: p.string().length(20).fieldName('user_type'), // 'PLATFORM' | 'STAFF'
    tokenHash: p.string().length(255).fieldName('token_hash'),
    isUsed: p.boolean().default(false).fieldName('is_used'),
    expiresAt: p.datetime().fieldName('expires_at'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class PasswordResetToken extends PasswordResetTokenSchema.class {}
PasswordResetTokenSchema.setClass(PasswordResetToken);
