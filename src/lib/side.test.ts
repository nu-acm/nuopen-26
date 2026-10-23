import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MUSIC_KEY, SIDE_KEY, SIDE_SCRIPT, sideStore } from "./side";

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

describe("sideStore", () => {
  let storage: ReturnType<typeof fakeStorage>;

  beforeEach(() => {
    storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("document", { documentElement: { dataset: {} as Record<string, string> } });
    sideStore.reset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("should start on the dark side with music on", () => {
    expect(sideStore.get()).toEqual({ side: "dark", music: true });
  });

  it("should switch sides, remember the choice and tag the page", () => {
    sideStore.choose("light");
    expect(sideStore.get().side).toBe("light");
    expect(storage.data.get(SIDE_KEY)).toBe("light");
    expect(document.documentElement.dataset.side).toBe("light");
  });

  it("should notify subscribers on change and stop after unsubscribe", () => {
    const listener = vi.fn();
    const off = sideStore.subscribe(listener);
    sideStore.choose("light");
    off();
    sideStore.choose("dark");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not notify when the side does not change", () => {
    const listener = vi.fn();
    sideStore.subscribe(listener);
    sideStore.choose("dark");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should restore a saved side and a saved music choice", () => {
    storage.setItem(SIDE_KEY, "light");
    storage.setItem(MUSIC_KEY, "off");
    sideStore.hydrate();
    expect(sideStore.get()).toEqual({ side: "light", music: false });
  });

  it("should paint a restored side even when the head script did not run", () => {
    storage.setItem(SIDE_KEY, "light");
    sideStore.hydrate();
    expect(document.documentElement.dataset.side).toBe("light");
  });

  it("should ignore a corrupted saved side", () => {
    storage.setItem(SIDE_KEY, "purple");
    sideStore.hydrate();
    expect(sideStore.get().side).toBe("dark");
  });

  it("should remember the music switch", () => {
    sideStore.toggleMusic();
    expect(sideStore.get().music).toBe(false);
    expect(storage.data.get(MUSIC_KEY)).toBe("off");
  });

  it("should pause music for this visit without remembering it", () => {
    sideStore.setMusic(false);
    expect(sideStore.get().music).toBe(false);
    expect(storage.data.has(MUSIC_KEY)).toBe(false);
  });

  it("should keep working when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => sideStore.hydrate()).not.toThrow();
    expect(() => sideStore.choose("light")).not.toThrow();
    expect(sideStore.get().side).toBe("light");
  });
});

describe("SIDE_SCRIPT", () => {
  const run = (storage: { getItem: (k: string) => string | null }) => {
    const dataset: Record<string, string> = {};
    new Function("localStorage", "document", SIDE_SCRIPT)(storage, { documentElement: { dataset } });
    return dataset.side;
  };
  const saved = (value: string | null) => ({ getItem: (k: string) => (k === SIDE_KEY ? value : null) });

  it("should paint the saved side before React loads", () => {
    expect(run(saved("light"))).toBe("light");
    expect(run(saved("dark"))).toBe("dark");
  });

  it("should leave the page alone when nothing valid is saved", () => {
    expect(run(saved(null))).toBeUndefined();
    expect(run(saved("purple"))).toBeUndefined();
  });

  it("should not throw when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error("blocked"); } };
    expect(() => run(blocked)).not.toThrow();
  });
});
