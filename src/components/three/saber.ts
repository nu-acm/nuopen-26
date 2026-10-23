import * as THREE from "three";

import { SABER_SIZE, beginSwap, colourDue, fitHeight, swapDone, swapLength, type Swap } from "@/lib/saber";
import { damp } from "@/lib/scene-path";

import { EFFECTS, playEffect } from "../ui/soundtrack";
import { disposeTree, loadModel } from "./load-model";
import type { StageActor, StageContext } from "./use-stage";

/** Written by the section: the side's --saber colour, and scroll progress through the section (0..1). */
export type Hilt = { color: string; turn: number };

const { hilt: HILT_LENGTH, blade: BLADE_LENGTH } = SABER_SIZE;
const SABER_LENGTH = HILT_LENGTH + BLADE_LENGTH;
const AXIS = Math.PI / 2;
const CORE_COLOUR = "#f7f5ef";
const CORE_RADIUS = 0.025;
// The core stops short of the glow so the tip ends in the blade colour, not a white needle.
const CORE_REACH = 0.97;
// `fill` is the share of the band the saber's box may take; `halo` is the glow's spread past the blade.
const FRAME = { fill: 0.96, halo: 0.25 };
const BOX = {
  width: SABER_LENGTH * Math.abs(Math.cos(AXIS)) + 2 * FRAME.halo,
  height: SABER_LENGTH * Math.abs(Math.sin(AXIS)) + 2 * FRAME.halo,
};
const GLOWS = [
  { radius: 0.06, strength: 1.0, power: 1.8 },
  { radius: 0.14, strength: 0.55, power: 1.3 },
  { radius: 0.32, strength: 0.3, power: 4 },
];

const GLOW_VERT = `
uniform float uTime;
uniform float uWobble;
varying vec3 vN;
varying vec3 vV;
varying float vY;
void main() {
  vec3 p = position;
  p.xz *= 1.0 + uWobble * 0.03 * sin(uTime * 37.0 + p.y * 9.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vY = position.y;
  gl_Position = projectionMatrix * mv;
}`;

const GLOW_FRAG = `
uniform vec3 uColor;
uniform float uStrength;
uniform float uPower;
uniform float uTime;
varying vec3 vN;
varying vec3 vV;
varying float vY;
void main() {
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float tip = 1.0 - smoothstep(0.96, 1.0, vY);
  float flicker = 1.0 + 0.04 * sin(uTime * 53.0) * sin(uTime * 19.0);
  gl_FragColor = vec4(uColor, pow(facing, uPower) * uStrength * tip * flicker);
  #include <colorspace_fragment>
}`;

type Shared = { time: { value: number }; wobble: { value: number }; colour: THREE.Color };
type Part = { mesh: THREE.Mesh; radius: number; reach: number };

function glowMaterial(strength: number, power: number, shared: Shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: shared.colour },
      uStrength: { value: strength },
      uPower: { value: power },
      uTime: shared.time,
      uWobble: shared.wobble,
    },
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function buildBlade(shared: Shared) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 40, 1, false).translate(0, 0.5, 0);
  const core = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: CORE_COLOUR, toneMapped: false }));
  const glows = GLOWS.map((g) => ({ mesh: new THREE.Mesh(geometry, glowMaterial(g.strength, g.power, shared)), radius: g.radius, reach: 1 }));
  const light = new THREE.PointLight(0xffffff, 3, 6, 2);
  light.position.set(0, 0.12, 0);
  const parts: Part[] = [{ mesh: core, radius: CORE_RADIUS, reach: CORE_REACH }, ...glows];
  const rig = new THREE.Group();
  // Measured on saber.glb: its +x end is the emitter, the end the blade leaves.
  rig.position.set(HILT_LENGTH / 2, 0, 0);
  rig.rotation.z = -Math.PI / 2;
  rig.add(...parts.map((p) => p.mesh), light);
  return { rig, light, parts };
}

export const SABER_MODEL = "/models/saber.glb";

export function saberActor({ scene, camera, reduced, disposed }: StageContext, hilt: Hilt): StageActor {
  const shared: Shared = { time: { value: 0 }, wobble: { value: reduced ? 0 : 1 }, colour: new THREE.Color() };
  const blade = buildBlade(shared);
  const key = new THREE.DirectionalLight("#fff3e2", 2.4);
  key.position.set(-3, 4, 6);
  const rim = new THREE.DirectionalLight(0xffffff, 1.6);
  rim.position.set(3, -2, -5);

  const pivot = new THREE.Group();
  // Centred on the pivot so the turn on scroll does not swing the blade out of frame.
  const lean = new THREE.Group();
  lean.rotation.z = AXIS;
  lean.position.set(-Math.cos(AXIS), -Math.sin(AXIS), 0).multiplyScalar(BLADE_LENGTH / 2);
  lean.add(blade.rig);
  pivot.add(lean);
  scene.add(pivot, key, rim);

  loadModel(SABER_MODEL, 1)
    .then((m) => {
      if (disposed()) {
        disposeTree(m.root);
        return;
      }
      const span = new THREE.Box3().setFromObject(m.root).getSize(new THREE.Vector3()).x;
      m.root.scale.setScalar(HILT_LENGTH / span);
      lean.add(m.root);
    })
    .catch((error) => console.warn("Luke's saber failed to load", error));

  const place = (width: number, height: number) => {
    const visible = fitHeight(BOX.width, BOX.height, width / height, FRAME.fill);
    camera.position.set(0, 0, visible / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)));
    camera.lookAt(0, 0, 0);
  };

  const aim = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    aim.x = (e.clientX / innerWidth) * 2 - 1;
    aim.y = (e.clientY / innerHeight) * 2 - 1;
  };
  if (!reduced) addEventListener("pointermove", onPointer);

  const paint = (hex: string) => {
    shared.colour.set(hex);
    blade.light.color.set(hex);
    rim.color.set(hex);
  };
  let shown = "";
  let seen = "";
  let swap: Swap | null = null;
  let tilt = { x: 0, y: 0 };

  return {
    update(dt, t) {
      shared.time.value = reduced ? 0 : t;
      if (hilt.color && hilt.color !== seen) {
        seen = hilt.color;
        if (!shown || reduced) {
          shown = seen;
          paint(seen);
          swap = null;
        } else swap = beginSwap(swap, t);
      }
      if (swap && shown !== seen && colourDue(swap, t)) {
        shown = seen;
        paint(seen);
      }
      if (swap && swapDone(swap, t)) swap = null;
      const length = swapLength(swap, t);
      for (const { mesh, radius, reach } of blade.parts) mesh.scale.set(radius, length * BLADE_LENGTH * reach, radius);

      tilt = {
        x: damp(tilt.x, reduced ? 0 : aim.y, 3, dt),
        y: damp(tilt.y, reduced ? 0 : aim.x, 3, dt),
      };
      pivot.position.y = reduced ? 0 : Math.sin(t * 0.6) * 0.05;
      pivot.rotation.set(tilt.x * 0.12, hilt.turn + tilt.y * 0.25, 0);
    },
    resize: place,
    dispose: () => removeEventListener("pointermove", onPointer),
    hit: { target: lean, onHit: () => playEffect(EFFECTS.swing) },
  };
}
