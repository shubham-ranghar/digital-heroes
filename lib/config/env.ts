import { hasSupabaseEnv } from "@/lib/supabase/env";

export function hasStripeEnv(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ID_MONTHLY &&
      process.env.STRIPE_PRICE_ID_YEARLY,
  );
}

export function hasAdminServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type AppConfigStatus = {
  supabase: boolean;
  stripe: boolean;
  serviceRole: boolean;
};

export function getAppConfigStatus(): AppConfigStatus {
  return {
    supabase: hasSupabaseEnv(),
    stripe: hasStripeEnv(),
    serviceRole: hasAdminServiceRole(),
  };
}
