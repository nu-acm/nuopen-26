// @vitest-environment jsdom
import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sideStore } from "@/lib/side";

import { bustActor } from "./bust";

type Pending = { url: string; root: THREE.Group; resolve: () => void; reject: () => void };
const pending = vi.hoisted(() => [] as Pending[]);

vi.mock("./load-model", async () => {
  const { Group } = await import("three");
  return {
    loadModel: (url: string) =>
      new Promise((resolve, reject) => {
        const root = new Group();
        root.name = url;
        pending.push({ url, root, resolve: () => resolve({ root }), reject: () => reject(new Error("offline")) });
      }),
    disposeTree: () => undefined,
  };
});

const VADER = "/models/vader.glb";
const ANAKIN = "/models/anakin.glb";

function stage(progress = 0) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const actor = bustActor({ scene, camera, reduced: false, disposed: () => false }, { progress, pointerX: 0, pointerY: 0 });
  const figure = (url: string) => scene.getObjectByName(url);
  return { actor, figure, camera };
}

async function land(url: string) {
  const load = pending.find((p) => p.url === url);
  if (!load) throw new Error(`${url} was never requested`);
  load.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("bustActor", () => {
  beforeEach(() => {
    pending.length = 0;
    sideStore.reset();
    sideStore.choose("dark");
  });
  afterEach(() => sideStore.reset());

  it("should show Darth Vader on the dark side", async () => {
    const { figure } = stage();
    expect(pending.map((p) => p.url)).toEqual([VADER]);
    await land(VADER);
    expect(figure(VADER)?.visible).toBe(true);
  });

  it("should swap Vader for Anakin when the visitor turns to the light side", async () => {
    const { figure } = stage();
    await land(VADER);
    sideStore.choose("light");
    await land(ANAKIN);
    expect(figure(ANAKIN)?.visible).toBe(true);
    expect(figure(VADER)?.visible).toBe(false);
  });

  it("should reuse a figure it already loaded when the visitor turns back", async () => {
    const { figure } = stage();
    await land(VADER);
    sideStore.choose("light");
    await land(ANAKIN);
    sideStore.choose("dark");
    expect(pending).toHaveLength(2);
    expect(figure(VADER)?.visible).toBe(true);
    expect(figure(ANAKIN)?.visible).toBe(false);
  });

  it("should keep a figure hidden if the side changed while it was loading", async () => {
    const { figure } = stage();
    sideStore.choose("light");
    await land(VADER);
    expect(figure(VADER)?.visible).toBe(false);
  });

  it("should try a figure again on the next side change if its load failed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    stage();
    pending[0].reject();
    await Promise.resolve();
    await Promise.resolve();
    sideStore.choose("light");
    sideStore.choose("dark");
    expect(pending.filter((p) => p.url === VADER)).toHaveLength(2);
  });

  it("should stop following the side once the stage is disposed", () => {
    const { actor } = stage();
    actor.dispose?.();
    sideStore.choose("light");
    expect(pending.map((p) => p.url)).toEqual([VADER]);
  });

  it("should frame the figure for the current scroll when the stage is rebuilt, instead of dollying in again", () => {
    const { camera: start } = stage(0);
    const { camera: rebuilt } = stage(1);
    expect(rebuilt.position.z).toBeLessThan(start.position.z);
  });
});
