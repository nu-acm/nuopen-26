import { describe, expect, it } from "vitest";

import { SABER_SIZE, SABER_TIMING, SWAP_DURATION, beginSwap, bladeLength, colourDue, fitHeight, swapDone, swapLength } from "./saber";

const spread = (from: number, to: number, n = 200) => Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n);

describe("SABER_SIZE", () => {
  it("should make the blade about three times the hilt, as on Luke's saber in the films", () => {
    expect(SABER_SIZE.blade / SABER_SIZE.hilt).toBeGreaterThanOrEqual(3);
    expect(SABER_SIZE.blade / SABER_SIZE.hilt).toBeLessThanOrEqual(3.5);
  });
});

describe("fitHeight", () => {
  it("should size the frame by the box height when the band is wide", () => {
    expect(fitHeight(2, 4, 5, 0.8)).toBeCloseTo(5, 9);
  });

  it("should size the frame by the box width when the band is narrow", () => {
    expect(fitHeight(4, 1, 0.5, 0.8)).toBeCloseTo(10, 9);
  });
});

describe("bladeLength", () => {
  it("should keep the blade at full length before any side change", () => {
    expect(bladeLength(0)).toBe(1);
    expect(bladeLength(-1)).toBe(1);
  });

  it("should retract for 0.25 seconds and ignite for 0.35 seconds", () => {
    expect(SABER_TIMING).toEqual({ retract: 0.25, ignite: 0.35 });
    expect(SWAP_DURATION).toBeCloseTo(0.6, 9);
  });

  it("should shorten the blade without ever growing during the retract", () => {
    const lengths = spread(0, SABER_TIMING.retract).map((t) => bladeLength(t));
    expect(lengths.every((l, i) => i === 0 || l <= lengths[i - 1])).toBe(true);
    expect(bladeLength(SABER_TIMING.retract)).toBeCloseTo(0, 6);
  });

  it("should overshoot slightly while igniting and then settle at full length", () => {
    const peak = Math.max(...spread(SABER_TIMING.retract, SWAP_DURATION).map((t) => bladeLength(t)));
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThan(1.1);
    expect(bladeLength(SWAP_DURATION)).toBe(1);
    expect(bladeLength(SWAP_DURATION + 5)).toBe(1);
  });

  it("should never drop below nothing", () => {
    expect(spread(0, SWAP_DURATION).every((t) => bladeLength(t) >= 0)).toBe(true);
  });

  it("should retract from a partial length when the side changes mid-swap", () => {
    expect(bladeLength(0, 0.5)).toBe(0.5);
    expect(bladeLength(SABER_TIMING.retract, 0.5)).toBeCloseTo(0, 6);
  });
});

describe("swap", () => {
  it("should report full length when no swap is running", () => {
    expect(swapLength(null, 10)).toBe(1);
  });

  it("should start a swap from the current length when one is already running", () => {
    const first = beginSwap(null, 2);
    expect(first).toEqual({ start: 2, from: 1 });
    const second = beginSwap(first, 2.1);
    expect(second.start).toBe(2.1);
    expect(second.from).toBeCloseTo(bladeLength(0.1), 9);
    expect(second.from).toBeLessThan(1);
  });

  it("should flip the colour only once the blade has fully retracted", () => {
    const swap = beginSwap(null, 0);
    expect(colourDue(swap, SABER_TIMING.retract - 0.01)).toBe(false);
    expect(colourDue(swap, SABER_TIMING.retract)).toBe(true);
  });

  it("should finish the swap after the retract and the ignition", () => {
    const swap = beginSwap(null, 0);
    expect(swapDone(swap, SWAP_DURATION - 0.01)).toBe(false);
    expect(swapDone(swap, SWAP_DURATION)).toBe(true);
  });
});
