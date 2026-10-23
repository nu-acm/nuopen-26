// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INTRO_DONE, INTRO_TITLE } from "@/lib/intro";

import { FIRST_NOTE } from "./soundtrack";

const audios: FakeAudio[] = [];
const gains: { gain: { value: number } }[] = [];

class FakeAudio {
  loop = false;
  preload = "auto";
  volume = 1;
  paused = true;
  currentTime = 0;
  error: { code: number } | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  constructor(public src: string) {
    audios.push(this);
  }
}

class FakeContext {
  static last: FakeContext | undefined;
  state = "suspended";
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  constructor() {
    FakeContext.last = this;
  }
  createGain() {
    const node = { gain: { value: 1 }, connect: <T,>(next: T) => next };
    gains.push(node);
    return node;
  }
  createMediaElementSource() {
    return { connect: <T,>(next: T) => next };
  }
}

async function mount() {
  vi.resetModules();
  const { sideStore } = await import("@/lib/side");
  const { Soundtrack, TRACKS } = await import("./soundtrack");
  sideStore.reset();
  render(<Soundtrack />);
  await act(async () => {});
  return { sideStore, TRACKS };
}

describe("Soundtrack", () => {
  beforeEach(() => {
    audios.length = 0;
    gains.length = 0;
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("AudioContext", FakeContext);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should play the light side's track looped", async () => {
    const { TRACKS } = await mount();
    expect(audios[0].src).toBe(TRACKS.light);
    expect(audios[0].loop).toBe(true);
    expect(audios[0].play).toHaveBeenCalled();
  });

  it("should fetch only the score's header up front, so the page stays fast and the music starts at once", async () => {
    await mount();
    expect(audios[0].preload).toBe("metadata");
  });

  it("should fade through a gain node, since iOS ignores the element's volume", async () => {
    await mount();
    expect(gains).toHaveLength(1);
    expect(gains[0].gain.value).toBeLessThan(0.05);
    expect(audios[0].volume).toBe(1);
  });

  it("should try again on the first tap when the browser blocks autoplay", async () => {
    const blocked = vi.fn().mockRejectedValueOnce(new Error("NotAllowedError")).mockResolvedValue(undefined);
    vi.stubGlobal("Audio", class extends FakeAudio {
      play = blocked;
    });
    await mount();
    expect(blocked).toHaveBeenCalledTimes(1);
    await act(async () => void dispatchEvent(new Event("pointerup")));
    expect(blocked).toHaveBeenCalledTimes(2);
  });

  it("should reload a track that failed before playing it again", async () => {
    const { sideStore } = await mount();
    act(() => {
      audios[0].error = { code: 2 };
      audios[0].onerror?.();
    });
    expect(sideStore.get().music).toBe(false);
    await act(async () => sideStore.setMusic(true));
    expect(audios[0].load).toHaveBeenCalled();
  });

  it("should resume Web Audio on every tap while it is suspended", async () => {
    await mount();
    const resume = vi.mocked(FakeContext.last!.resume);
    resume.mockClear();
    dispatchEvent(new Event("pointerup"));
    dispatchEvent(new Event("pointerup"));
    expect(resume).toHaveBeenCalledTimes(2);
  });

  it("should hold the score while the opening plays and start it on the first note as the title appears", async () => {
    document.documentElement.dataset.intro = "1";
    await mount();
    expect(audios[0].play).not.toHaveBeenCalled();
    await act(async () => void dispatchEvent(new Event(INTRO_TITLE)));
    expect(audios[0].play).toHaveBeenCalled();
    expect(audios[0].currentTime).toBe(FIRST_NOTE.light);
    delete document.documentElement.dataset.intro;
  });

  it("should start the score when the opening ends without reaching the title", async () => {
    document.documentElement.dataset.intro = "1";
    await mount();
    await act(async () => void dispatchEvent(new Event(INTRO_DONE)));
    expect(audios[0].play).toHaveBeenCalled();
    delete document.documentElement.dataset.intro;
  });

  it("should switch the music off for this visit when Web Audio is unavailable", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { sideStore } = await mount();
    expect(audios).toHaveLength(0);
    expect(sideStore.get().music).toBe(false);
  });
});

describe("playEffect", () => {
  beforeEach(() => {
    audios.length = 0;
    gains.length = 0;
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("AudioContext", FakeContext);
  });
  afterEach(() => vi.unstubAllGlobals());

  async function load() {
    vi.resetModules();
    const { sideStore } = await import("@/lib/side");
    const sound = await import("./soundtrack");
    sideStore.reset();
    return { sideStore, ...sound };
  }

  it("should play the effect from the start each time through one reused gain node", async () => {
    const { playEffect, EFFECTS } = await load();
    playEffect(EFFECTS.blaster);
    audios[0].currentTime = 0.4;
    playEffect(EFFECTS.blaster);
    expect(audios).toHaveLength(1);
    expect(audios[0].src).toBe(EFFECTS.blaster);
    expect(audios[0].currentTime).toBe(0);
    expect(audios[0].play).toHaveBeenCalledTimes(2);
    expect(gains).toHaveLength(1);
  });

  it("should reload an effect whose file failed to load before", async () => {
    const { playEffect, EFFECTS } = await load();
    playEffect(EFFECTS.blaster);
    audios[0].error = { code: 4 };
    playEffect(EFFECTS.blaster);
    expect(audios[0].load).toHaveBeenCalledTimes(1);
  });

  it("should stay silent when the visitor muted the sound", async () => {
    const { playEffect, EFFECTS, sideStore } = await load();
    sideStore.toggleMusic();
    playEffect(EFFECTS.swing);
    expect(audios).toHaveLength(0);
  });
});
