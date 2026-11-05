import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { fitTransform } from './fit';

export type LoadedModel = { root: THREE.Group };

/** Loads a meshopt GLB and centres it on the origin at `height` world units tall. */
export async function loadModel(url: string, height = 1): Promise<LoadedModel> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const content = gltf.scene;
  const box = new THREE.Box3().setFromObject(content);
  const { scale, offset } = fitTransform(
    { min: box.min.toArray(), max: box.max.toArray() },
    height,
  );
  content.scale.multiplyScalar(scale);
  content.position.set(...offset);
  const root = new THREE.Group();
  root.add(content);
  return { root };
}

/** Frees the GPU memory of everything under `root`. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const m = mesh.material;
    for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
      for (const value of Object.values(mat)) if (value instanceof THREE.Texture) value.dispose();
      mat.dispose();
    }
  });
}
