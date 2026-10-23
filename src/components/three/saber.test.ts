// @vitest-environment jsdom
import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { saberActor } from "./saber";

vi.mock("./load-model", () => ({ loadModel: () => new Promise(() => {}) }));

function bladeParts() {
  const scene = new THREE.Scene();
  const actor = saberActor(
    { scene, camera: new THREE.PerspectiveCamera(), reduced: false, disposed: () => false },
    { color: "#3ea8ff", turn: 0 },
  );
  actor.update(1 / 60, 1);
  const meshes: THREE.Mesh[] = [];
  scene.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh));
  actor.dispose?.();
  return {
    core: meshes.find((m) => m.material instanceof THREE.MeshBasicMaterial)!,
    glows: meshes.filter((m) => m.material instanceof THREE.ShaderMaterial),
  };
}

describe("saberActor", () => {
  it("should end the white core inside the coloured glow, so the tip stays the blade colour", () => {
    const { core, glows } = bladeParts();
    expect(glows.length).toBeGreaterThan(0);
    for (const glow of glows) expect(core.scale.y).toBeLessThan(glow.scale.y);
  });
});
