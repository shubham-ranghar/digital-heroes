import { Skeleton } from "@/components/ui/skeleton";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupLoading() {
  return (
    <AuthShell title="Join digital.HEROES" description="Loading signup…">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </AuthShell>
  );
}
