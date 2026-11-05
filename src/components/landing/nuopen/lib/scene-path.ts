/** Frame-rate independent ease toward a target: the same result for one long frame or many short ones. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
