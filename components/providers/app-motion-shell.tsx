"use client";

import type { ReactNode } from "react";

import { MenuOpenProvider, useMenuOpen } from "@/components/providers/menu-open-context";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

function SmoothScrollWithMenu({ children }: { children: ReactNode }) {
  const { menuOpen } = useMenuOpen();
  return <SmoothScrollProvider menuOpen={menuOpen}>{children}</SmoothScrollProvider>;
}

export function AppMotionShell({ children }: { children: ReactNode }) {
  return (
    <MenuOpenProvider>
      <SmoothScrollWithMenu>{children}</SmoothScrollWithMenu>
    </MenuOpenProvider>
  );
}
