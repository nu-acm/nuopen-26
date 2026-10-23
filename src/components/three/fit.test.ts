import { describe, expect, it } from "vitest";

import { fitTransform } from "./fit";

describe("fitTransform", () => {
  it("should scale a model so its height matches the target", () => {
    const fit = fitTransform({ min: [0, 0, 0], max: [2, 40, 4] }, 1);
    expect(fit.scale).toBeCloseTo(1 / 40, 10);
  });

  it("should move the model so its centre sits at the origin", () => {
    const fit = fitTransform({ min: [10, 20, 30], max: [14, 24, 32] }, 2);
    const centre = [12, 22, 31].map((c, i) => c * fit.scale + fit.offset[i]);
    centre.forEach((c) => expect(c).toBeCloseTo(0, 10));
  });

  it("should keep a flat model at its size instead of dividing by zero", () => {
    const fit = fitTransform({ min: [0, 5, 0], max: [3, 5, 1] }, 1);
    expect(fit.scale).toBe(1);
    expect(fit.offset.every(Number.isFinite)).toBe(true);
  });
});
