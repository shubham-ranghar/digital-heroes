"use client";

import { useMemo, useState } from "react";

import { CharityCard } from "@/components/charity/charity-card";
import { Input } from "@/components/ui/input";
import type { Charity } from "@/lib/charity/types";
import { cn } from "@/lib/utils";

type CharitiesDirectoryProps = {
  charities: Charity[];
};

export function CharitiesDirectory({ charities }: CharitiesDirectoryProps) {
  const [query, setQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return charities.filter((charity) => {
      if (featuredOnly && !charity.is_featured) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const haystack = `${charity.name} ${charity.description ?? ""} ${charity.slug}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [charities, query, featuredOnly]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md flex-1 space-y-2">
          <label htmlFor="charity-search" className="text-sm font-medium text-foreground">
            Search charities
          </label>
          <Input
            id="charity-search"
            type="search"
            placeholder="Name or cause…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setFeaturedOnly((value) => !value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
            featuredOnly
              ? "border-status-active/50 bg-status-active/20 text-navy"
              : "border-line text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              featuredOnly ? "bg-status-active" : "bg-slate/30",
            )}
            aria-hidden
          />
          Featured only
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="tabular-impact">{filtered.length}</span> of{" "}
        {charities.length} partners
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No charities match your search. Try a different term or clear filters.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((charity) => (
            <li key={charity.id}>
              <CharityCard charity={charity} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
