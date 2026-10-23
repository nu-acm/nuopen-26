import { clamp01 } from "./starfield";

const BANK = 0.9;
const TURN = 0.6;
const HOVER = { s: 5.5, rise: 0.06, sway: 0.04 };

/** `arrive` runs 0..1 from deep space to the hover; angles are radians added to the resting pose. */
export type TiePose = { arrive: number; roll: number; yaw: number; bob: number };

/** The TIE dives in banked as the section scrolls in, brakes into a hover, then bobs while it holds position. */
export function tieFlight(progress: number, t: number): TiePose {
  const left = (1 - clamp01(progress)) ** 3;
  const wave = Math.sin((2 * Math.PI * t) / HOVER.s);
  return { arrive: 1 - left, roll: left * BANK + wave * HOVER.sway, yaw: left * TURN, bob: wave * HOVER.rise };
}
