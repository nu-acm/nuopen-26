import { beforeEach, describe, expect, it } from "vitest";

import { warpDrive } from "./warp";

describe("warpDrive", () => {
  beforeEach(() => warpDrive.setLevel(0));

  it("should rest at zero warp", () => {
    expect(warpDrive.current()).toBe(0);
  });

  it("should hold the warp level the scrolling transit sets", () => {
    warpDrive.setLevel(0.4);
    expect(warpDrive.current()).toBeCloseTo(0.4);
  });

  it("should clamp the level to 0..1", () => {
    warpDrive.setLevel(3);
    expect(warpDrive.current()).toBe(1);
    warpDrive.setLevel(-2);
    expect(warpDrive.current()).toBe(0);
  });
});
