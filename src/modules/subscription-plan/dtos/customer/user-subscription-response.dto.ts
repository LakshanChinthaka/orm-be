import { SubscriptionPlanFeatureResponse } from '../common/subscription-plan-feature-response.dto.js';

export class SubscriptionPlanPriceResponse {
  id: string;
  billingCycle: string;
  amount: string;
  isActive: boolean;
}

export class SubscriptionPlanListResponse {
  id: string;
  subscriptionStatusId: string | null;
  subscriptionStatus: string | null;
  subscription: string | null;
  description: string;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
  subscriptionFeatures: SubscriptionPlanFeatureResponse[];
  prices: SubscriptionPlanPriceResponse[];
}
