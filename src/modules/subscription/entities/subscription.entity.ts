import { defineEntity, p } from '@mikro-orm/postgresql';
import { AppUser } from '../../user/entities/app-user.entity.js';
import { SubscriptionPlanPrice } from '../../subscription-plan/entities/subscription-plan-price.entity.js';
import { PaymentMethod } from '../../payment/entities/payment-method.entity.js';
import { Business } from '../../business/entities/business.entity.js';

const subscriptionSchema = defineEntity({
  name: 'Subscription',
  tableName: 'subscription',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('subscription_id')
      .defaultRaw('gen_random_uuid()'),
    userId: () =>
      p
        .oneToOne(AppUser)
        .mapToPk()
        .joinColumn('user_id')
        .deleteRule('no action'),
    subscriptionPlanPriceId: () =>
      p
        .manyToOne(SubscriptionPlanPrice)
        .mapToPk()
        .joinColumn('subscription_plan_price_id')
        .deleteRule('no action'),
    paymentMethodId: () =>
      p
        .manyToOne(PaymentMethod)
        .mapToPk()
        .joinColumn('payment_method_id')
        .deleteRule('no action'),
    trialStartAt: p.datetime().nullable().fieldName('trial_start_at'),
    trialEndAt: p.datetime().nullable().fieldName('trial_end_at'),
    billingStartAt: p.datetime().fieldName('billing_start_at'),
    nextBillingDate: p.datetime().fieldName('next_billing_date'),
    lastBillingDate: p.datetime().nullable().fieldName('last_billing_date'),
    cancelledAt: p.datetime().nullable().fieldName('cancelled_at'),
    pausedUntil: p.datetime().nullable().fieldName('paused_until'),
    lastPayAmount: p
      .decimal()
      .precision(12)
      .scale(2)
      .nullable()
      .check('last_pay_amount >= 0')
      .fieldName('last_pay_amount'),
    displayId: p.string().length(20).unique().fieldName('display_id'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),

    businesses: () => p.oneToMany(Business).mappedBy('subscriptionId'),
  },
});

export class Subscription extends subscriptionSchema.class {}
subscriptionSchema.setClass(Subscription);
