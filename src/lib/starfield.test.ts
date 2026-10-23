import { describe, expect, it } from "vitest";

import { createStars, project, SPEED, speedOf } from "./starfield";

describe("createStars", () => {
  it("should create the requested number of stars", () => {
    expect(createStars(500)).toHaveLength(500);
  });

  it("should keep every star inside the unit field in front of the camera", () => {
    for (const s of createStars(1000)) {
      expect(Math.abs(s.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(s.y)).toBeLessThanOrEqual(1);
      expect(s.z).toBeGreaterThan(0);
      expect(s.z).toBeLessThanOrEqual(1);
      expect(s.size).toBeGreaterThan(0);
    }
  });
});

describe("speedOf", () => {
  it("should drift slowly at rest", () => {
    expect(speedOf(0)).toBeGreaterThan(0);
    expect(speedOf(0)).toBeLessThan(speedOf(0.5));
  });

  it("should reach full lightspeed at warp 1", () => {
    expect(speedOf(1)).toBe(SPEED.lightspeed);
  });

  it("should clamp warp outside 0..1", () => {
    expect(speedOf(3)).toBe(speedOf(1));
    expect(speedOf(-1)).toBe(speedOf(0));
  });
});

describe("project", () => {
  it("should put a star on the centre line at the screen centre", () => {
    expect(project({ x: 0, y: 0, z: 0.5, size: 1 }, 800, 600)).toMatchObject({ sx: 400, sy: 300 });
  });

  it("should push nearer stars further from the centre", () => {
    const far = project({ x: 0.5, y: 0, z: 1, size: 1 }, 800, 600);
    const near = project({ x: 0.5, y: 0, z: 0.25, size: 1 }, 800, 600);
    expect(near.sx - 400).toBeGreaterThan(far.sx - 400);
  });

  it("should draw nearer stars bigger", () => {
    const far = project({ x: 0.1, y: 0.1, z: 1, size: 1 }, 800, 600);
    const near = project({ x: 0.1, y: 0.1, z: 0.2, size: 1 }, 800, 600);
    expect(near.r).toBeGreaterThan(far.r);
  });
});
