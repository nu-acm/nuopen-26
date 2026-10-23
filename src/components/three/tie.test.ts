// @vitest-environment jsdom
import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { tieActor } from "./tie";

const loads = vi.hoisted(() => [] as string[]);
vi.mock("./load-model", () => ({
  loadModel: (url: string) => {
    loads.push(url);
    return new Promise(() => {});
  },
  disposeTree: () => undefined,
}));

function fly(progress: number, reduced = false, frames = 600) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9);
  const actor = tieActor({ scene, camera, reduced, disposed: () => false }, { progress });
  for (let i = 0; i < frames; i++) actor.update(1 / 60, i / 60);
  const ship = scene.children.find((o) => o instanceof THREE.Group)!;
  return ship.position.clone();
}

describe("tieActor", () => {
  it("should load the TIE fighter model", () => {
    fly(0);
    expect(loads).toContain("/models/tie.glb");
  });

  it("should fly in from deep space toward the viewer as the section scrolls in", () => {
    const far = fly(0);
    const near = fly(1);
    expect(near.z).toBeGreaterThan(far.z);
    expect(near.z).toBeLessThan(0);
  });

  it("should hold beside the copy, on the right half of a wide screen", () => {
    expect(fly(1).x).toBeGreaterThan(0);
  });

  it("should skip the dive and hold position when motion is reduced", () => {
    expect(fly(0, true).z).toBeCloseTo(fly(1).z, 1);
  });

  it("should pick up where the scroll already is when the stage is rebuilt, instead of diving in again", () => {
    expect(fly(1, false, 1).z).toBeCloseTo(fly(1).z, 1);
  });
});
