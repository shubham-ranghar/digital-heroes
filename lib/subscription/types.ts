export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "cancelled" | "lapsed";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
};
