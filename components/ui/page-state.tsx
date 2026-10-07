import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
};

function PageStateShell({
  icon: Icon,
  title,
  description,
  className,
  action,
}: PageStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[20px] border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-coral/15 text-coral">
          <Icon className="size-6" aria-hidden />
        </div>
      ) : null}
      <h2 className="font-sans text-xl text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function EmptyPageState(props: Omit<PageStateProps, "icon">) {
  return <PageStateShell icon={Inbox} {...props} />;
}

export function ErrorPageState({
  title = "Something went wrong",
  description = "We could not load this page. Try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <PageStateShell
      icon={AlertTriangle}
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        ) : (
          <Button render={<Link href="/" />}>Back home</Button>
        )
      }
    />
  );
}

export function ConfigMissingState({
  missing,
}: {
  missing: ("supabase" | "stripe")[];
}) {
  const labels = missing.map((key) =>
    key === "supabase" ? "Supabase" : "Stripe",
  );

  return (
    <PageStateShell
      icon={WifiOff}
      title="Configuration incomplete"
      description={`Missing ${labels.join(" and ")} environment variables. Copy .env.example to .env.local and fill in the values, then restart the dev server.`}
      action={
        <Button variant="secondary" render={<Link href="/" />}>
          Home
        </Button>
      }
    />
  );
}
