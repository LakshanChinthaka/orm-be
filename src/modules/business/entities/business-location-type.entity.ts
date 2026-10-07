import { defineEntity, p } from '@mikro-orm/postgresql';

const businessLocationTypeSchema = defineEntity({
  name: 'BusinessLocationType',
  tableName: 'business_location_type',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('location_type_id')
      .defaultRaw('gen_random_uuid()'),
    locationType: p.string().length(100).unique().fieldName('location_type'),
    isActive: p.boolean().default(false).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class BusinessLocationType extends businessLocationTypeSchema.class {}
businessLocationTypeSchema.setClass(BusinessLocationType);
