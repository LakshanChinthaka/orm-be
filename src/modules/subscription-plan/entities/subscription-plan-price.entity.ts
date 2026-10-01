import { defineEntity, p } from '@mikro-orm/postgresql';
import { SubscriptionPlan } from './subscription-plan.entity.js';

const SubscriptionPlanPriceSchema = defineEntity({
  name: 'SubscriptionPlanPrice',
  tableName: 'subscription_plan_price',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_plan_price_id')
      .defaultRaw('gen_random_uuid()'),
    subscriptionPlan: () =>
      p
        .manyToOne(SubscriptionPlan)
        .nullable()
        .joinColumn('subscription_plan_id')
        .deleteRule('no action'),
    amount: p
      .decimal()
      .precision(12)
      .scale(2)
      .check('amount >= 0')
      .fieldName('amount'),

    billingCycle: p
      .string()
      .length(30)
      .default('monthly')
      .fieldName('billing_cycle'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class SubscriptionPlanPrice extends SubscriptionPlanPriceSchema.class {}
SubscriptionPlanPriceSchema.setClass(SubscriptionPlanPrice);
