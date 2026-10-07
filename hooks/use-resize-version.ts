"use client";

import { useSyncExternalStore } from "react";

let resizeVersion = 0;
const resizeListeners = new Set<() => void>();

function subscribeResize(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onResize = () => {
    resizeVersion += 1;
    resizeListeners.forEach((listener) => listener());
  };

  window.addEventListener("resize", onResize);
  resizeListeners.add(onChange);

  return () => {
    window.removeEventListener("resize", onResize);
    resizeListeners.delete(onChange);
  };
}

function getResizeVersion(): number {
  return resizeVersion;
}

/** Increments when the window is resized (client-only). */
export function useResizeVersion(): number {
  return useSyncExternalStore(subscribeResize, getResizeVersion, () => 0);
}
