import { describe, expect, it } from "vitest";

import { pad2, timeLeft } from "./countdown";

const START = Date.parse("2026-11-07T11:00:00+05:00");
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("timeLeft", () => {
  it("should split the remaining time into days, hours, minutes and seconds", () => {
    const now = START - (3 * DAY + 4 * HOUR + 5 * MINUTE + 6 * SECOND);
    expect(timeLeft(now, START)).toEqual({ days: 3, hours: 4, minutes: 5, seconds: 6, done: false });
  });

  it("should round partial seconds down", () => {
    expect(timeLeft(START - 1500, START)).toMatchObject({ seconds: 1, done: false });
  });

  it("should be done at the exact start", () => {
    expect(timeLeft(START, START)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });

  it("should stay at zero after the start instead of going negative", () => {
    expect(timeLeft(START + DAY, START)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });

  it("should count whole days beyond a month", () => {
    expect(timeLeft(START - 45 * DAY, START).days).toBe(45);
  });
});

describe("pad2", () => {
  it("should pad single digits with a zero", () => {
    expect(pad2(7)).toBe("07");
  });

  it("should leave two or more digits alone", () => {
    expect(pad2(45)).toBe("45");
    expect(pad2(120)).toBe("120");
  });
});
