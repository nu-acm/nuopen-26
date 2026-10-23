import { clamp01 } from "./starfield";

let level = 0;

/** Shared hyperdrive: the scrolling transit sets a warp level and the starfield samples it every frame. */
export const warpDrive = {
  setLevel(v: number) {
    level = clamp01(v);
  },
  current: () => level,
};
