// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { modelsAhead, prefetchInOrder, usePrefetchModels } from "./prefetch";

vi.mock("./load-model", () => ({ loadModel: () => new Promise(() => {}), disposeTree: () => undefined }));

const ok = () => Promise.resolve(new Response(new ArrayBuffer(8)));

describe("modelsAhead", () => {
  it("should list the models below the hero in scroll order, the visitor's figure first and the other side's last", () => {
    expect(modelsAhead("light", true)).toEqual([
      "/models/saber.glb",
      "/models/deathstar.glb",
      "/models/anakin.glb",
      "/models/tie.glb",
      "/models/vader.glb",
    ]);
    expect(modelsAhead("dark", false)).toEqual(["/models/saber.glb", "/models/deathstar.glb", "/models/vader.glb", "/models/anakin.glb"]);
  });

  it("should leave out the TIE fighter on screens too narrow to show it", () => {
    expect(modelsAhead("light", false)).not.toContain("/models/tie.glb");
  });
});

describe("prefetchInOrder", () => {
  it("should download one model at a time, in order", async () => {
    const pending: (() => void)[] = [];
    const get = vi.fn(() => new Promise<Response>((resolve) => pending.push(() => resolve(new Response(new ArrayBuffer(8))))));
    const done = prefetchInOrder(["/a.glb", "/b.glb"], get);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenLastCalledWith("/a.glb", { credentials: "same-origin" });
    pending[0]();
    await vi.waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(get).toHaveBeenLastCalledWith("/b.glb", { credentials: "same-origin" });
    pending[1]();
    await done;
  });

  it("should keep going when one download fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const get = vi.fn().mockRejectedValueOnce(new Error("offline")).mockImplementation(ok);
    await prefetchInOrder(["/a.glb", "/b.glb"], get);
    expect(get).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("usePrefetchModels", () => {
  let report: (names: string[]) => void = () => {};

  beforeEach(() => {
    report = () => {};
    vi.stubGlobal(
      "PerformanceObserver",
      class {
        constructor(cb: (list: { getEntries: () => { name: string }[] }) => void) {
          report = (names) => cb({ getEntries: () => names.map((name) => ({ name })) });
        }
        observe() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should wait for the hero's ship to finish downloading, then start with the saber", () => {
    const get = vi.fn(ok);
    vi.stubGlobal("fetch", get);
    renderHook(() => usePrefetchModels());
    report(["https://nuopen.test/_next/static/app.js"]);
    expect(get).not.toHaveBeenCalled();
    report(["https://nuopen.test/models/destroyer.glb"]);
    expect(get).toHaveBeenCalledWith("/models/saber.glb", { credentials: "same-origin" });
  });

  it("should not download ahead when the visitor turned on data saver", () => {
    const get = vi.fn(ok);
    vi.stubGlobal("fetch", get);
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    renderHook(() => usePrefetchModels());
    report(["https://nuopen.test/models/destroyer.glb"]);
    expect(get).not.toHaveBeenCalled();
  });
});
