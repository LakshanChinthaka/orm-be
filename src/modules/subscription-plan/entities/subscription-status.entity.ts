import { defineEntity, p } from '@mikro-orm/postgresql';

const SubscriptionStatusSchema = defineEntity({
  name: 'SubscriptionStatus',
  tableName: 'subscription_status',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_status_id')
      .defaultRaw('gen_random_uuid()'),
    subscriptionStatus: p
      .string()
      .length(30)
      .unique()
      .fieldName('subscription_status'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class SubscriptionStatus extends SubscriptionStatusSchema.class {}
SubscriptionStatusSchema.setClass(SubscriptionStatus);
