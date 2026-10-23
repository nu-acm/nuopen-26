import * as THREE from "three";

import { framingDistance, shipPose, transitFrame } from "@/lib/transit";

import { addEngineGlow } from "./destroyer";
import { disposeTree, loadModel } from "./load-model";
import type { StageActor, StageContext } from "./use-stage";

/** Scroll progress through the transit, 0..1; the section writes it and the actor reads it every frame. */
export type Transit = { progress: number };

// Seen from behind and a little above: the engine bells face the camera.
const ELEVATION = 0.12;
const DIVE = 1.2;
// The stern is nearest the camera, so the silhouette sits low until the ship is lifted.
const LIFT = 0.05;
const TREMOR = 0.012;
const DRIFT = 0.012;
const WIDE = { width: 0.56, height: 0.5 };
// The projected stern is wider than the model's wingspan, so 0.72 reads as about 0.8 of the phone width.
const PHONE = { width: 0.72, height: 0.5 };
const PHONE_ASPECT = 0.8;
const ENGINE_IDLE = 0.5;
const ENGINE_BURN = 1.5;
const EXHAUST = 0.025;
const HULL_ROUGHNESS = 0.85;

/** The jump: a Star Destroyer held centre-frame, then flown straight into the vanishing point at the centre of the view. */
export function jumpActor({ scene, camera, reduced, disposed }: StageContext, transit: Transit): StageActor {
  // Deep space has one sun and almost no fill: a grey hull lit from every side reads as chrome.
  scene.environmentIntensity = 0.06;
  const sun = new THREE.DirectionalLight("#f6f3ec", 3.2);
  sun.position.set(-3, 4, 3);
  const rim = new THREE.DirectionalLight("#a9c8ff", 1.6);
  rim.position.set(3, 1, -5);
  scene.add(sun, rim, new THREE.HemisphereLight("#8fa6d6", "#05060a", 0.08));

  const pivot = new THREE.Group();
  const ship = new THREE.Group();
  // The model's bow points down +z; turned around, the engines face the camera.
  ship.rotation.y = Math.PI;
  ship.visible = false;
  const exhaust = new THREE.PointLight("#9cc8ff", 0, 0, 2);
  exhaust.position.set(0, -0.06, 0.58);
  ship.add(exhaust);
  pivot.add(ship);
  scene.add(pivot);

  const ahead = new THREE.Vector3();
  let footprint = { width: 0.56, height: 0.4 };
  let distance = 2;
  let glow: THREE.SpriteMaterial | undefined;

  const frame = () => {
    const fill = camera.aspect < PHONE_ASPECT ? PHONE : WIDE;
    distance = framingDistance(footprint, { fovY: THREE.MathUtils.degToRad(camera.fov), aspect: camera.aspect }, fill);
    camera.position.set(0, Math.sin(ELEVATION) * distance, Math.cos(ELEVATION) * distance);
    camera.lookAt(0, 0, 0);
    ahead.set(0, 0, 0).sub(camera.position).normalize();
  };

  loadModel("/models/destroyer.glb", 1)
    .then((m) => {
      if (disposed()) {
        disposeTree(m.root);
        return;
      }
      const size = new THREE.Box3().setFromObject(m.root).getSize(new THREE.Vector3());
      const length = Math.max(size.x, size.z);
      m.root.scale.setScalar(1 / length);
      footprint = {
        width: size.x / length,
        height: (size.y * Math.cos(ELEVATION) + size.z * Math.sin(ELEVATION)) / length,
      };
      m.root.traverse((o) => {
        const paint = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (paint?.isMeshStandardMaterial) paint.roughness = Math.max(paint.roughness, HULL_ROUGHNESS);
      });
      glow = addEngineGlow(m.root);
      ship.add(m.root);
      ship.visible = true;
      frame();
    })
    .catch((error) => console.warn("Star Destroyer failed to load", error));

  return {
    resize: frame,
    update(_dt, t) {
      const f = transitFrame(transit.progress);
      const pose = shipPose(f);
      const calm = reduced ? 0 : 1 - f.lurch;
      const jitter = TREMOR * f.tremor;
      pivot.position.copy(ahead).multiplyScalar(pose.travel * DIVE * distance);
      pivot.position.x += jitter * Math.sin(t * 67);
      pivot.position.y += LIFT * (1 - f.lurch) + jitter * Math.cos(t * 53) + DRIFT * calm * Math.sin(t * 0.8);
      ship.rotation.y = Math.PI + 0.05 * calm * Math.sin(t * 0.5);
      ship.scale.set(pose.scale, pose.scale, pose.scale * pose.stretch);
      const burn = ENGINE_IDLE + ENGINE_BURN * f.engines;
      glow?.color.setRGB(0.45 * burn, 0.7 * burn, burn);
      exhaust.intensity = ship.visible ? EXHAUST * burn : 0;
    },
  };
}
