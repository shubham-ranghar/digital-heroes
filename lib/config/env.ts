import { hasPaymentsEnv } from "@/lib/payments/env";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function hasAdminServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type AppConfigStatus = {
  supabase: boolean;
  payments: boolean;
  serviceRole: boolean;
};

export function getAppConfigStatus(): AppConfigStatus {
  return {
    supabase: hasSupabaseEnv(),
    payments: hasPaymentsEnv(),
    serviceRole: hasAdminServiceRole(),
  };
}
