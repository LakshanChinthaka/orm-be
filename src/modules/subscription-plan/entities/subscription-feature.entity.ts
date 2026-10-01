import { defineEntity, p } from '@mikro-orm/postgresql';

const SubscriptionFeatureSchema = defineEntity({
  name: 'SubscriptionFeature',
  tableName: 'subscription_feature',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_feature_id')
      .defaultRaw('gen_random_uuid()'),
    subscriptionFeature: p
      .string()
      .length(200)
      .fieldName('subscription_feature_name'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),
  },
});

export class SubscriptionFeature extends SubscriptionFeatureSchema.class {}
SubscriptionFeatureSchema.setClass(SubscriptionFeature);
