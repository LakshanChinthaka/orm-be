import { SubscriptionPlanFeatureResponse } from '../common/subscription-plan-feature-response.dto.js';

export class AdminSubscriptionPlanPriceResponse {
  id: string;
  billingCycle: string;
  amount: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminSubscriptionPlanListResponse {
  id: string;
  subscriptionStatusId: string | null;
  subscriptionStatus: string | null;
  subscription: string | null;
  description: string;
  trialDays: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  subscriptionFeatures: SubscriptionPlanFeatureResponse[];
  prices: AdminSubscriptionPlanPriceResponse[];
}
