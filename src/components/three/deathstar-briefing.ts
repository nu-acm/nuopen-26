import * as THREE from "three";

import { briefingYaw } from "@/lib/deathstar-shot";
import { framingDistance } from "@/lib/transit";

import { attachDeathStar, lightDeathStar } from "./deathstar";
import type { StageActor, StageContext } from "./use-stage";

/** Scroll progress through the section (0..1), scrubbed by GSAP in the component. */
export type Progress = { scroll: number };

const DISC = { width: 2, height: 2 };
/** Share of the stage's shorter side the disc takes; the reticle ring sits just outside it. */
const FILL = { width: 0.8, height: 0.8 };
const TILT_X = 0.12;

export function briefingDeathStarActor({ scene, camera, reduced, disposed }: StageContext, progress: Progress): StageActor {
  lightDeathStar(scene);
  const planet = new THREE.Group();
  planet.rotation.x = TILT_X;
  scene.add(planet);
  attachDeathStar(planet, disposed);

  const frame = () => {
    const view = { fovY: THREE.MathUtils.degToRad(camera.fov), aspect: camera.aspect };
    camera.position.set(0, 0, framingDistance(DISC, view, FILL));
    camera.lookAt(0, 0, 0);
  };
  frame();

  return {
    update(_dt, t) {
      planet.rotation.y = reduced ? 0 : briefingYaw(t, progress.scroll);
    },
    resize: frame,
  };
}
