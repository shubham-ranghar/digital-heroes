const DEFAULT_PATH = "/dashboard";

/**
 * Allow only same-origin relative paths for post-login redirects.
 * Rejects protocol-relative URLs, backslashes, and encoded bypass attempts.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = DEFAULT_PATH,
): string {
  if (next == null || next === "") {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\\")) {
    return fallback;
  }

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\")
  ) {
    return fallback;
  }

  if (/[\u0000-\u001F\u007F]/.test(decoded)) {
    return fallback;
  }

  return trimmed;
}
