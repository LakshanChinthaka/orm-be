import { defineEntity, p } from '@mikro-orm/postgresql';

const industryTypeSchema = defineEntity({
  name: 'IndustryType',
  tableName: 'industry_type',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('industry_id')
      .defaultRaw('gen_random_uuid()'),
    industryType: p.string().length(100).unique().fieldName('industry_name'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class IndustryType extends industryTypeSchema.class {}
industryTypeSchema.setClass(IndustryType);
