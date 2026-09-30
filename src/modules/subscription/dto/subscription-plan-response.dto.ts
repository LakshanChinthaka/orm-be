export class SubscriptionPlanResponse {
  id: string;
  subscriptionStatusId: string | null;
  subscriptionName: string;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
  price: {
    id: string;
    billingCycle: string;
    amount: string;
  };
  subscriptionFeatures: string[];
}
