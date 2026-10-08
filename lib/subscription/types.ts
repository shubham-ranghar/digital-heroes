export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "lapsed"
  | "past_due";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  renewal_date: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};
