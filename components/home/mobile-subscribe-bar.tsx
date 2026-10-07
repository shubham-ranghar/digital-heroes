"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MobileSubscribeBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-navy/95 p-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Button className="w-full" size="lg" render={<Link href="/subscribe" />}>
        Subscribe now
      </Button>
    </div>
  );
}
