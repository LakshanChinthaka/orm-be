import { defineEntity, p } from '@mikro-orm/postgresql';
import { Address } from '../../address/entities/address.entity.js';
import { BusinessLocationType } from './business-location-type.entity.js';
import { Business } from './business.entity.js';

const businessLocationSchema = defineEntity({
  name: 'BusinessLocation',
  tableName: 'business_location',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('business_location_id')
      .defaultRaw('gen_random_uuid()'),
    locationTypeId: () =>
      p
        .manyToOne(BusinessLocationType)
        .mapToPk()
        .joinColumn('location_type_id')
        .deleteRule('no action'),
    businessId: () =>
      p
        .manyToOne(Business)
        .mapToPk()
        .joinColumn('business_id')
        .deleteRule('no action'),
    addressId: () =>
      p
        .oneToOne(Address)
        .owner()
        .nullable()
        .mapToPk()
        .joinColumn('address_id')
        .deleteRule('set null'),
    displayId: p.string().length(20).unique().fieldName('display_id'),
    locationName: p.string().length(150).fieldName('location_name'),
    businessEmail: p
      .string()
      .length(255)
      .nullable()
      .fieldName('business_location_email'),
    businessLocationContactNo: p
      .string()
      .length(50)
      .nullable()
      .fieldName('business_location_contact_no'),
    isActive: p.boolean().default(false).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),
  },
});

export class BusinessLocation extends businessLocationSchema.class {}
businessLocationSchema.setClass(BusinessLocation);
