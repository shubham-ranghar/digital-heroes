"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { AdminSection } from "@/components/admin/admin-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markContactMessageResolvedAction } from "@/lib/contact/admin-actions";
import type { AdminContactMessage } from "@/lib/contact/admin-queries";
import { Reveal } from "@/components/motion/reveal";
import { formatDateTimeLabel } from "@/lib/dates";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type AdminMessagesPanelProps = {
  messages: AdminContactMessage[];
};

type StatusFilter = "all" | "unresolved" | "resolved";

export function AdminMessagesPanel({ messages }: AdminMessagesPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  // The newest message still waiting on a reply is the page's navy surface.
  const focusId = messages.find((message) => !message.resolved)?.id;

  const visibleMessages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((message) => {
      if (status === "unresolved" && message.resolved) {
        return false;
      }
      if (status === "resolved" && !message.resolved) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return `${message.name} ${message.email} ${message.message}`
        .toLowerCase()
        .includes(needle);
    });
  }, [messages, query, status]);

  const isFiltered = query.trim().length > 0 || status !== "all";

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
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="relative max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search messages"
              className="pl-9"
            />
          </div>
          <div
            role="group"
            aria-label="Message status"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(
              [
                { value: "all", label: "All" },
                { value: "unresolved", label: "Unresolved" },
                { value: "resolved", label: "Resolved" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => setStatus(option.value)}
                className={cn(
                  "motion-interactive inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium",
                  status === option.value
                    ? "border-navy bg-navy text-cream"
                    : "border-line bg-surface text-navy hover:bg-sand/60",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

      {visibleMessages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {isFiltered
            ? "Nothing matches your search or filters."
            : "No messages yet. Inbound contact-form messages land here."}
        </p>
      ) : (
        <ul className="space-y-4">
          {visibleMessages.map((message) => {
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
                    {formatDateTimeLabel(message.createdAt)}
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

        <p
          className={cn("text-xs text-muted-foreground", tabularImpact)}
          aria-live="polite"
        >
          {isFiltered
            ? `${visibleMessages.length} of ${messages.length} ${messages.length === 1 ? "message" : "messages"}`
            : `${messages.length} ${messages.length === 1 ? "message" : "messages"}`}
        </p>
      </div>
      </Reveal>
    </div>
  );
}
