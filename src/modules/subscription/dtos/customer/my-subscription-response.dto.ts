export type SubscriptionStatus = 'trialing' | 'active' | 'paused' | 'cancelled';

export class MySubscriptionResponseDto {
  id: string;
  displayId: string;
  status: SubscriptionStatus;
  plan: { id: string; name: string | null; description: string };
  price: { id: string; billingCycle: string; amount: string };
  features: { id: string; name: string }[];
  trialStartAt: Date | null;
  trialEndAt: Date | null;
  /** Whole days left in the trial (0 once it has ended or if there is none). */
  trialDaysLeft: number;
  billingStartAt: Date;
  nextBillingDate: Date;
}
