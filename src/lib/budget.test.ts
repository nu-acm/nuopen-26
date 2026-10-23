import { describe, expect, it } from "vitest";

import { BUDGET, frameBudget, type Budget } from "./budget";

const run = (start: Budget, frames: number, ms: number) =>
  Array.from({ length: frames }).reduce<Budget>((state) => frameBudget(state, ms), start);

describe("frameBudget", () => {
  const sharp: Budget = { ratio: 1.75, slow: 0 };

  it("should keep the pixel ratio while frames are fast", () => {
    expect(run(sharp, 500, 16).ratio).toBe(1.75);
  });

  it("should ignore a short burst of slow frames, like a model loading", () => {
    expect(run(sharp, BUDGET.patience - 1, 40).ratio).toBe(1.75);
  });

  it("should step the pixel ratio down after a long run of slow frames", () => {
    expect(run(sharp, BUDGET.patience, 40).ratio).toBe(1.75 - BUDGET.step);
  });

  it("should restart its count when a fast frame breaks the run", () => {
    const almost = run(sharp, BUDGET.patience - 1, 40);
    expect(run(frameBudget(almost, 16), BUDGET.patience - 1, 40).ratio).toBe(1.75);
  });

  it("should never go below the floor", () => {
    expect(run(sharp, BUDGET.patience * 20, 40).ratio).toBe(BUDGET.floor);
  });

  it("should not change the state it was given", () => {
    const state = { ratio: 1.75, slow: BUDGET.patience - 1 };
    frameBudget(state, 40);
    expect(state).toEqual({ ratio: 1.75, slow: BUDGET.patience - 1 });
  });
});
