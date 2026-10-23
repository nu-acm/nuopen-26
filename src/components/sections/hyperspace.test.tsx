// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { transitFrame } from "@/lib/transit";
import { warpDrive } from "@/lib/warp";

import { Hyperspace } from "./hyperspace";

type Trigger = { onUpdate: (self: { progress: number }) => void };

const motion = vi.hoisted(() => ({ reduced: false, triggers: [] as Trigger[] }));

vi.mock("../motion/gsap", () => ({
  prefersReducedMotion: () => motion.reduced,
  gsap: { context: (setup: () => void) => (setup(), { revert() {} }) },
  ScrollTrigger: { create: (config: Trigger) => motion.triggers.push(config) },
}));
vi.mock("../three/use-stage", () => ({ useStage: () => undefined }));

const scrollTo = (progress: number) => motion.triggers[0].onUpdate({ progress });

describe("Hyperspace", () => {
  beforeEach(() => {
    motion.reduced = false;
    motion.triggers = [];
    warpDrive.setLevel(0);
  });
  afterEach(cleanup);

  it("should drive the starfield's warp and the flash from scroll progress", () => {
    const { container } = render(<Hyperspace />);
    const frame = transitFrame(0.49);
    scrollTo(0.49);
    expect(warpDrive.current()).toBeCloseTo(frame.warp);
    expect(warpDrive.current()).toBeGreaterThan(0);
    expect(container.querySelector<HTMLElement>(".hyper-flash")!.style.opacity).toBe(String(frame.flash));
  });

  it("should let the jump play without a caption over it", () => {
    const { container } = render(<Hyperspace />);
    scrollTo(0.3);
    expect(container.textContent).toBe("");
  });

  it("should return the sky to rest when the section unmounts mid-jump", () => {
    const { unmount } = render(<Hyperspace />);
    scrollTo(0.6);
    unmount();
    expect(warpDrive.current()).toBe(0);
  });

  it("should not scrub the jump when the visitor asks for reduced motion", () => {
    motion.reduced = true;
    render(<Hyperspace />);
    expect(motion.triggers).toHaveLength(0);
  });
});
