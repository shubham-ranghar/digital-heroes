import Link from "next/link";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Centered auth card below the fixed site header. */
export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <section
      data-nav-theme="dark"
      className="section-navy hero-glow flex min-h-dvh flex-1 flex-col items-center justify-center px-4 py-6 pt-[var(--header-height)] sm:px-6"
    >
      <Card
        interactive={false}
        className={cn(
          "tone-surface w-full max-w-md rounded-3xl border border-line bg-cream text-navy shadow-[0_12px_40px_rgba(20,33,61,0.12)] [--card-spacing:--spacing(7)]",
          className,
        )}
      >
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="font-serif text-[clamp(1.75rem,1.2vw+1.5rem,2.25rem)] leading-tight font-normal text-navy">
            {title}
          </CardTitle>
          <p className="text-sm text-slate">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        {footer ? (
          <CardFooter className="justify-center bg-cream py-4 text-center text-sm text-slate">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </section>
  );
}

export function AuthSwitchLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p>
      {prompt}{" "}
      <Link href={href} className="auth-inline-link font-medium">
        {label}
      </Link>
    </p>
  );
}
