import { defineEntity, p } from '@mikro-orm/postgresql';
import { Business } from './business.entity.js';

const businessMetaSchema = defineEntity({
  name: 'BusinessMeta',
  tableName: 'business_meta',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('business_meta_id')
      .defaultRaw('gen_random_uuid()'),
    businessId: () =>
      p
        .oneToOne(Business)
        .mapToPk()
        .joinColumn('business_id')
        .deleteRule('cascade'),
    taxId: p.string().length(100).nullable().fieldName('tax_id'),
    profileLink: p.string().length(500).nullable().fieldName('profile_link'),
    aboutUs: p.string().length(1000).nullable().fieldName('about_us'),
    isOperation: p.boolean().default(true).fieldName('is_operation'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class BusinessMeta extends businessMetaSchema.class {}
businessMetaSchema.setClass(BusinessMeta);
