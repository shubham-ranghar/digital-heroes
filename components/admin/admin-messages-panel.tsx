"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { AdminSection } from "@/components/admin/admin-section";
import { Button } from "@/components/ui/button";
import { markContactMessageResolvedAction } from "@/lib/contact/admin-actions";
import type { AdminContactMessage } from "@/lib/contact/admin-queries";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type AdminMessagesPanelProps = {
  messages: AdminContactMessage[];
};

export function AdminMessagesPanel({ messages }: AdminMessagesPanelProps) {
  const [isPending, startTransition] = useTransition();
  // The newest message still waiting on a reply is the page's navy surface.
  const focusId = messages.find((message) => !message.resolved)?.id;

  function handleResolve(id: string) {
    startTransition(async () => {
      try {
        await markContactMessageResolvedAction(id);
        toast.success("Marked resolved");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update message",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <Reveal trigger="mount" fast>
        <AdminSection
          title={<>Contact <em>messages</em></>}
          description="Inbound messages from the public contact form."
        />
      </Reveal>
      <Reveal trigger="mount" fast>
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => {
            const navy = message.id === focusId;
            return (
            <li
              key={message.id}
              data-nav-theme={navy ? "dark" : undefined}
              className={cn(
                "rounded-[20px] border p-5",
                navy ? "section-navy border-navy bg-navy" : "border-line bg-surface",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={cn("font-medium", navy ? "text-cream" : "text-navy")}>
                    {message.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>
                {message.resolved ? (
                  <span className="text-xs font-medium text-status-active">
                    Resolved
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => handleResolve(message.id)}
                  >
                    Mark resolved
                  </Button>
                )}
              </div>
              <p
                className={cn(
                  "mt-4 whitespace-pre-wrap text-sm",
                  navy ? "text-cream" : "text-navy",
                )}
              >
                {message.message}
              </p>
            </li>
            );
          })}
        </ul>
      )}
      </Reveal>
    </div>
  );
}
