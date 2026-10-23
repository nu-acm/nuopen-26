import { describe, expect, it } from "vitest";

import { approachDistance, briefingYaw, screenX } from "./deathstar-shot";

const halfTan = (fovDeg: number) => Math.tan((fovDeg * Math.PI) / 360);

describe("screenX", () => {
  it("should centre the disc when it sits at the middle of the screen", () => {
    expect(screenX(0.5, 4, 30, 1.5)).toBeCloseTo(0, 9);
  });

  it("should place the disc right of centre for fractions above one half", () => {
    expect(screenX(0.75, 4, 30, 1.5)).toBeGreaterThan(0);
  });

  it("should reach the right edge of the view at fraction one", () => {
    expect(screenX(1, 4, 30, 1.5)).toBeCloseTo(4 * halfTan(30) * 1.5, 6);
  });
});

describe("briefingYaw", () => {
  it("should show the dish at the front before the section moves", () => {
    expect(briefingYaw(0, 0)).toBe(0);
  });

  it("should keep turning slowly with time, less than half a turn in ten seconds", () => {
    expect(briefingYaw(10, 0)).toBeGreaterThan(0);
    expect(briefingYaw(10, 0)).toBeLessThan(Math.PI);
  });

  it("should turn further as the section scrolls past", () => {
    expect(briefingYaw(0, 1)).toBeGreaterThan(briefingYaw(0, 0.5));
  });
});

describe("approachDistance", () => {
  it("should start at the far distance and end at the near one", () => {
    expect(approachDistance(0, 7, 4)).toBe(7);
    expect(approachDistance(1, 7, 4)).toBe(4);
  });

  it("should clamp progress outside zero to one", () => {
    expect(approachDistance(-2, 7, 4)).toBe(7);
    expect(approachDistance(3, 7, 4)).toBe(4);
  });
});
