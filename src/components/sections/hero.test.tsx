// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { INTRO_DONE } from "@/lib/intro";

import { Hero } from "./hero";

const { ship } = vi.hoisted(() => ({ ship: { flight: { ready: -1 } } }));

vi.mock("../three/use-stage", () => ({ useStage: (_host: unknown, build: (ctx: unknown) => unknown) => build({}) }));
vi.mock("../three/destroyer", () => ({
  DESTROYER_MODEL: "/models/destroyer.glb",
  destroyerActor: (_ctx: unknown, flight: { ready: number }) => {
    ship.flight = flight;
    return { update() {} };
  },
}));

describe("Hero", () => {
  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.intro;
  });

  it("should hold the Star Destroyer until the opening finishes", () => {
    document.documentElement.dataset.intro = "1";
    render(<Hero />);
    expect(ship.flight.ready).toBe(0);
    act(() => void dispatchEvent(new Event(INTRO_DONE)));
    expect(ship.flight.ready).toBe(1);
  });

  it("should fly the Star Destroyer in at once when there is no opening", () => {
    render(<Hero />);
    expect(ship.flight.ready).toBe(1);
  });
});
