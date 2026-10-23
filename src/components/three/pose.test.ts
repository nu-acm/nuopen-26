import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { lowerArms } from "./pose";

/** A T-pose rig: each upper arm runs 0.3 straight out sideways from a shoulder at height 1. */
function tPose() {
  const root = new THREE.Group();
  const spine = new THREE.Bone();
  spine.position.set(0, 1, 0);
  root.add(spine);
  const elbows = [1, -1].map((side) => {
    const upper = new THREE.Bone();
    upper.name = side > 0 ? "Bip01_L_UpperArm_034" : "Bip01_R_UpperArm_015";
    upper.position.set(0.2 * side, 0, 0);
    const elbow = new THREE.Bone();
    elbow.position.set(0.3 * side, 0, 0);
    upper.add(elbow);
    spine.add(upper);
    return elbow;
  });
  return { root, elbows };
}

const worldOf = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());

describe("lowerArms", () => {
  it("should swing both arms down from the T-pose by the given angle", () => {
    const { root, elbows } = tPose();
    lowerArms(root, 1.2);
    for (const elbow of elbows) {
      const at = worldOf(elbow);
      expect(at.y).toBeCloseTo(1 - 0.3 * Math.sin(1.2), 5);
      expect(Math.abs(at.x)).toBeCloseTo(0.2 + 0.3 * Math.cos(1.2), 5);
      expect(at.z).toBeCloseTo(0, 5);
    }
  });

  it("should leave arms that already hang down as they are", () => {
    const { root, elbows } = tPose();
    lowerArms(root, Math.PI / 2);
    const before = elbows.map((e) => worldOf(e).toArray());
    lowerArms(root, 1.2);
    elbows.forEach((e, i) => worldOf(e).toArray().forEach((v, k) => expect(v).toBeCloseTo(before[i][k], 5)));
  });

  it("should leave a figure without arm bones as it is", () => {
    const root = new THREE.Group();
    root.add(new THREE.Mesh());
    expect(() => lowerArms(root, 1.2)).not.toThrow();
  });
});
