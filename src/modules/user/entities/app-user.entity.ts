import { defineEntity, p } from '@mikro-orm/postgresql';
import { UserRole } from '../../permission/entities/user-role.entity.js';
import { SubscriptionPlan } from '../../subscription-plan/entities/subscription-plan.entity.js';
import { HearAbout } from './hear-about.entity.js';
import { UserStatus } from './user-status.entity.js';

// `app_user_display_id_seq` already exists in the database (created by an
// earlier migration). It isn't modeled as an entity-level object here —
// only the column default below references it — so MikroORM's schema
// diffing never tries to manage the sequence itself.
const AppUserSchema = defineEntity({
  name: 'AppUser',
  tableName: 'app_user',
  properties: {
    id: p.uuid().primary().fieldName('user_id').defaultRaw('gen_random_uuid()'),
    userRoleId: () =>
      p.manyToOne(UserRole).mapToPk().joinColumn('user_role_id'),
    subscriptionPlanId: () =>
      p
        .manyToOne(SubscriptionPlan)
        .mapToPk()
        .joinColumn('subscription_plan_id')
        .deleteRule('set null'),
    hearAboutId: () =>
      p
        .manyToOne(HearAbout)
        .mapToPk()
        .nullable()
        .joinColumn('hear_about_id')
        .deleteRule('no action'),
    userStatusId: () =>
      p.manyToOne(UserStatus).mapToPk().joinColumn('user_status_id'),
    displayId: p
      .string()
      .length(50)
      .defaultRaw(
        `('USR-' || lpad(nextval('app_user_display_id_seq'::regclass)::text, 6, '0'))`,
      )
      // Postgres re-serializes this expression with explicit `::text` casts
      // when reporting it back, which would otherwise look like a permanent
      // diff on every future `migration:create` even though nothing changed.
      .ignoreSchemaChanges('default')
      .fieldName('display_id'),
    userName: p.string().length(100).fieldName('user_name'),
    userContactNo: p
      .string()
      .length(50)
      .nullable()
      .fieldName('user_contact_no'),
    userEmail: p
      .string()
      .length(255)
      .unique()
      .index('idx_app_user_email')
      .fieldName('user_email'),
    hashPassword: p.string().length(255).fieldName('hash_password'),
    referralCode: p.string().length(8).fieldName('referral_code'),
    profileLink: p.string().length(500).nullable().fieldName('profile_link'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),
  },

  indexes: [
    {
      name: 'idx_app_user_auth_lookup',
      properties: ['id', 'isActive', 'deletedAt'],
    },
  ],
});

export class AppUser extends AppUserSchema.class {}
AppUserSchema.setClass(AppUser);
