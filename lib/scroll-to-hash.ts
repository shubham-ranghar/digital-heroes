import type Lenis from "lenis";

export function getHashFromHref(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return null;
  }
  const hash = href.slice(hashIndex + 1);
  return hash.length > 0 ? hash : null;
}

export function scrollToHash(
  href: string,
  lenis: Lenis | null,
  options?: { offset?: number; duration?: number },
): boolean {
  const hash = getHashFromHref(href);
  if (!hash) {
    return false;
  }

  const target = document.getElementById(hash);
  if (!target) {
    return false;
  }

  const offset = options?.offset ?? -80;
  const duration = options?.duration ?? 1.2;

  if (lenis) {
    lenis.scrollTo(target, { offset, duration });
  } else {
    const top =
      target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return true;
}
