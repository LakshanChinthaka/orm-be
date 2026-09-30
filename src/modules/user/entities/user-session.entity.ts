import { defineEntity, p } from '@mikro-orm/postgresql';
import { AppUser } from './app-user.entity.js';

const UserSessionSchema = defineEntity({
  name: 'UserSession',
  tableName: 'user_session',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('session_id')
      .defaultRaw('gen_random_uuid()'),
    userId: () =>
      p
        .manyToOne(AppUser)
        .mapToPk()
        .joinColumn('user_id')
        .deleteRule('cascade'),
    refreshTokenHash: p
      .string()
      .length(255)
      .fieldName('refresh_token_hash'),
    ipAddress: p.string().length(45).nullable().fieldName('ip_address'),
    userAgent: p.string().length(500).nullable().fieldName('user_agent'),
    isRevoked: p.boolean().default(false).fieldName('is_revoked'),
    expiresAt: p.datetime().fieldName('expires_at'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class UserSession extends UserSessionSchema.class {}
UserSessionSchema.setClass(UserSession);
