import { clamp01 } from './starfield';

const BRIEFING_SPIN = 0.04;
const BRIEFING_SWEEP = 0.6;

const halfTan = (fovDeg: number) => Math.tan((fovDeg * Math.PI) / 360);

/** World x, for a camera at the origin looking down -z, of a point at `fraction` across the screen (0 left, 1 right). */
export function screenX(
  fraction: number,
  distance: number,
  fovDeg: number,
  aspect: number,
): number {
  return (2 * fraction - 1) * distance * halfTan(fovDeg) * aspect;
}

/** Yaw of the briefing disc: a slow turn with time, and a sweep as the section scrolls past. */
export function briefingYaw(t: number, scroll: number): number {
  return t * BRIEFING_SPIN + scroll * BRIEFING_SWEEP;
}

/** Distance of a subject flying in for a progress in [0, 1]: far at 0, near at 1. */
export function approachDistance(progress: number, far: number, near: number): number {
  return far + (near - far) * clamp01(progress);
}
