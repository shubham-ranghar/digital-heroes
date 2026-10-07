"use client";

import type Lenis from "lenis";
import { createContext, useContext } from "react";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  reduceMotion: boolean;
};

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  reduceMotion: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
