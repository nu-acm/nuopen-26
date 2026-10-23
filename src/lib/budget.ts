export const BUDGET = { slowMs: 1000 / 45, patience: 45, step: 0.25, floor: 1 } as const;

export type Budget = { ratio: number; slow: number };

/** Steps the pixel ratio down after a long run of slow frames; never back up, so the canvas does not flip between sizes. */
export function frameBudget(state: Budget, frameMs: number): Budget {
  if (frameMs <= BUDGET.slowMs) return { ...state, slow: 0 };
  const slow = state.slow + 1;
  if (slow < BUDGET.patience) return { ...state, slow };
  return { ratio: Math.max(BUDGET.floor, state.ratio - BUDGET.step), slow: 0 };
}
