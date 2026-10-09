"use client";

import { useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { AdminSection } from "@/components/admin/admin-section";
import { TablePagination } from "@/components/admin/table-pagination";
import {
  useAdminTableUrl,
  useDebouncedSearch,
} from "@/components/admin/use-admin-table-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE_SIZE, type AdminTableState } from "@/lib/admin/pagination";
import { markContactMessageResolvedAction } from "@/lib/contact/admin-actions";
import type { AdminContactMessage } from "@/lib/contact/admin-queries";
import { Reveal } from "@/components/motion/reveal";
import { formatDateTimeLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

type AdminMessagesPanelProps = {
  /** One page of messages, already searched and filtered by the server. */
  messages: AdminContactMessage[];
  table: AdminTableState;
  total: number;
};

export function AdminMessagesPanel({ messages, table, total }: AdminMessagesPanelProps) {
  const [isPending, startTransition] = useTransition();
  const url = useAdminTableUrl(table);
  const [query, setQuery] = useDebouncedSearch(table.q, (q) => url.navigate({ q }));
  const status = table.filters.status ?? "all";
  // The newest message on this page still waiting on a reply is the navy surface.
  const focusId = messages.find((message) => !message.resolved)?.id;

  const isFiltered = table.q.length > 0 || status !== "all";

  function setStatus(value: string) {
    url.navigate({
      filters: value === "all" ? {} : { status: value },
    });
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      const result = await markContactMessageResolvedAction(id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Marked resolved");
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

      {messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {isFiltered
            ? "Nothing matches your search or filters."
            : "No messages yet. Inbound contact-form messages land here."}
        </p>
      ) : (
        <ul
          aria-busy={url.isPending || undefined}
          className={cn("space-y-4 transition-opacity", url.isPending && "opacity-60")}
        >
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

        <TablePagination
          page={table.page}
          pageSize={ADMIN_PAGE_SIZE}
          total={total}
          noun={{ singular: "message", plural: "messages" }}
          hrefForPage={(page) => url.hrefFor({ page })}
        />
      </div>
      </Reveal>
    </div>
  );
}
