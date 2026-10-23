// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { warpDrive } from "@/lib/warp";

import { Starfield } from "./starfield";

vi.mock("lenis/react", () => ({
  useLenis: (onScroll: (lenis: { velocity: number }) => void) => onScroll({ velocity: 80 }),
}));

type Point = [number, number];
type Segment = { alpha: number; from: Point; to: Point };

const drawn = { streaks: 0, points: 0, segments: [] as Segment[] };
let path: Point[] = [];
const ctx = {
  globalAlpha: 1,
  clearRect() {},
  setTransform() {},
  beginPath: () => void (path = []),
  moveTo: (x: number, y: number) => void path.push([x, y]),
  lineTo: (x: number, y: number) => void path.push([x, y]),
  arc() {},
  stroke() {
    drawn.streaks++;
    drawn.segments.push({ alpha: ctx.globalAlpha, from: path[0], to: path[1] });
  },
  fill: () => void drawn.points++,
};
const VIEW = { width: 1000, height: 800 };
const fromCentre = ([x, y]: Point) => Math.hypot(x - VIEW.width / 2, y - VIEW.height / 2);
let frames: FrameRequestCallback[] = [];
const nextFrame = () => frames.splice(0).forEach((f) => f(performance.now()));

describe("Starfield", () => {
  beforeEach(() => {
    drawn.streaks = drawn.points = 0;
    drawn.segments = [];
    frames = [];
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(VIEW.width);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(VIEW.height);
    warpDrive.setLevel(0);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never);
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) => frames.push(f));
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should keep the stars as points while the page scrolls fast outside the jump", () => {
    render(<Starfield />);
    nextFrame();
    expect(drawn.points).toBeGreaterThan(0);
    expect(drawn.streaks).toBe(0);
  });

  it("should streak the stars once the jump drives the warp", () => {
    warpDrive.setLevel(0.8);
    render(<Starfield />);
    nextFrame();
    expect(drawn.streaks).toBeGreaterThan(0);
  });

  it("should draw each streak like film motion blur: brightest at its head, fading toward the vanishing point", () => {
    warpDrive.setLevel(0.8);
    render(<Starfield />);
    nextFrame();
    const byHead = Map.groupBy(drawn.segments, (s) => s.to.join());
    expect(byHead.size).toBeGreaterThan(0);
    for (const strokes of byHead.values()) {
      expect(strokes).toHaveLength(2);
      const [faint, bright] = [...strokes].sort((a, b) => a.alpha - b.alpha);
      expect(bright.alpha).toBeGreaterThan(faint.alpha);
      expect(fromCentre(bright.from)).toBeGreaterThan(fromCentre(faint.from));
    }
  });

  it("should draw the resting sky in a few batched fills, not one per star", () => {
    render(<Starfield />);
    expect(drawn.points).toBeGreaterThan(0);
    expect(drawn.points).toBeLessThanOrEqual(16);
  });

  it("should redraw the resting sky at about 30 frames a second", () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    const clears = vi.spyOn(ctx, "clearRect");
    render(<Starfield />);
    for (const step of [16, 17, 17, 16]) {
      now += step;
      nextFrame();
    }
    expect(clears).toHaveBeenCalledTimes(3);
  });

  it("should render the sky at one pixel per CSS pixel on a phone", () => {
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("innerHeight", 844);
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<Starfield />);
    expect(container.querySelector("canvas")!.width).toBe(VIEW.width);
  });
});
