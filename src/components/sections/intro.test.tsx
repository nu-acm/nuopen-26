// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { gsap } from "gsap";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { INTRO_TITLE } from "@/lib/intro";
import { sideStore } from "@/lib/side";

import { Intro } from "./intro";

const FAST = 40;
/** Lets `seconds` of the opening play out, sped up so the suite stays quick. */
const play = (seconds: number) => act(() => new Promise((done) => setTimeout(done, (seconds * 1000) / FAST)));

describe("Intro", () => {
  let main: HTMLElement;
  let cues: number;
  const cue = () => void cues++;

  beforeEach(() => {
    sideStore.reset();
    gsap.globalTimeline.timeScale(FAST);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.dataset.intro = "1";
    main = document.body.appendChild(document.createElement("main"));
    cues = 0;
    addEventListener(INTRO_TITLE, cue);
  });
  afterEach(() => {
    cleanup();
    main.remove();
    removeEventListener(INTRO_TITLE, cue);
    gsap.globalTimeline.timeScale(1);
    delete document.documentElement.dataset.intro;
  });

  it("should keep the page out of keyboard reach while the opening plays", () => {
    render(<Intro />);
    expect(main.hasAttribute("inert")).toBe(true);
  });

  it("should hand the page back once the opening is skipped", () => {
    render(<Intro />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(main.hasAttribute("inert")).toBe(false);
    expect(document.documentElement.dataset.intro).toBeUndefined();
  });

  it("should hold on the opening line until the visitor begins, so the score can start with the title", async () => {
    render(<Intro />);
    await play(20);
    expect(screen.getByText("Click anywhere to begin")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(document.documentElement.dataset.intro).toBe("1");
    expect(cues).toBe(0);
  });

  it("should cue the score as the title appears once the visitor clicks anywhere", async () => {
    render(<Intro />);
    fireEvent.pointerDown(window);
    await play(8);
    expect(cues).toBe(1);
    expect(document.documentElement.dataset.intro).toBeUndefined();
  });

  it("should play straight through without asking for a click when the music is off", async () => {
    sideStore.setMusic(false);
    render(<Intro />);
    expect(screen.queryByText("Click anywhere to begin")).toBeNull();
    await play(10);
    expect(document.documentElement.dataset.intro).toBeUndefined();
  });

  it("should switch off the no-script fallback that would hide the opening after nine seconds", () => {
    render(<Intro />);
    expect(document.documentElement.hasAttribute("data-intro-live")).toBe(true);
  });
});
