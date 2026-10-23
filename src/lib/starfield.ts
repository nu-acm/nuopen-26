export type Star = { x: number; y: number; z: number; size: number };

/** Star speed in depth units per second: a slow drift at rest, full lightspeed at warp 1. */
export const SPEED = { drift: 0.015, lightspeed: 2.4 } as const;

export function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 0.02 + Math.random() * 0.98,
    size: 0.4 + Math.random() ** 3 * 1.6,
  }));
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIn = (t: number) => t * t * t;

/** Star speed in depth units per second for a warp level. */
export const speedOf = (warp: number) => SPEED.drift + (SPEED.lightspeed - SPEED.drift) * easeIn(clamp01(warp));

/** Screen position and radius of a star; depth 1 is the far plane, the camera sits at 0. */
export function project(star: Star, width: number, height: number) {
  const scale = Math.max(width, height) * 0.5;
  const k = 0.18 / star.z;
  return {
    sx: width / 2 + star.x * scale * k,
    sy: height / 2 + star.y * scale * k,
    r: Math.min(2.6, star.size * (0.35 + 0.25 / star.z)),
  };
}
