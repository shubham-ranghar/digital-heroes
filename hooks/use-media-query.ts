"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMediaQuerySnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

/** `matchMedia` subscription with a stable server snapshot of `false`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery(query, onChange),
    () => getMediaQuerySnapshot(query),
    () => false,
  );
}
