import * as THREE from 'three';

const DOWN = new THREE.Vector3(0, -1, 0);

/** Swings every upper-arm bone of a T-posed rig down toward the hips by `angle` radians, whichever way the figure faces. */
export function lowerArms(root: THREE.Object3D, angle: number) {
  root.updateWorldMatrix(true, true);
  const arms: THREE.Bone[] = [];
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone && /upperarm/i.test(o.name) && o.children.length > 0)
      arms.push(o as THREE.Bone);
  });
  for (const arm of arms) {
    const shoulder = arm.getWorldPosition(new THREE.Vector3());
    const reach = arm.children[0].getWorldPosition(new THREE.Vector3()).sub(shoulder);
    const axis = reach.normalize().cross(DOWN);
    if (axis.lengthSq() < 1e-12) continue;
    axis.normalize();
    const parent = arm.parent!.getWorldQuaternion(new THREE.Quaternion());
    const swing = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    arm.quaternion.premultiply(parent.clone().invert().multiply(swing).multiply(parent));
    arm.updateWorldMatrix(false, true);
  }
}
