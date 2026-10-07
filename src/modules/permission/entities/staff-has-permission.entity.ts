import { defineEntity, p } from '@mikro-orm/postgresql';
import { Staff } from '../../staff/entities/staff.entity.js';
import { RolePermission } from './role-permission.entity.js';

const StaffHasPermissionSchema = defineEntity({
  name: 'StaffHasPermission',
  tableName: 'staff_has_permission',
  properties: {
    staffId: () =>
      p
        .manyToOne(Staff)
        .mapToPk()
        .primary()
        .joinColumn('staff_id')
        .deleteRule('cascade'),

    permissionId: () =>
      p
        .manyToOne(RolePermission)
        .mapToPk()
        .primary()
        .joinColumn('permission_id')
        .deleteRule('cascade'),

    // true = Explicitly Granted | false = Explicitly Revoked (Checkout)
    isGranted: p.boolean().default(true).fieldName('is_granted'),
  },
});

export class StaffHasPermission extends StaffHasPermissionSchema.class {}
StaffHasPermissionSchema.setClass(StaffHasPermission);
