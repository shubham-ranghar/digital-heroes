import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UpgradePromptProps = {
  title?: string;
  description?: string;
};

/** Shown when a logged-in member has no active subscription. */
export function UpgradePrompt({
  title = "Unlock full membership",
  description = "Subscribe to enter monthly draws, log scores, and put your charity share to work.",
}: UpgradePromptProps) {
  return (
    <Card className="border-coral/30 bg-surface/80">
      <CardHeader>
        <CardTitle className="text-navy">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate">{description}</p>
        <Button render={<Link href="/subscribe" />}>View plans</Button>
      </CardContent>
    </Card>
  );
}
