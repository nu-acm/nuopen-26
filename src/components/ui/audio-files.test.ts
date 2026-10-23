import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { TRACKS } from "./soundtrack";

describe("score files", () => {
  it.each(Object.values(TRACKS))("should keep %s's index ahead of its audio so it starts playing while it downloads", (url) => {
    const file = readFileSync(join(process.cwd(), "public", url));
    expect(file.indexOf("moov")).toBeGreaterThan(-1);
    expect(file.indexOf("moov")).toBeLessThan(file.indexOf("mdat"));
  });
});
