import { defineEntity, p } from '@mikro-orm/postgresql';
import { SubscriptionStatus } from './subscription-status.entity.js';
import { SubscriptionPlanPrice } from './subscription-plan-price.entity.js';
import { SubscriptionHasFeature } from './subscription-has-feature.entity.js';

const SubscriptionPlanSchema = defineEntity({
  name: 'SubscriptionPlan',
  tableName: 'subscription_plan',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_plan_id')
      .defaultRaw('gen_random_uuid()'),

    subscriptionStatus: () =>
      p
        .manyToOne(SubscriptionStatus)
        .nullable()
        .joinColumn('subscription_status_id')
        .deleteRule('no action'),

    subscriptionName: p
      .string()
      .length(1000)
      .nullable()
      .fieldName('subscription_name'),

    description: p.string().length(30).fieldName('description'),

    trialDays: p.integer().check('trial_days >= 0').fieldName('trial_days'),

    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
    deletedAt: p.datetime().nullable().fieldName('deleted_at'),

    prices: () =>
      p.oneToMany(SubscriptionPlanPrice).mappedBy('subscriptionPlan'),

    subscriptionHasFeatures: () =>
      p.oneToMany(SubscriptionHasFeature).mappedBy('subscriptionPlan'),
  },
});

export class SubscriptionPlan extends SubscriptionPlanSchema.class {}
SubscriptionPlanSchema.setClass(SubscriptionPlan);
