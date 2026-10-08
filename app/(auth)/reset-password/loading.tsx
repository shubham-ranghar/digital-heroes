import { AuthShell } from "@/components/auth/auth-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordLoading() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Use at least eight characters. You will stay signed in after updating."
    >
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </AuthShell>
  );
}
