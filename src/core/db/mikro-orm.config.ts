import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { UserRole } from '../../modules/permission/entities/user-role.entity.js';
import { RolePermission } from '../../modules/permission/entities/role-permission.entity.js';
import { RoleHasPermission } from '../../modules/permission/entities/role-has-permission.entity.js';
import { SubscriptionStatus } from '../../modules/subscription-plan/entities/subscription-status.entity.js';
import { SubscriptionFeature } from '../../modules/subscription-plan/entities/subscription-feature.entity.js';
import { SubscriptionPlan } from '../../modules/subscription-plan/entities/subscription-plan.entity.js';
import { SubscriptionPlanPrice } from '../../modules/subscription-plan/entities/subscription-plan-price.entity.js';
import { SubscriptionHasFeature } from '../../modules/subscription-plan/entities/subscription-has-feature.entity.js';
import { UserStatus } from '../../modules/user/entities/user-status.entity.js';
import { HearAbout } from '../../modules/user/entities/hear-about.entity.js';
import { AppUser } from '../../modules/user/entities/app-user.entity.js';
import { UserSession } from '../../modules/user/entities/user-session.entity.js';
import { PasswordResetToken } from '../../modules/user/entities/password-reset-token.entity.js';
import { Subscription } from '../../modules/subscription/entities/subscription.entity.js';
import { Business } from '../../modules/business/entities/business.entity.js';
import { BusinessMeta } from '../../modules/business/entities/business-meta.entity.js';
import { IndustryType } from '../../modules/business/entities/industry-type.entity.js';
import { BusinessLocationType } from '../../modules/business/entities/business-location-type.entity.js';
import { BusinessLocation } from '../../modules/business/entities/business-location.entity.js';
import { PaymentMethod } from '../../modules/payment/entities/payment-method.entity.js';
import { Staff } from '../../modules/staff/entities/staff.entity.js';
import { StaffHasPermission } from '../../modules/permission/entities/staff-has-permission.entity.js';
import { Country } from '../../modules/address/entities/country.entity.js';
import { Address } from '../../modules/address/entities/address.entity.js';

// Each module owns its own `entities/*.entity.ts` files. This is just the
// wiring point that lists them all for the ORM — add a new entity here
// whenever a new module's entity file is created.
export const entities = [
  UserRole,
  RolePermission,
  RoleHasPermission,
  SubscriptionStatus,
  SubscriptionFeature,
  SubscriptionPlan,
  SubscriptionPlanPrice,
  SubscriptionHasFeature,
  UserStatus,
  HearAbout,
  AppUser,
  UserSession,
  PasswordResetToken,
  IndustryType,
  Business,
  BusinessMeta,
  BusinessLocationType,
  BusinessLocation,
  PaymentMethod,
  Subscription,
  Staff,
  StaffHasPermission,
  Country,
  Address,
];

export default defineConfig({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  dbName: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities,
  extensions: [Migrator],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
});
