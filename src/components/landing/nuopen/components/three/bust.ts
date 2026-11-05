import * as THREE from 'three';

import { damp } from '@/components/landing/nuopen/lib/scene-path';
import { type Side, sideStore } from '@/components/landing/nuopen/lib/side';

import { disposeTree, loadModel } from './load-model';
import { lowerArms } from './pose';
import type { StageActor, StageContext } from './use-stage';

export type BustLook = { progress: number; pointerX: number; pointerY: number };

type Figure = {
  name: string;
  url: string;
  height: number;
  lift: number;
  turn?: number;
  arms?: number;
};

// Vader's file is a bust; Anakin's is a full T-posed figure facing +x, scaled, turned and lowered into the same frame.
export const FIGURES: Record<Side, Figure> = {
  dark: { name: 'Darth Vader', url: '/nuopen/models/vader.glb', height: 2, lift: 0 },
  light: {
    name: 'Anakin Skywalker',
    url: '/nuopen/models/anakin.glb',
    height: 2.33,
    lift: -0.165,
    turn: -Math.PI / 2,
    arms: 1.25,
  },
};

const BREATH_S = 4.5;
const BREATH_RISE = 0.008;
const EYE_Y = 0.5;
const DOLLY = { from: 2.7, to: 2.25 };
const TURN = { yaw: 0.22, pitch: 0.08 };

/** The Rules figure: Vader on the dark side, Anakin on the light side, breathing and following the pointer. */
export function bustActor(
  { scene, camera, reduced, disposed }: StageContext,
  look: BustLook,
): StageActor {
  const key = new THREE.DirectionalLight('#fff4e4', 2.4);
  key.position.set(0.4, 3, 1.6);
  const rim = new THREE.DirectionalLight('#ffffff', 4);
  rim.position.set(-1.2, 1, -2.4);
  const chest = new THREE.PointLight('#ffffff', 0.25, 0.9, 2);
  chest.position.set(0, 0.1, 0.5);
  scene.add(key, rim, chest, new THREE.HemisphereLight('#8fa6d6', '#000000', 0.06));

  const bust = new THREE.Group();
  scene.add(bust);
  const dollyAt = (pose: number) => DOLLY.from + (DOLLY.to - DOLLY.from) * pose;
  camera.position.set(0, EYE_Y, dollyAt(reduced ? 1 : look.progress));
  camera.lookAt(0, EYE_Y, 0);

  const figures = new Map<Side, THREE.Object3D>();
  const requested = new Set<Side>();

  const load = (side: Side) => {
    requested.add(side);
    const { name, url, height, lift, turn = 0, arms } = FIGURES[side];
    loadModel(url, height)
      .then((m) => {
        if (disposed()) {
          disposeTree(m.root);
          return;
        }
        m.root.position.y = lift;
        m.root.rotation.y = turn;
        if (arms) lowerArms(m.root, arms);
        m.root.visible = sideStore.get().side === side;
        bust.add(m.root);
        figures.set(side, m.root);
      })
      .catch((error) => {
        requested.delete(side);
        console.warn(`${name} failed to load`, error);
      });
  };

  const follow = () => {
    const { side } = sideStore.get();
    const saber = getComputedStyle(document.documentElement).getPropertyValue('--saber').trim();
    if (saber) {
      rim.color.set(saber);
      chest.color.set(saber);
    }
    figures.forEach((figure, s) => (figure.visible = s === side));
    if (!requested.has(side)) load(side);
  };
  follow();
  const unsubscribe = sideStore.subscribe(follow);

  let yaw = 0;
  let pitch = 0;

  return {
    update(dt, t) {
      const dolly = dollyAt(reduced ? 1 : look.progress);
      camera.position.z = reduced ? dolly : damp(camera.position.z, dolly, 3, dt);

      const breath = reduced ? 0 : Math.sin((2 * Math.PI * t) / BREATH_S);
      yaw = damp(yaw, reduced ? 0 : look.pointerX * TURN.yaw, 4, dt);
      pitch = damp(pitch, reduced ? 0 : look.pointerY * TURN.pitch, 4, dt);
      bust.position.y = breath * BREATH_RISE;
      bust.rotation.set(pitch, yaw, 0);
      chest.intensity = 0.25 + 0.06 * breath;
    },
    dispose: unsubscribe,
  };
}
