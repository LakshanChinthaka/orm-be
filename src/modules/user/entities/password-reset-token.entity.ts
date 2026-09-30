import { defineEntity, p } from '@mikro-orm/postgresql';
import { AppUser } from './app-user.entity.js';

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
        .joinColumn('user_id')
        .deleteRule('cascade'),
    tokenHash: p.string().length(255).fieldName('token_hash'),
    isUsed: p.boolean().default(false).fieldName('is_used'),
    expiresAt: p.datetime().fieldName('expires_at'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class PasswordResetToken extends PasswordResetTokenSchema.class {}
PasswordResetTokenSchema.setClass(PasswordResetToken);
