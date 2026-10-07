"use client";

import { useSyncExternalStore } from "react";

function subscribeClientMounted(onChange: () => void) {
  onChange();
  return () => undefined;
}

/** True after hydration on the client; false during SSR. */
export function useClientMounted(): boolean {
  return useSyncExternalStore(
    subscribeClientMounted,
    () => true,
    () => false,
  );
}
