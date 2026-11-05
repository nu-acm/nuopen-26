// Luke's prop from the films: a hilt of about 28 cm and a blade of about 91 cm.
export const SABER_SIZE = { hilt: 1.6, blade: 5.2 } as const;

export const SABER_TIMING = { retract: 0.25, ignite: 0.35 } as const;
export const SWAP_DURATION = SABER_TIMING.retract + SABER_TIMING.ignite;

/** Back-ease overshoot: about 6%, so the ignition kicks past full length and settles. */
const OVERSHOOT = 1.3;

const easeInQuad = (p: number) => p * p;
const easeOutBack = (p: number) => {
  const u = p - 1;
  return 1 + (OVERSHOOT + 1) * u ** 3 + OVERSHOOT * u ** 2;
};

/** Blade length (1 = full) `elapsed` seconds into a swap that starts from `from`. */
export function bladeLength(elapsed: number, from = 1): number {
  if (elapsed <= 0) return from;
  if (elapsed < SABER_TIMING.retract)
    return from * (1 - easeInQuad(elapsed / SABER_TIMING.retract));
  const p = (elapsed - SABER_TIMING.retract) / SABER_TIMING.ignite;
  return p >= 1 ? 1 : easeOutBack(p);
}

export type Swap = { readonly start: number; readonly from: number };

export function beginSwap(current: Swap | null, t: number): Swap {
  return { start: t, from: current ? bladeLength(t - current.start, current.from) : 1 };
}

export function swapLength(swap: Swap | null, t: number): number {
  return swap ? bladeLength(t - swap.start, swap.from) : 1;
}

export const colourDue = (swap: Swap, t: number) => t - swap.start >= SABER_TIMING.retract;
export const swapDone = (swap: Swap, t: number) => t - swap.start >= SWAP_DURATION;

/**
 * Visible frame height (world units) that fits a `width` x `height` box into a frame of
 * `aspect` (width / height), using only `fill` of the frame on its tighter axis.
 */
export function fitHeight(width: number, height: number, aspect: number, fill: number): number {
  return Math.max(height / fill, width / (fill * aspect));
}
