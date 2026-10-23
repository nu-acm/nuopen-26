import * as THREE from "three";

import { clusterPoints, type Point3 } from "@/lib/cluster";
import { damp } from "@/lib/scene-path";

import { disposeTree, loadModel } from "./load-model";
import type { StageActor, StageContext } from "./use-stage";

/** `ready` is 0 while the intro still covers the hero; the fly-in starts once it is 1 and sets `landed` when done. */
export type Flight = { scroll: number; ready: number; landed?: boolean };

export const DESTROYER_MODEL = "/models/destroyer.glb";

const ENTRY_S = 5.5;
const DRIFT = 0.06;
const MAX_DRIFT = 6;
const START = { y: 2, z: 1.4 };
const REST = { y: 2.6, z: -7.6 };
const EXIT_Z = -13;
const ENGINE_BAND = 0.14;
// Measured on destroyer.glb (23 Oct 2026): engine cores top out at 32% of the hull height, deck lights start at 37%.
const DECK_LINE = 0.35;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

function glowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(190,228,255,0.9)");
  g.addColorStop(0.45, "rgba(90,170,255,0.35)");
  g.addColorStop(1, "rgba(40,110,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const isGlowing = (m: THREE.MeshStandardMaterial) => !!m.emissiveMap || m.emissive?.getHex() > 0;

/** Stern vertices of the emissive parts, in model space; the join step merged every engine bell into one mesh. */
function sternPoints(model: THREE.Object3D, stern: number, halfWidth: number): Point3[] {
  const points: Point3[] = [];
  const v = new THREE.Vector3();
  const toModel = new THREE.Matrix4().copy(model.matrixWorld).invert();
  model.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !isGlowing(mesh.material as THREE.MeshStandardMaterial)) return;
    const pos = mesh.geometry.attributes.position;
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toModel);
      if (v.z <= stern && Math.abs(v.x) <= halfWidth) points.push([v.x, v.y, v.z]);
    }
  });
  return points;
}

/** Blue exhaust glows over the engine bells at the stern; returns the glow material so callers can dim or flare it. */
export function addEngineGlow(model: THREE.Object3D): THREE.SpriteMaterial {
  model.updateWorldMatrix(true, true);
  const hull = new THREE.Box3().setFromObject(model).applyMatrix4(model.matrixWorld.clone().invert());
  const width = hull.max.x - hull.min.x;
  const stern = hull.min.z + (hull.max.z - hull.min.z) * ENGINE_BAND;
  const deck = hull.min.y + (hull.max.y - hull.min.y) * DECK_LINE;
  // The bells sit low in the middle third of the stern; the wing tips carry running lights, the deck and tower windows.
  const engines = clusterPoints(sternPoints(model, stern, width * 0.3), width * 0.05)
    .filter((c) => c.y < deck)
    .slice(0, 10);
  const material = new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  for (const e of engines) {
    const sprite = new THREE.Sprite(material);
    sprite.position.set(e.x, e.y, e.z - 0.03);
    sprite.scale.setScalar(Math.max(e.size * 2.4, width * 0.06));
    model.add(sprite);
  }
  return material;
}

/** The opening shot of A New Hope: a Star Destroyer passes overhead and flies away from the camera. */
export function destroyerActor({ scene, camera, reduced, disposed }: StageContext, flight: Flight): StageActor {
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0.12, -1);

  const sun = new THREE.DirectionalLight("#fff1dc", 1.7);
  sun.position.set(4, 6, 3);
  const under = new THREE.DirectionalLight("#7fb2ff", 0.7);
  under.position.set(-1, -4, 2);
  const rim = new THREE.DirectionalLight("#c9dcff", 1.6);
  rim.position.set(-3, 2, -8);
  scene.add(sun, under, rim, new THREE.HemisphereLight("#8fa6d6", "#000000", 0.22));

  const ship = new THREE.Group();
  ship.visible = false;
  scene.add(ship);
  // The model's bow points down +z; turned around it flies away from the camera.
  ship.rotation.set(0.08, Math.PI, 0);

  loadModel(DESTROYER_MODEL, 1)
    .then((m) => {
      if (disposed()) {
        disposeTree(m.root);
        return;
      }
      addEngineGlow(m.root);
      ship.add(m.root);
      ship.visible = true;
    })
    .catch((error) => console.warn("Star Destroyer failed to load", error));

  const settled = reduced || flight.landed;
  let since = settled ? ENTRY_S : 0;
  let z = settled ? REST.z : START.z;
  let y = settled ? REST.y : START.y;
  let fit = 1;

  return {
    resize(width, height) {
      fit = Math.min(1, (width / height) * 1.05);
    },
    update(dt) {
      if (flight.ready >= 1 && ship.visible) since += dt;
      const entry = easeOut(Math.min(1, since / ENTRY_S));
      if (entry >= 1) flight.landed = true;
      const drift = reduced ? 0 : Math.min(MAX_DRIFT, Math.max(0, since - ENTRY_S) * DRIFT);
      // Receding along its own sightline keeps it in the band above the title instead of sinking into it.
      const restZ = REST.z - drift;
      const restY = REST.y * (restZ / REST.z);
      const tz = START.z + (restZ - START.z) * entry + flight.scroll * (EXIT_Z - REST.z);
      const ty = START.y + (restY - START.y) * entry + flight.scroll * 0.6;
      z = reduced ? tz : damp(z, tz, 6, dt);
      y = reduced ? ty : damp(y, ty, 6, dt);
      ship.position.set(0, y, z);
      ship.scale.setScalar(fit);
    },
  };
}
