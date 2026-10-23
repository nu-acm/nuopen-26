// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";

import { Reward } from "./bounty";

const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

describe("Reward", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should render the prize text as the section heading", () => {
    render(<Reward />);
    expect(screen.getByRole("heading", { name: new RegExp(EVENT.prize.text) })).toBeTruthy();
  });

  it("should render the extra prize line and the eligibility note", () => {
    render(<Reward />);
    expect(screen.getByText(EVENT.prize.extra)).toBeTruthy();
    expect(screen.getByText(/register and compete on campus/)).toBeTruthy();
  });

  it("should link the reward to registration with a primary call to action", () => {
    render(<Reward />);
    expect(screen.getByRole("link", { name: "Win it. Register your team" }).getAttribute("href")).toBe(EVENT.registerHref);
  });

  it("should land the first reel on its digit straight away when reduced motion is on", () => {
    reducedMotion(true);
    render(<Reward />);
    const first = document.querySelector<HTMLElement>('[data-digit="1"]');
    expect(first?.style.getPropertyValue("--spin")).toBe("70");
  });

  it("should start the reels at zero when motion is allowed", () => {
    reducedMotion(false);
    render(<Reward />);
    const first = document.querySelector<HTMLElement>('[data-digit="1"]');
    expect(first?.style.getPropertyValue("--spin")).toBe("0");
  });

  it("should set the tenge sign in the body face, since the display face has no glyph for it", () => {
    render(<Reward />);
    const sign = document.querySelector(".bounty-currency");
    expect(sign?.textContent).toBe("₸");
    expect(sign?.className).toContain("font-sans");
  });
});
