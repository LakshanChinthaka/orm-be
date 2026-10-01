import { defineEntity, p } from '@mikro-orm/postgresql';
import { IndustryType } from './industry-type.entity.js';
import { Subscription } from '../../subscription/entities/subscription.entity.js';

const businessSchema = defineEntity({
  name: 'Business',
  tableName: 'business',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('business_id')
      .defaultRaw('gen_random_uuid()'),
    industryTypeId: () =>
      p
        .manyToOne(IndustryType)
        .mapToPk()
        .joinColumn('industry_id')
        .deleteRule('no action'),
    subscriptionId: () =>
      p
        .manyToOne(Subscription)
        .mapToPk()
        .joinColumn('subscription_id')
        .deleteRule('no action'),
    displayId: p.string().length(20).unique().fieldName('display_id'),
    businessName: p.string().length(150).fieldName('business_name'),
    businessEmail: p
      .string()
      .length(255)
      .nullable()
      .fieldName('business_email'),
    businessContactNo: p
      .string()
      .length(50)
      .fieldName('business_contact_no'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),
  },
});

export class Business extends businessSchema.class {}
businessSchema.setClass(Business);
