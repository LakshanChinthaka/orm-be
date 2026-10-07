import { defineEntity, p } from '@mikro-orm/postgresql';
import { AppUser } from './app-user.entity.js';
import { Staff } from '../../staff/entities/staff.entity.js';

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
    refreshTokenHash: p
      .string()
      .length(255)
      .fieldName('refresh_token_hash')
      .index('idx_user_session_refresh_token_hash'),
    ipAddress: p.string().length(45).nullable().fieldName('ip_address'),
    userAgent: p.string().length(500).nullable().fieldName('user_agent'),
    isRevoked: p
      .boolean()
      .default(false)
      .fieldName('is_revoked')
      .index('idx_user_session_is_revoked'),
    expiresAt: p.datetime().fieldName('expires_at'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },

  indexes: [
    {
      name: 'idx_user_session_user_lookup',
      properties: ['userId', 'isRevoked'],
    },
    {
      name: 'idx_user_session_staff_lookup',
      properties: ['staffId', 'isRevoked'],
    },
  ],
});

export class UserSession extends UserSessionSchema.class {}
UserSessionSchema.setClass(UserSession);
