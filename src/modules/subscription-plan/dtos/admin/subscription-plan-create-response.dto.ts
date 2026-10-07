export class SubscriptionPlanCreateResponse {
  id: string;
  subscriptionStatusId: string | null;
  subscriptionName: string | null;
  description: string;
  trialDays: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  prices: {
    id: string;
    billingCycle: string;
    amount: string;
  }[];
  subscriptionFeatures: string[];
}
