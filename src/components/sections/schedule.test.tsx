// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";

import { FlightPlan } from "./schedule";

describe("FlightPlan", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("should list the key dates in timeline order", () => {
    render(<FlightPlan />);
    const route = screen.getByRole("list", { name: "Key dates" });
    const labels = within(route)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(labels).toEqual(EVENT.timeline.map((item) => item.label));
  });

  it("should mark the next key date relative to now", () => {
    vi.setSystemTime(Date.parse("2026-10-30T12:00:00+05:00"));
    render(<FlightPlan />);
    act(() => void vi.advanceTimersByTime(0));
    const next = screen.getByText(EVENT.timeline[1].label).closest("li");
    expect(next?.dataset.next).toBe("true");
    expect(screen.getByText(EVENT.timeline[0].label).closest("li")?.dataset.next).toBeUndefined();
  });

  it("should mark the main contest slot in the agenda", () => {
    render(<FlightPlan />);
    const main = EVENT.agenda.find((slot) => "main" in slot && slot.main)?.title ?? "";
    expect(screen.getByText(main).closest("li")?.dataset.main).toBe("true");
  });

  it("should keep the route title phrase together so it never breaks before 'to'", () => {
    render(<FlightPlan />);
    const title = screen.getByRole("heading", { level: 2 });
    expect(title.querySelector("span")?.textContent).toBe("The route to");
  });

  it("should say that all times are Astana time", () => {
    render(<FlightPlan />);
    expect(screen.getByText(/Astana time \(UTC\+5\)/)).toBeTruthy();
  });
});
