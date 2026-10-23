import { describe, expect, it } from "vitest";

import { tieFlight } from "./tie-flight";

describe("tieFlight", () => {
  it("should start the dive banked and turned, then fly level and head-on once it arrives", () => {
    const start = tieFlight(0, 0);
    const end = tieFlight(1, 0);
    expect(start.arrive).toBe(0);
    expect(Math.abs(start.roll)).toBeGreaterThan(0.5);
    expect(Math.abs(start.yaw)).toBeGreaterThan(0.3);
    expect(end.arrive).toBe(1);
    expect(end.roll).toBeCloseTo(0, 6);
    expect(end.yaw).toBeCloseTo(0, 6);
  });

  it("should brake into the hover, covering most of the way in the first half of the scroll", () => {
    expect(tieFlight(0.5, 0).arrive).toBeGreaterThan(0.75);
    let last = -1;
    for (let p = 0; p <= 1; p += 0.1) {
      const { arrive } = tieFlight(p, 0);
      expect(arrive).toBeGreaterThan(last);
      last = arrive;
    }
  });

  it("should hold the arrival pose when scroll overshoots either end", () => {
    expect(tieFlight(-1, 0)).toEqual(tieFlight(0, 0));
    expect(tieFlight(2, 0)).toEqual(tieFlight(1, 0));
  });

  it("should keep bobbing gently while it holds position", () => {
    const bobs = [0, 1, 2, 3, 4].map((t) => tieFlight(1, t).bob);
    expect(new Set(bobs.map((b) => b.toFixed(4))).size).toBeGreaterThan(1);
    for (const bob of bobs) expect(Math.abs(bob)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(tieFlight(1, 1.3).roll)).toBeLessThan(0.1);
  });
});
