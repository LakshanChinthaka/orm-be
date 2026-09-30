import { defineEntity, p } from '@mikro-orm/postgresql';
import { SubscriptionPlan } from './subscription-plan.entity.js';
import { SubscriptionFeature } from './subscription-feature.entity.js';

// Join table — no dedicated primary key in the current database, so both
// FK columns together form the entity's composite primary key here.
const SubscriptionHasFeatureSchema = defineEntity({
  name: 'SubscriptionHasFeature',
  tableName: 'subscription_has_feature',
  properties: {
    subscriptionPlanId: () =>
      p
        .manyToOne(SubscriptionPlan)
        .mapToPk()
        .primary()
        .joinColumn('subscription_plan_id')
        .deleteRule('cascade'),
    subscriptionFeatureId: () =>
      p
        .manyToOne(SubscriptionFeature)
        .mapToPk()
        .primary()
        .joinColumn('subscription_feature_id')
        .deleteRule('cascade'),
  },
});

export class SubscriptionHasFeature extends SubscriptionHasFeatureSchema.class {}
SubscriptionHasFeatureSchema.setClass(SubscriptionHasFeature);
