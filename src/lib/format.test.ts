import { describe, expect, it } from "vitest";

import { formatCount, formatMoney } from "./format";

describe("formatCount", () => {
  it("should group thousands with a comma", () => {
    expect(formatCount(2100)).toBe("2,100");
  });

  it("should leave small numbers as they are", () => {
    expect(formatCount(10)).toBe("10");
  });

  it("should round a fractional value from a count-up animation", () => {
    expect(formatCount(799.6)).toBe("800");
  });
});

describe("formatMoney", () => {
  it("should put the currency sign first and group with thin spaces", () => {
    expect(formatMoney(1_000_000, "₸")).toBe("₸1 000 000");
  });

  it("should not group numbers under a thousand", () => {
    expect(formatMoney(500, "₸")).toBe("₸500");
  });
});
