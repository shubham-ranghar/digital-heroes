import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Centered auth card on navy marketing background. */
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
      className="section-navy hero-glow flex flex-1 items-center justify-center px-4 py-12 sm:px-6"
    >
      <Card
        interactive={false}
        className={cn("w-full max-w-md border-line", className)}
      >
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="font-sans text-display-sm text-navy">
            {title}
          </CardTitle>
          <p className="text-sm text-slate">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        {footer ? (
          <div className="border-t border-line px-6 py-4 text-center text-sm text-slate">
            {footer}
          </div>
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
      <Link href={href} className="font-medium text-navy underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}
