import { describe, expect, it } from "vitest";

import { damp } from "./scene-path";

describe("damp", () => {
  it("should stay put when no time has passed", () => {
    expect(damp(2, 10, 4, 0)).toBe(2);
  });

  it("should move part of the way toward the target without overshooting", () => {
    const next = damp(0, 10, 4, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });

  it("should land on the target after a long frame", () => {
    expect(damp(0, 10, 4, 10)).toBeCloseTo(10, 5);
  });

  it("should move the same distance for one long frame as for two half frames", () => {
    const once = damp(0, 10, 3, 0.2);
    const twice = damp(damp(0, 10, 3, 0.1), 10, 3, 0.1);
    expect(once).toBeCloseTo(twice, 10);
  });
});
