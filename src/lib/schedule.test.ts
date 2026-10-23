import { describe, expect, it } from "vitest";

import { formatDay, nextIndex } from "./schedule";

const TIMELINE = [{ date: "2026-10-23" }, { date: "2026-11-03" }, { date: "2026-11-05" }, { date: "2026-11-07" }];
const at = (iso: string) => Date.parse(iso);

describe("nextIndex", () => {
  it("should point at the first date when the timeline has not started", () => {
    expect(nextIndex(TIMELINE, at("2026-10-01T12:00:00+05:00"))).toBe(0);
  });

  it("should point at the first date still ahead between two milestones", () => {
    expect(nextIndex(TIMELINE, at("2026-10-30T12:00:00+05:00"))).toBe(1);
  });

  it("should keep a date highlighted for the whole of its own day", () => {
    expect(nextIndex(TIMELINE, at("2026-11-03T10:00:00+05:00"))).toBe(1);
    expect(nextIndex(TIMELINE, at("2026-11-03T23:59:59+05:00"))).toBe(1);
  });

  it("should move on to the next date at midnight Astana time", () => {
    expect(nextIndex(TIMELINE, at("2026-11-04T00:00:00+05:00"))).toBe(2);
  });

  it("should return -1 once every date has passed", () => {
    expect(nextIndex(TIMELINE, at("2026-11-08T09:00:00+05:00"))).toBe(-1);
  });

  it("should return -1 for an empty timeline", () => {
    expect(nextIndex([], at("2026-10-01T12:00:00+05:00"))).toBe(-1);
  });
});

describe("formatDay", () => {
  it("should format a date as a short day and month", () => {
    expect(formatDay("2026-11-07")).toBe("7 Nov");
  });

  it("should format a date with the full month name when asked", () => {
    expect(formatDay("2026-11-07", "long")).toBe("7 November");
  });
});
