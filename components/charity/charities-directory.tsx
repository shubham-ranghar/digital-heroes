"use client";

import { useMemo, useState } from "react";

import { CharityCard } from "@/components/charity/charity-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Charity } from "@/lib/charity/types";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type CharitiesDirectoryProps = {
  charities: Charity[];
};

const ALL_CATEGORIES = "all";

export function CharitiesDirectory({ charities }: CharitiesDirectoryProps) {
  const [query, setQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const categoriesInUse = useMemo(() => {
    const set = new Set<string>();
    for (const charity of charities) {
      if (charity.category) {
        set.add(charity.category);
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [charities]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return charities.filter((charity) => {
      if (featuredOnly && !charity.is_featured) {
        return false;
      }
      if (category !== ALL_CATEGORIES && charity.category !== category) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const haystack = `${charity.name} ${charity.description ?? ""} ${charity.slug} ${charity.category ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [charities, query, featuredOnly, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
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
          <div className="w-full space-y-2 sm:w-56">
            <label htmlFor="charity-category" className="text-sm font-medium text-foreground">
              Category
            </label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? ALL_CATEGORIES)}
            >
              <SelectTrigger id="charity-category" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categoriesInUse.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFeaturedOnly((value) => !value)}
          className={cn(
            "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors sm:w-auto",
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

      {categoriesInUse.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(ALL_CATEGORIES)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              category === ALL_CATEGORIES
                ? "border-coral bg-coral/15 text-navy"
                : "border-line text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categoriesInUse.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                category === item
                  ? "border-coral bg-coral/15 text-navy"
                  : "border-line text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Showing <span className="tabular-impact">{filtered.length}</span> of{" "}
        {charities.length} partners
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No charities match your search. Try a different term or clear filters.
        </p>
      ) : (
        <RevealStagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((charity) => (
            <RevealStaggerItem key={charity.id} as="li">
              <CharityCard charity={charity} />
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      )}
    </div>
  );
}
