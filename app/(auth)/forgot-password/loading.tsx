import { AuthShell } from "@/components/auth/auth-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordLoading() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we will send a secure link to choose a new password."
    >
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </AuthShell>
  );
}
