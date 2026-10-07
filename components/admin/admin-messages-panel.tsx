"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { AdminSection } from "@/components/admin/admin-section";
import { Button } from "@/components/ui/button";
import { markContactMessageResolvedAction } from "@/lib/contact/admin-actions";
import type { AdminContactMessage } from "@/lib/contact/admin-queries";

type AdminMessagesPanelProps = {
  messages: AdminContactMessage[];
};

export function AdminMessagesPanel({ messages }: AdminMessagesPanelProps) {
  const [isPending, startTransition] = useTransition();

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
      <AdminSection
        title="Contact messages"
        description="Inbound messages from the public contact form."
      />
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-[20px] border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy">{message.name}</p>
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
              <p className="mt-4 whitespace-pre-wrap text-sm text-navy">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
