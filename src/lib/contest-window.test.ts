import { describe, expect, it } from "vitest";

import { contestWindow } from "./contest-window";

describe("contestWindow", () => {
  it("should format the start and end in Astana time", () => {
    const w = contestWindow("2026-11-07T11:00:00+05:00", "2026-11-07T16:00:00+05:00");
    expect(w.range).toBe("11:00–16:00");
    expect(w.zone).toBe("Astana time (UTC+5)");
  });

  it("should convert a UTC instant to Astana wall-clock time", () => {
    const w = contestWindow("2026-11-07T06:00:00Z", "2026-11-07T11:00:00Z");
    expect(w.range).toBe("11:00–16:00");
  });
});
