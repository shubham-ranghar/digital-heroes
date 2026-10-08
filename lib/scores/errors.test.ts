import { describe, expect, it } from "vitest";

import { mapScoreWriteError } from "@/lib/scores/errors";

describe("mapScoreWriteError", () => {
  it("keeps duplicate-date and outside-window failures distinct", () => {
    const duplicate = mapScoreWriteError({ code: "23505" }, "self");
    const outside = mapScoreWriteError({ code: "DH001" }, "self");
    expect(duplicate?.reason).toBe("duplicate_date");
    expect(outside?.reason).toBe("outside_latest_five");
    expect(duplicate?.message).not.toBe(outside?.message);
    expect(duplicate?.fieldError).not.toBe(outside?.fieldError);
  });

  it("returns null for unrelated errors", () => {
    expect(mapScoreWriteError({ code: "42501" }, "admin")).toBeNull();
    expect(mapScoreWriteError(null, "admin")).toBeNull();
  });
});
