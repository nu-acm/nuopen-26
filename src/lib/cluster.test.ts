import { describe, expect, it } from "vitest";

import { clusterPoints } from "./cluster";

describe("clusterPoints", () => {
  it("should group nearby points into one cluster at their centroid", () => {
    const [c] = clusterPoints(
      [
        [0, 0, 0],
        [0.02, 0, 0],
        [0, 0.02, 0],
      ],
      0.1,
    );
    expect(c.count).toBe(3);
    expect(c.x).toBeCloseTo(0.0067, 3);
    expect(c.y).toBeCloseTo(0.0067, 3);
  });

  it("should keep distant points in separate clusters", () => {
    const out = clusterPoints(
      [
        [-1, 0, 0],
        [-1.01, 0, 0],
        [1, 0, 0],
      ],
      0.1,
    );
    expect(out).toHaveLength(2);
  });

  it("should order clusters from the most points to the fewest", () => {
    const out = clusterPoints(
      [
        [1, 0, 0],
        [-1, 0, 0],
        [-1, 0.01, 0],
      ],
      0.1,
    );
    expect(out.map((c) => c.count)).toEqual([2, 1]);
  });

  it("should report each cluster's extent as its size", () => {
    const [c] = clusterPoints(
      [
        [0, 0, 0],
        [0.06, 0.02, 0],
      ],
      0.1,
    );
    expect(c.size).toBeCloseTo(0.06);
  });

  it("should return nothing for no points", () => {
    expect(clusterPoints([], 0.1)).toEqual([]);
  });
});
