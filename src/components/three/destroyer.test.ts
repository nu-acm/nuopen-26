// @vitest-environment jsdom
import * as THREE from "three";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { addEngineGlow, destroyerActor } from "./destroyer";

vi.mock("./load-model", () => ({ loadModel: () => new Promise(() => {}) }));

const glowing = new THREE.MeshStandardMaterial({ emissive: "#3ea8ff" });
const paint = new THREE.MeshStandardMaterial();

function part(material: THREE.Material, size: [number, number, number], at: [number, number, number]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...at);
  return mesh;
}

/**
 * A 2×4 hull with its bow at +z and a bridge tower near the stern: two engine bells low on the stern,
 * window lights on the deck and the tower above them, and a running light mid-ship.
 */
function ship(scale: number) {
  const bell: [number, number, number] = [0.04, 0.04, 0.04];
  const root = new THREE.Group();
  root.add(
    part(paint, [2, 0.4, 4], [0, 0, 0]),
    part(paint, [0.4, 0.5, 0.4], [0, 0.45, -1.6]),
    part(glowing, bell, [-0.4, 0, -1.9]),
    part(glowing, bell, [0.4, 0, -1.9]),
    part(glowing, bell, [0.3, 0.19, -1.9]),
    part(glowing, bell, [0, 0.5, -1.82]),
    part(glowing, bell, [0, 0.2, -1]),
  );
  root.scale.setScalar(scale);
  return root;
}

const glowSpots = (root: THREE.Object3D) =>
  root.children
    .filter((c): c is THREE.Sprite => (c as THREE.Sprite).isSprite)
    .map((s) => [Math.round(s.position.x * 10) / 10, Math.round(s.position.z * 10) / 10])
    .sort((a, b) => a[0] - b[0]);

describe("addEngineGlow", () => {
  beforeAll(() => {
    const ctx = {
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect() {},
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never);
  });

  it.each([1, 0.25])("should light only the engine bells, not the deck or tower windows, when the ship is scaled by %s", (scale) => {
    const root = ship(scale);
    addEngineGlow(root);
    expect(glowSpots(root)).toEqual([
      [-0.4, -1.9],
      [0.4, -1.9],
    ]);
  });
});

describe("destroyerActor", () => {
  it("should not replay the fly-in when the hero stage is rebuilt after the ship has landed", () => {
    const scene = new THREE.Scene();
    const actor = destroyerActor(
      { scene, camera: new THREE.PerspectiveCamera(), reduced: false, disposed: () => false },
      { scroll: 0, ready: 1, landed: true },
    );
    actor.update(1 / 60, 0);
    const ship = scene.children.find((o) => o instanceof THREE.Group)!;
    expect(ship.position.z).toBeLessThan(-7);
  });
});
