import Link from "next/link";

import { EmptyPageState } from "@/components/ui/page-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="section-navy flex flex-1 items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-lg">
        <EmptyPageState
          title="Page not found"
          description="The link may be outdated or the page was moved."
          action={
            <Button render={<Link href="/" />}>Back to homepage</Button>
          }
        />
      </div>
    </div>
  );
}
