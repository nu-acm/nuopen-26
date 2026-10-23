// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useJump } from "./use-jump";

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock("../motion/gsap", () => ({ prefersReducedMotion: () => motion.reduced }));

const scrollTo = vi.fn();
vi.mock("lenis/react", () => ({ useLenis: () => ({ scrollTo }) }));

function Links() {
  const jump = useJump();
  return (
    <>
      <a href="#rules" onClick={jump}>
        Rules
      </a>
      <a href="#faq" onClick={jump}>
        FAQ
      </a>
      <a href="#crawl" onClick={jump}>
        Crawl
      </a>
      <section id="rules" />
      <section id="faq" />
      <section id="crawl" data-roll-s="65" />
    </>
  );
}

/** Plays Lenis's arrival callback for the nth glide, as if that glide had finished. */
const landGlide = (n: number) => scrollTo.mock.calls[n][1].onComplete();

describe("useJump", () => {
  beforeEach(() => {
    motion.reduced = false;
    scrollTo.mockClear();
  });
  afterEach(() => cleanup());

  it("should leave modified clicks to the browser so they can open a new tab", () => {
    render(<Links />);
    const notPrevented = fireEvent.click(screen.getByText("Rules"), { metaKey: true });
    expect(notPrevented).toBe(true);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("should glide to the section with Lenis instead of jumping", () => {
    const { container } = render(<Links />);
    fireEvent.click(screen.getByText("Rules"));
    expect(scrollTo).toHaveBeenCalledWith(
      container.querySelector("#rules"),
      expect.objectContaining({ duration: 1.4, easing: expect.any(Function) }),
    );
    expect(scrollTo.mock.calls[0][1].immediate).toBeFalsy();
  });

  it("should move keyboard focus into the section once the glide lands", () => {
    const { container } = render(<Links />);
    fireEvent.click(screen.getByText("Rules"));
    expect(document.activeElement).not.toBe(container.querySelector("#rules"));
    landGlide(0);
    expect(document.activeElement).toBe(container.querySelector("#rules"));
  });

  it("should jump instantly and focus the section when reduced motion is on", () => {
    motion.reduced = true;
    const { container } = render(<Links />);
    fireEvent.click(screen.getByText("Rules"));
    expect(scrollTo).toHaveBeenCalledWith(container.querySelector("#rules"), expect.objectContaining({ immediate: true }));
    expect(document.activeElement).toBe(container.querySelector("#rules"));
  });

  it("should roll through a section at its own steady pace once the glide lands there", () => {
    const { container } = render(<Links />);
    const crawl = container.querySelector("#crawl");
    fireEvent.click(screen.getByText("Crawl"));
    landGlide(0);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    const [target, roll] = scrollTo.mock.calls[1];
    expect(target).toBe(crawl);
    expect(roll).toMatchObject({ duration: 65, offset: -innerHeight });
    expect(roll.easing(0.3)).toBeCloseTo(0.3);
  });

  it("should stop at a section that sets no pace of its own", () => {
    render(<Links />);
    fireEvent.click(screen.getByText("Rules"));
    landGlide(0);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("should arrive only at the last section when a second link is clicked mid-glide", () => {
    const { container } = render(<Links />);
    fireEvent.click(screen.getByText("Rules"));
    fireEvent.click(screen.getByText("FAQ"));
    landGlide(0);
    expect(document.activeElement).not.toBe(container.querySelector("#rules"));
    landGlide(1);
    expect(document.activeElement).toBe(container.querySelector("#faq"));
  });
});
