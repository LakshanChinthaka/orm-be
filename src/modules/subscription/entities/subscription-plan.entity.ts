import { defineEntity, p } from '@mikro-orm/postgresql';
import { SubscriptionStatus } from './subscription-status.entity.js';

const SubscriptionPlanSchema = defineEntity({
  name: 'SubscriptionPlan',
  tableName: 'subscription_plan',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_plan_id')
      .defaultRaw('gen_random_uuid()'),
    subscriptionStatusId: () =>
      p
        .manyToOne(SubscriptionStatus)
        .mapToPk()
        .nullable()
        .joinColumn('subscription_status_id')
        .deleteRule('no action'),
    subscriptionName: p
      .string()
      .length(30)
      .unique()
      .fieldName('subscription_name'),
    trialDays: p
      .integer()
      .check('trial_days >= 0')
      .fieldName('trial_days'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class SubscriptionPlan extends SubscriptionPlanSchema.class {}
SubscriptionPlanSchema.setClass(SubscriptionPlan);
