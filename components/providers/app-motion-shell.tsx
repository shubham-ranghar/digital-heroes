"use client";

import { useState, type ReactNode } from "react";

import { IntroWipe } from "@/components/motion/intro-wipe";
import { RouteWipe } from "@/components/motion/route-wipe";
import { MenuOpenProvider, useMenuOpen } from "@/components/providers/menu-open-context";
import { MotionFeatures } from "@/components/providers/motion-features";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

function SmoothScrollWithMenu({
  paused,
  children,
}: {
  paused: boolean;
  children: ReactNode;
}) {
  const { menuOpen } = useMenuOpen();
  return (
    <SmoothScrollProvider paused={menuOpen || paused}>{children}</SmoothScrollProvider>
  );
}

export function AppMotionShell({ children }: { children: ReactNode }) {
  const [introPlaying, setIntroPlaying] = useState(false);

  return (
    <MotionFeatures>
      <MenuOpenProvider>
        {/* First in <body>, so its cover is parsed before any page content. */}
        <IntroWipe onPlayingChange={setIntroPlaying} />
        <SmoothScrollWithMenu paused={introPlaying}>{children}</SmoothScrollWithMenu>
        <RouteWipe />
      </MenuOpenProvider>
    </MotionFeatures>
  );
}
