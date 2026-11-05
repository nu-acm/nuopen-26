import { clamp01 } from './starfield';

/** Scroll progress where each beat of the transit starts; the jump itself runs from `jump` to `arrive`. */
export const BEAT = { charge: 0.2, jump: 0.4, arrive: 0.5, tunnel: 0.8 } as const;

const FLASH_RISE = 0.025;
const FLASH_FALL = 0.12;
const HALF = 0.5;
const MIN_SCALE = 0.001;
const STRETCH = 0.6;
const SHRINK_FROM = 0.5;

export type TransitFrame = {
  /** Starfield warp: 0 at rest, 1 at full streaks. */
  warp: number;
  /** Engine glow: 0 cold, 1 at full burn. */
  engines: number;
  /** Linear progress through the jump: 0 at its start, 1 at arrival. */
  leap: number;
  /** How far the ship has run into the vanishing point: 0 centred, 1 gone. */
  lurch: number;
  /** White flash at the vanishing point. */
  flash: number;
  /** Tremor of the charge, fading out in the jump. */
  tremor: number;
};

const between = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function warpAt(p: number) {
  if (p < BEAT.jump) return HALF * easeIn(between(p, BEAT.charge, BEAT.jump));
  if (p < BEAT.tunnel) return HALF + HALF * easeOut(between(p, BEAT.jump, BEAT.arrive));
  return 1 - smooth(between(p, BEAT.tunnel, 1));
}

/** Every visual of the hyperspace transit at scroll progress `progress`. */
export function transitFrame(progress: number): TransitFrame {
  const p = clamp01(progress);
  const charge = between(p, BEAT.charge, BEAT.jump);
  const leap = between(p, BEAT.jump, BEAT.arrive);
  const lurch = easeIn(leap);
  const flash =
    p < BEAT.arrive
      ? smooth(between(p, BEAT.arrive - FLASH_RISE, BEAT.arrive))
      : 1 - smooth(between(p, BEAT.arrive, BEAT.arrive + FLASH_FALL));
  return {
    warp: warpAt(p),
    engines: p < BEAT.jump ? charge : p < BEAT.arrive ? 1 : 0,
    leap,
    lurch,
    flash,
    tremor: p < BEAT.jump ? charge : 1 - lurch,
  };
}

/** Where the ship sits along its flight line, how long it is stretched and how big it is for a frame. */
export function shipPose(frame: TransitFrame) {
  return {
    travel: frame.lurch,
    stretch: 1 + STRETCH * Math.sin(Math.PI * frame.lurch),
    scale: Math.max(MIN_SCALE, 1 - smooth(between(frame.leap, SHRINK_FROM, 1))),
  };
}

/** Camera distance at which `size` fills the given share of the view's width and height, whichever is tighter. */
export function framingDistance(
  size: { width: number; height: number },
  view: { fovY: number; aspect: number },
  fill: { width: number; height: number },
) {
  const tanHalf = Math.tan(view.fovY / 2);
  const byWidth = size.width / (2 * tanHalf * view.aspect * fill.width);
  const byHeight = size.height / (2 * tanHalf * fill.height);
  return Math.max(byWidth, byHeight);
}
