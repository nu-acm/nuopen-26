import * as THREE from 'three';

import { approachDistance, screenX } from '@/components/landing/nuopen/lib/deathstar-shot';
import { damp } from '@/components/landing/nuopen/lib/scene-path';
import { tieFlight } from '@/components/landing/nuopen/lib/tie-flight';

import { EFFECTS, playEffect } from '../ui/soundtrack';
import { disposeTree, loadModel } from './load-model';
import type { StageActor, StageContext } from './use-stage';

/** Scroll progress through the section (0..1), scrubbed by GSAP in the component. */
export type Approach = { progress: number };

type Shape = 'wide' | 'narrow';
const FAR: Record<Shape, number> = { wide: 46, narrow: 52 };
const NEAR: Record<Shape, number> = { wide: 8.5, narrow: 9 };
const ACROSS: Record<Shape, { from: number; to: number }> = {
  wide: { from: 0.98, to: 0.74 },
  narrow: { from: 0.75, to: 0.36 },
};
const DIVE_LIFT = 4;
// The model's nose points at the camera; this turns it three-quarters toward the copy on the left.
const FACING = { yaw: -0.85, pitch: 0.12 };

export const TIE_MODEL = '/nuopen/models/tie.glb';

export function tieActor(
  { scene, camera, reduced, disposed }: StageContext,
  approach: Approach,
): StageActor {
  const key = new THREE.DirectionalLight('#fff3e4', 3);
  key.position.set(5, 3, 3);
  const rim = new THREE.DirectionalLight('#cfe0ff', 2.2);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight('#8fa6d6', '#000000', 0.08));

  const ship = new THREE.Group();
  scene.add(ship);
  loadModel(TIE_MODEL, 2)
    .then((m) => {
      if (disposed()) {
        disposeTree(m.root);
        return;
      }
      ship.add(m.root);
    })
    .catch((error) => console.warn('TIE fighter failed to load', error));

  let progress = reduced ? 1 : approach.progress;

  return {
    update(dt, t) {
      const shape: Shape = camera.aspect > 1.2 ? 'wide' : 'narrow';
      progress = reduced ? 1 : damp(progress, approach.progress, 4, dt);
      const pose = tieFlight(progress, reduced ? 0 : t);
      const { arrive } = pose;

      const dist = approachDistance(arrive, FAR[shape], NEAR[shape]);
      const across = ACROSS[shape].from + (ACROSS[shape].to - ACROSS[shape].from) * arrive;
      ship.position.set(
        screenX(across, dist, camera.fov, camera.aspect),
        (1 - arrive) * DIVE_LIFT + pose.bob,
        -dist,
      );
      ship.rotation.set(FACING.pitch, FACING.yaw + pose.yaw, pose.roll);
    },
    hit: { target: ship, onHit: () => playEffect(EFFECTS.blaster) },
  };
}
