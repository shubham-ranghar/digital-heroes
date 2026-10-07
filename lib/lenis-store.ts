import type Lenis from "lenis";

const listeners = new Set<() => void>();

let lenisSnapshot: Lenis | null = null;

export function getLenisSnapshot(): Lenis | null {
  return lenisSnapshot;
}

export function setLenisSnapshot(instance: Lenis | null) {
  lenisSnapshot = instance;
  listeners.forEach((listener) => listener());
}

export function subscribeLenis(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
