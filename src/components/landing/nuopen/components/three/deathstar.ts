import * as THREE from 'three';

import { disposeTree, loadModel } from './load-model';

export const DEATH_STAR_MODEL = '/nuopen/models/deathstar.glb';

export function lightDeathStar(scene: THREE.Scene) {
  scene.environmentIntensity = 0.04;
  const key = new THREE.DirectionalLight('#fff3e4', 3.4);
  key.position.set(-5, 1.2, 1.8);
  const rim = new THREE.DirectionalLight('#cfe0ff', 1.4);
  rim.position.set(3.5, 1, -3);
  scene.add(key, rim, new THREE.HemisphereLight('#8fa6d6', '#000000', 0.05));
}

export function attachDeathStar(parent: THREE.Object3D, disposed: () => boolean) {
  loadModel(DEATH_STAR_MODEL, 2)
    .then((m) => {
      if (disposed()) {
        disposeTree(m.root);
        return;
      }
      parent.add(m.root);
    })
    .catch((error) => console.warn('Death Star failed to load', error));
}
