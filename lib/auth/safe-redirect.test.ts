import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("safeRedirectPath", () => {
  it("allows simple relative paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/admin/draws?tab=1")).toBe("/admin/draws?tab=1");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
  });

  it("rejects backslashes and encoded bypasses", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/%2F%2Fevil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/%5Cevil")).toBe("/dashboard");
  });

  it("uses fallback for empty input", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath("", "/login")).toBe("/login");
  });
});
