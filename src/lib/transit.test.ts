import { describe, expect, it } from "vitest";

import { BEAT, framingDistance, shipPose, transitFrame } from "./transit";

describe("transitFrame", () => {
  it("should keep the ship still and the sky at rest while idling", () => {
    expect(transitFrame(0.05)).toMatchObject({ warp: 0, engines: 0, lurch: 0, flash: 0, tremor: 0 });
  });

  it("should stretch the stars and warm the engines through the charge", () => {
    const early = transitFrame(BEAT.charge + 0.02);
    const late = transitFrame(BEAT.jump - 0.01);
    expect(late.warp).toBeGreaterThan(early.warp);
    expect(late.warp).toBeLessThan(1);
    expect(late.engines).toBeGreaterThan(early.engines);
    expect(late.tremor).toBeGreaterThan(0);
  });

  it("should lurch the ship into the vanishing point over the jump", () => {
    const middle = (BEAT.jump + BEAT.arrive) / 2;
    expect(transitFrame(BEAT.jump).lurch).toBe(0);
    expect(transitFrame(middle).lurch).toBeGreaterThan(0);
    expect(transitFrame(middle).lurch).toBeLessThan(1);
    expect(transitFrame(BEAT.arrive).lurch).toBe(1);
  });

  it("should flash white as the ship reaches the vanishing point", () => {
    expect(transitFrame(BEAT.arrive).flash).toBeCloseTo(1);
    expect(transitFrame(BEAT.charge).flash).toBe(0);
    expect(transitFrame(0.95).flash).toBe(0);
  });

  it("should keep the flash off the ship until the last moments before arrival", () => {
    expect(transitFrame(BEAT.arrive - 0.03).flash).toBe(0);
  });

  it("should hold full warp and an empty sky through the tunnel", () => {
    for (const p of [BEAT.arrive + 0.02, 0.6, BEAT.tunnel - 0.01]) {
      expect(transitFrame(p).warp).toBe(1);
      expect(transitFrame(p).lurch).toBe(1);
    }
  });

  it("should settle the warp back to rest as the next section arrives", () => {
    expect(transitFrame(BEAT.tunnel).warp).toBe(1);
    expect(transitFrame(0.9).warp).toBeLessThan(transitFrame(0.85).warp);
    expect(transitFrame(1).warp).toBe(0);
  });

  it("should clamp progress outside 0..1", () => {
    expect(transitFrame(-1)).toEqual(transitFrame(0));
    expect(transitFrame(2)).toEqual(transitFrame(1));
  });

  it("should keep every value between 0 and 1 across the whole transit", () => {
    for (let p = -0.1; p <= 1.1; p += 0.01) {
      for (const value of Object.values(transitFrame(p))) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("shipPose", () => {
  it("should keep the ship at full size and in place before the jump", () => {
    expect(shipPose(transitFrame(0.1))).toEqual({ travel: 0, stretch: 1, scale: 1 });
  });

  it("should keep the ship clearly visible through the first half of the jump", () => {
    expect(shipPose(transitFrame(BEAT.jump + 0.05)).scale).toBeGreaterThan(0.9);
  });

  it("should stretch the ship along its length while it lurches", () => {
    expect(shipPose(transitFrame((BEAT.jump + BEAT.arrive) / 2)).stretch).toBeGreaterThan(1);
  });

  it("should shrink the ship to a point at the vanishing point", () => {
    const gone = shipPose(transitFrame(BEAT.arrive));
    expect(gone.travel).toBe(1);
    expect(gone.scale).toBeLessThan(0.01);
    expect(gone.scale).toBeGreaterThan(0);
  });

  it("should ease the ship down to a point over the last part of the jump rather than popping out", () => {
    const span = BEAT.arrive - BEAT.jump;
    expect(shipPose(transitFrame(BEAT.jump + span * 0.9)).scale).toBeLessThan(0.2);
    expect(shipPose(transitFrame(BEAT.jump + span * 0.95)).scale).toBeLessThan(0.05);
  });
});

describe("framingDistance", () => {
  const view = { fovY: 0.4, aspect: 1.6 };

  it("should place the ship at the share of the width it is asked to fill", () => {
    const d = framingDistance({ width: 0.56, height: 0.1 }, view, { width: 0.56, height: 0.5 });
    const visibleWidth = 2 * d * Math.tan(view.fovY / 2) * view.aspect;
    expect(0.56 / visibleWidth).toBeCloseTo(0.56);
  });

  it("should keep a phone-width ship inside the frame", () => {
    const phone = { fovY: 0.4, aspect: 390 / 844 };
    const fill = { width: 0.8, height: 0.5 };
    const size = { width: 0.56, height: 0.4 };
    const d = framingDistance(size, phone, fill);
    expect(size.width / (2 * d * Math.tan(phone.fovY / 2) * phone.aspect)).toBeLessThanOrEqual(fill.width + 1e-9);
    expect(size.height / (2 * d * Math.tan(phone.fovY / 2))).toBeLessThanOrEqual(fill.height + 1e-9);
  });

  it("should pull the camera back when the ship is taller than its share of the height", () => {
    const short = framingDistance({ width: 0.5, height: 0.2 }, view, { width: 1, height: 0.5 });
    const tall = framingDistance({ width: 0.5, height: 0.8 }, view, { width: 1, height: 0.5 });
    expect(tall).toBeGreaterThan(short);
  });
});
