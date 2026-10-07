const ALLOWED_SUBSTRINGS = ["inter tight", "instrument serif"];

export function isAllowedFontFamily(fontFamily: string): boolean {
  const normalized = fontFamily.toLowerCase();
  return ALLOWED_SUBSTRINGS.some((name) => normalized.includes(name));
}

export function collectFontFamilies(root: ParentNode = document.body): string[] {
  const seen = new Set<string>();
  const elements =
    root === document.body
      ? document.querySelectorAll<HTMLElement>("body *")
      : root.querySelectorAll<HTMLElement>("*");

  elements.forEach((element) => {
    const family = window.getComputedStyle(element).fontFamily;
    if (family) {
      seen.add(family);
    }
  });

  return [...seen].sort();
}

export function auditFontFamilies(root?: ParentNode): {
  allowed: string[];
  unexpected: string[];
} {
  const families = collectFontFamilies(root);
  const allowed: string[] = [];
  const unexpected: string[] = [];

  for (const family of families) {
    if (isAllowedFontFamily(family)) {
      allowed.push(family);
    } else {
      unexpected.push(family);
    }
  }

  return { allowed, unexpected };
}
