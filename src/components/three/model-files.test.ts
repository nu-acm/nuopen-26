import { statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Phones download these on the way down the page; textures beyond what the scene shows on screen are wasted bytes.
const BUDGET_KB: Record<string, number> = {
  "anakin.glb": 1700,
  "deathstar.glb": 700,
  "destroyer.glb": 1300,
  "saber.glb": 250,
  "tie.glb": 250,
  "vader.glb": 650,
};

describe("model files", () => {
  it.each(Object.entries(BUDGET_KB))("should keep %s within %i KB", (file, budget) => {
    const kb = statSync(join(process.cwd(), "public/models", file)).size / 1024;
    expect(kb).toBeLessThanOrEqual(budget);
  });
});
