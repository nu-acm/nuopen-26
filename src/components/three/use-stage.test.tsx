// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStage, type StageActor, type StageContext } from "./use-stage";

const { renderers } = vi.hoisted(() => ({
  renderers: [] as {
    domElement: HTMLCanvasElement;
    dispose: () => void;
    forceContextLoss: () => void;
    setPixelRatio: (ratio: number) => void;
  }[],
}));

vi.mock("three", async (importOriginal) => {
  const three = await importOriginal<typeof import("three")>();
  class FakeRenderer {
    domElement = document.createElement("canvas");
    debug = { checkShaderErrors: true };
    dispose = vi.fn();
    forceContextLoss = vi.fn();
    setPixelRatio = vi.fn();
    setSize() {}
    render() {}
    constructor() {
      renderers.push(this);
    }
  }
  class FakePMREM {
    fromScene() {
      return { texture: new three.Texture() };
    }
    dispose() {}
  }
  return { ...three, WebGLRenderer: FakeRenderer, PMREMGenerator: FakePMREM };
});

let watchers: { margin?: string; fire: (visible: boolean) => void }[] = [];
let frames: FrameRequestCallback[] = [];

function Stage({ build }: { build: (ctx: StageContext) => StageActor }) {
  const host = useRef<HTMLDivElement>(null);
  useStage(host, build);
  return <div ref={host} data-testid="host" />;
}

const observer = (margin?: string) => watchers.find((w) => w.margin === margin)!;
const nearScreen = () => act(() => observer("100% 0px").fire(true));
const justPastStartRange = () => act(() => observer("100% 0px").fire(false));
const farFromScreen = () => {
  justPastStartRange();
  act(() => observer("150% 0px").fire(false));
};
const onScreen = () => act(() => observer(undefined).fire(true));

describe("useStage", () => {
  beforeEach(() => {
    renderers.length = 0;
    watchers = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void, options?: IntersectionObserverInit) {
          watchers.push({ margin: options?.rootMargin, fire: (isIntersecting) => cb([{ isIntersecting }]) });
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should build the scene only once the section nears the screen", () => {
    const build = vi.fn(() => ({ update() {} }));
    render(<Stage build={build} />);
    expect(build).not.toHaveBeenCalled();
    nearScreen();
    expect(build).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("host").querySelector("canvas")).not.toBeNull();
  });

  it("should free the GPU and remove the canvas when the section unmounts", () => {
    const actor = { update() {}, dispose: vi.fn() };
    const { unmount } = render(<Stage build={() => actor} />);
    nearScreen();
    const host = screen.getByTestId("host");
    unmount();
    expect(actor.dispose).toHaveBeenCalled();
    expect(renderers[0].dispose).toHaveBeenCalled();
    expect(renderers[0].forceContextLoss).toHaveBeenCalled();
    expect(host.querySelector("canvas")).toBeNull();
  });

  it("should free the GPU when the section moves far off screen and build it again on return", () => {
    const actor = { update() {}, dispose: vi.fn() };
    const build = vi.fn(() => actor);
    render(<Stage build={build} />);
    const host = screen.getByTestId("host");
    nearScreen();
    farFromScreen();
    expect(actor.dispose).toHaveBeenCalledTimes(1);
    expect(renderers[0].forceContextLoss).toHaveBeenCalled();
    expect(host.querySelector("canvas")).toBeNull();
    nearScreen();
    expect(build).toHaveBeenCalledTimes(2);
    expect(host.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("should keep the scene while the section hovers just past the range where it starts", () => {
    const actor = { update() {}, dispose: vi.fn() };
    const build = vi.fn(() => actor);
    render(<Stage build={build} />);
    nearScreen();
    justPastStartRange();
    nearScreen();
    expect(actor.dispose).not.toHaveBeenCalled();
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("should try again on the next approach after the scene fails to build once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const build = vi
      .fn<(ctx: StageContext) => StageActor>()
      .mockImplementationOnce(() => {
        throw new Error("context lost");
      })
      .mockImplementation(() => ({ update() {} }));
    render(<Stage build={build} />);
    nearScreen();
    farFromScreen();
    nearScreen();
    expect(build).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("host").querySelectorAll("canvas")).toHaveLength(1);
    warn.mockRestore();
  });

  it("should lower the pixel ratio after a long run of slow frames", () => {
    vi.stubGlobal("devicePixelRatio", 2);
    render(<Stage build={() => ({ update() {} })} />);
    nearScreen();
    onScreen();
    let now = performance.now();
    for (let i = 0; i < 50; i++) frames.shift()!((now += 40));
    expect(renderers[0].setPixelRatio).toHaveBeenNthCalledWith(1, 1.75);
    expect(renderers[0].setPixelRatio).toHaveBeenLastCalledWith(1.5);
  });

  it("should release the canvas when the scene fails to build", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Stage
        build={() => {
          throw new Error("bad model");
        }}
      />,
    );
    nearScreen();
    expect(screen.getByTestId("host").querySelector("canvas")).toBeNull();
    expect(renderers[0].forceContextLoss).toHaveBeenCalled();
    warn.mockRestore();
  });
});
