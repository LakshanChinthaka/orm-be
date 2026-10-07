import { defineEntity, p } from '@mikro-orm/postgresql';
import { UserRole } from '../../permission/entities/user-role.entity.js';
import { Business } from '../../business/entities/business.entity.js';

const staffSchema = defineEntity({
  name: 'Staff',
  tableName: 'staff',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('staff_id')
      .defaultRaw('gen_random_uuid()'),
    userRoleId: () =>
      p.manyToOne(UserRole).mapToPk().joinColumn('user_role_id'),
    businessId: () =>
      p
        .manyToOne(Business)
        .mapToPk()
        .joinColumn('business_id')
        .deleteRule('no action'),
    displayId: p.string().length(20).unique().fieldName('display_id'),
    businessRole: p.string().length(150).fieldName('business_role'),
    staffName: p.string().length(150).nullable().fieldName('staff_name'),
    staffEmail: p.string().length(255).nullable().fieldName('staff_email'),
    username: p.string().length(100).unique().fieldName('username'),
    hashPassword: p.string().length(255).fieldName('hash_password'),
    contactNo: p.string().length(50).fieldName('staff_contact_no'),
    isActive: p.boolean().default(false).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),
  },
});

export class Staff extends staffSchema.class {}
staffSchema.setClass(Staff);
