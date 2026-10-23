import { describe, expect, it } from "vitest";

import { EVENT } from "./event";

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

describe("EVENT content", () => {
  it("should show the confirmed ₸1 200 000 prize pool", () => {
    expect(EVENT.prize.text).toBe("₸1 200 000");
  });

  it("should start the contest before it ends, five hours apart", () => {
    const start = Date.parse(EVENT.contest.start);
    const end = Date.parse(EVENT.contest.end);
    expect(Number.isNaN(start)).toBe(false);
    expect(end - start).toBe(EVENT.contest.hours * 60 * 60 * 1000);
  });

  it("should pin the contest to Astana time", () => {
    expect(EVENT.contest.start).toMatch(/\+05:00$/);
  });

  it("should list the key dates in order, ending on contest day", () => {
    const days = EVENT.timeline.map((t) => Date.parse(t.date));
    expect(days.every((d) => !Number.isNaN(d))).toBe(true);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
    expect(EVENT.timeline.at(-1)!.date.slice(0, 10)).toBe(EVENT.contest.start.slice(0, 10));
  });

  it("should list agenda slots in time order without overlaps", () => {
    const slots = EVENT.agenda.map((a) => [minutes(a.from), minutes(a.to)] as const);
    slots.forEach(([from, to]) => expect(to).toBeGreaterThan(from));
    slots.slice(1).forEach(([from], i) => expect(from).toBeGreaterThanOrEqual(slots[i][1]));
  });

  it("should give the contest slot the same hours as the contest", () => {
    const slot = EVENT.agenda.find((a) => "main" in a && a.main);
    expect(slot).toBeDefined();
    expect(minutes(slot!.to) - minutes(slot!.from)).toBe(EVENT.contest.hours * 60);
  });

  it("should give every FAQ entry a question and an answer", () => {
    expect(EVENT.faq.length).toBeGreaterThanOrEqual(6);
    for (const f of EVENT.faq) {
      expect(f.q.trim().endsWith("?")).toBe(true);
      expect(f.a.trim().length).toBeGreaterThan(10);
    }
  });

  it("should keep partner years ascending and unique", () => {
    const years = EVENT.partners.map((p) => p.year);
    expect(new Set(years).size).toBe(years.length);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });

  it("should give the crew size as a valid range", () => {
    expect(EVENT.team.min).toBeGreaterThanOrEqual(1);
    expect(EVENT.team.max).toBeGreaterThanOrEqual(EVENT.team.min);
  });

  it("should use real contact links", () => {
    expect(EVENT.contacts.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    for (const s of EVENT.contacts.social) expect(s.href).toMatch(/^https:\/\//);
  });

  it("should credit every 3D model with an author and licence", () => {
    for (const m of EVENT.credits) {
      expect(m.author.length).toBeGreaterThan(0);
      expect(m.license).toMatch(/^CC|Sketchfab/);
      expect(m.href).toMatch(/^https:\/\/sketchfab\.com\//);
    }
  });
  it("should keep the contest length, start, end and the agenda's contest row in step", () => {
    const { start, end, hours } = EVENT.contest;
    expect((Date.parse(end) - Date.parse(start)) / 3_600_000).toBe(hours);
    const row = EVENT.agenda.find((a) => "main" in a && a.main);
    expect(row).toMatchObject({ from: start.slice(11, 16), to: end.slice(11, 16) });
  });
});
