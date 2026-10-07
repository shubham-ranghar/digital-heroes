"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { auditFontFamilies } from "@/lib/dev/font-audit";

const WATCHED_PREFIXES = ["/", "/dashboard", "/admin"];

function shouldAuditPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }
  return WATCHED_PREFIXES.some(
    (prefix) => prefix !== "/" && pathname.startsWith(prefix),
  );
}

/**
 * Dev-only: logs unique computed font-family stacks on key surfaces.
 * Open the menu on "/" to include overlay nodes in the scan.
 */
export function FontFamilyAudit() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    if (!shouldAuditPath(pathname)) {
      return;
    }

    const run = () => {
      const menu = document.getElementById("site-menu");
      const { allowed, unexpected } = auditFontFamilies();
      const menuAudit = menu ? auditFontFamilies(menu) : { allowed: [], unexpected: [] };

      const allUnexpected = [...new Set([...unexpected, ...menuAudit.unexpected])];
      const label = `[font-audit] ${pathname}`;

      if (allUnexpected.length === 0) {
        console.info(label, "OK — Inter Tight / Instrument Serif only", {
          stacks: [...new Set([...allowed, ...menuAudit.allowed])],
        });
      } else {
        console.warn(label, "Unexpected font stacks:", allUnexpected);
      }
    };

    const id = window.setTimeout(run, 800);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "F" && event.shiftKey && event.ctrlKey) {
        const menu = document.getElementById("site-menu");
        const root = menu ?? document.body;
        const { unexpected } = auditFontFamilies(root);
        console.table(
          auditFontFamilies(root).allowed.map((stack) => ({ fontFamily: stack })),
        );
        if (unexpected.length) {
          console.warn("[font-audit] manual scan — unexpected:", unexpected);
        } else {
          console.info("[font-audit] manual scan — all stacks allowed");
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
