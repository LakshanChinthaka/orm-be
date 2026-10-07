/**
 * Sample data for testing roles & permissions (dev only).
 * Idempotent: every insert is an upsert on its unique key, so it is safe to re-run.
 *
 * Run: pnpm db:seed:permissions
 *
 * Test accounts (password for all: Test@123#):
 *   PLATFORM superadmin@test.com        super_admin    -> bypasses every check
 *   PLATFORM owner@test.com             business_owner -> all permissions
 *   STAFF    manager@test.com           store_manager  -> orders:*, inventory:*, staff:read, reports:read
 *   STAFF    cashier@test.com           cashier        -> orders:create, orders:read
 *   STAFF    cashier.revoked@test.com   cashier        -> orders:read REVOKED via staff override
 *   STAFF    cashier.granted@test.com   cashier        -> + reports:read GRANTED via staff override
 *   STAFF    viewer@test.com            viewer         -> no permissions at all
 */
import { MikroORM } from '@mikro-orm/postgresql';
import * as argon2 from 'argon2';
import config from '../core/db/mikro-orm.config.js';
import { UserRole } from '../modules/permission/entities/user-role.entity.js';
import { RolePermission } from '../modules/permission/entities/role-permission.entity.js';
import { RoleHasPermission } from '../modules/permission/entities/role-has-permission.entity.js';
import { StaffHasPermission } from '../modules/permission/entities/staff-has-permission.entity.js';
import { Staff } from '../modules/staff/entities/staff.entity.js';
import { AppUser } from '../modules/user/entities/app-user.entity.js';
import { Business } from '../modules/business/entities/business.entity.js';

const PASSWORD = 'Test@123#';

const ROLES = [
  { roleSlug: 'super_admin', userRole: 'Super Admin' },
  { roleSlug: 'business_owner', userRole: 'Business Owner' },
  { roleSlug: 'store_manager', userRole: 'Store Manager' },
  { roleSlug: 'cashier', userRole: 'Cashier' },
  { roleSlug: 'viewer', userRole: 'Viewer' },
];

const PERMISSIONS = [
  'orders:create',
  'orders:read',
  'orders:update',
  'orders:refund',
  'inventory:read',
  'inventory:update',
  'staff:create',
  'staff:read',
  'staff:update',
  'reports:read',
];

// role slug -> permission names
const ROLE_PERMISSIONS: Record<string, string[]> = {
  business_owner: PERMISSIONS,
  store_manager: [
    'orders:create',
    'orders:read',
    'orders:update',
    'orders:refund',
    'inventory:read',
    'inventory:update',
    'staff:read',
    'reports:read',
  ],
  cashier: ['orders:create', 'orders:read'],
  viewer: [],
};

const PLATFORM_USERS = [
  {
    email: 'superadmin@test.com',
    name: 'Test Super Admin',
    role: 'super_admin',
  },
  {
    email: 'owner@test.com',
    name: 'Test Business Owner',
    role: 'business_owner',
  },
];

const STAFF = [
  {
    displayId: 'STF-TEST-001',
    username: 'manager@test.com',
    name: 'Test Manager',
    role: 'store_manager',
  },
  {
    displayId: 'STF-TEST-002',
    username: 'cashier@test.com',
    name: 'Test Cashier',
    role: 'cashier',
  },
  {
    displayId: 'STF-TEST-003',
    username: 'cashier.revoked@test.com',
    name: 'Test Cashier Revoked',
    role: 'cashier',
  },
  {
    displayId: 'STF-TEST-004',
    username: 'cashier.granted@test.com',
    name: 'Test Cashier Granted',
    role: 'cashier',
  },
  {
    displayId: 'STF-TEST-005',
    username: 'viewer@test.com',
    name: 'Test Viewer',
    role: 'viewer',
  },
];

// staff username -> { permission name: isGranted }
const STAFF_OVERRIDES: Record<string, Record<string, boolean>> = {
  'cashier.revoked@test.com': { 'orders:read': false },
  'cashier.granted@test.com': { 'reports:read': true },
};

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    await em.transactional(async (tx) => {
      // Staff and platform users need existing parent rows; reuse what is already in the DB
      const business = await tx.findOne(
        Business,
        { deletedAt: null },
        { orderBy: { createdAt: 'asc' } },
      );
      const templateUser = await tx.findOne(
        AppUser,
        { deletedAt: null },
        { orderBy: { createdAt: 'asc' } },
      );
      if (!business || !templateUser) {
        throw new Error(
          'Seed requires at least one business and one app_user. Register a user first.',
        );
      }

      const roles = await tx.upsertMany(UserRole, ROLES, {
        onConflictFields: ['roleSlug'],
      });
      const roleIdBySlug = new Map(roles.map((r) => [r.roleSlug, r.id]));

      const permissions = await tx.upsertMany(
        RolePermission,
        PERMISSIONS.map((name) => ({
          permissionName: name,
          permissionModule: name.split(':')[0],
        })),
        { onConflictFields: ['permissionName'] },
      );
      const permissionIdByName = new Map(
        permissions.map((p) => [p.permissionName, p.id]),
      );

      const roleHasPermissions = Object.entries(ROLE_PERMISSIONS).flatMap(
        ([slug, names]) =>
          names.map((name) => ({
            userRoleId: roleIdBySlug.get(slug)!,
            permissionId: permissionIdByName.get(name)!,
          })),
      );
      await tx.upsertMany(RoleHasPermission, roleHasPermissions, {
        onConflictFields: ['userRoleId', 'permissionId'],
        onConflictAction: 'ignore',
      });

      const hashPassword = await argon2.hash(PASSWORD, {
        type: argon2.argon2id,
      });

      await tx.upsertMany(
        AppUser,
        PLATFORM_USERS.map((u) => ({
          userEmail: u.email,
          userName: u.name,
          userRoleId: roleIdBySlug.get(u.role)!,
          subscriptionPlanId: templateUser.subscriptionPlanId,
          userStatusId: templateUser.userStatusId,
          referralCode: 'TESTSEED',
          hashPassword,
          isActive: true,
        })),
        { onConflictFields: ['userEmail'] },
      );

      const staff = await tx.upsertMany(
        Staff,
        STAFF.map((s) => ({
          displayId: s.displayId,
          username: s.username,
          staffName: s.name,
          staffEmail: s.username,
          businessRole: s.name.replace('Test ', ''),
          contactNo: '0770000000',
          userRoleId: roleIdBySlug.get(s.role)!,
          businessId: business.id,
          hashPassword,
          isActive: true,
        })),
        { onConflictFields: ['username'] },
      );
      const staffIdByUsername = new Map(staff.map((s) => [s.username, s.id]));

      const staffOverrides = Object.entries(STAFF_OVERRIDES).flatMap(
        ([username, overrides]) =>
          Object.entries(overrides).map(([name, isGranted]) => ({
            staffId: staffIdByUsername.get(username)!,
            permissionId: permissionIdByName.get(name)!,
            isGranted,
          })),
      );
      await tx.upsertMany(StaffHasPermission, staffOverrides, {
        onConflictFields: ['staffId', 'permissionId'],
      });

      console.log(
        `Seeded ${roles.length} roles, ${permissions.length} permissions, ` +
          `${roleHasPermissions.length} role permissions, ${PLATFORM_USERS.length} platform users, ` +
          `${staff.length} staff, ${staffOverrides.length} staff overrides (business: ${business.businessName}).`,
      );
    });
  } finally {
    await orm.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
