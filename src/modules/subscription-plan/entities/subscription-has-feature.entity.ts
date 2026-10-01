import { defineEntity, p } from '@mikro-orm/postgresql';
import { SubscriptionPlan } from './subscription-plan.entity.js';
import { SubscriptionFeature } from './subscription-feature.entity.js';

const SubscriptionHasFeatureSchema = defineEntity({
  name: 'SubscriptionHasFeature',
  tableName: 'subscription_has_feature',
  properties: {
    subscriptionPlan: () =>
      p
        .manyToOne(SubscriptionPlan)
        .primary()
        .joinColumn('subscription_plan_id')
        .deleteRule('cascade'),
    subscriptionFeature: () =>
      p
        .manyToOne(SubscriptionFeature)
        .primary()
        .joinColumn('subscription_feature_id')
        .deleteRule('cascade'),
  },
});

export class SubscriptionHasFeature
  extends SubscriptionHasFeatureSchema.class {}
SubscriptionHasFeatureSchema.setClass(SubscriptionHasFeature);
