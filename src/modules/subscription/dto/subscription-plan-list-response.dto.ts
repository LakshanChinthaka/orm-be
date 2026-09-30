export class SubscriptionPlanFeatureResponse {
  id: string;
  name: string;
}

export class SubscriptionPlanPriceResponse {
  id: string;
  billingCycle: string;
  amount: string;
}

export class SubscriptionPlanListResponse {
  id: string;
  subscriptionStatusId: string | null;
  subscriptionStatus: string | null;
  subscription: string;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
  subscriptionFeatures: SubscriptionPlanFeatureResponse[];
  prices: SubscriptionPlanPriceResponse[];
}
