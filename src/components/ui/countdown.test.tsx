// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Countdown } from "./countdown";

const START = "2026-11-07T11:00:00+05:00";
const END = "2026-11-07T16:00:00+05:00";

describe("Countdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("should show days, hours, minutes and seconds left", () => {
    vi.setSystemTime(Date.parse(START) - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
    render(<Countdown target={START} end={END} />);
    act(() => void vi.advanceTimersByTime(0));
    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("02");
    expect(timer.textContent).toContain("03");
    expect(timer.textContent).toContain("04");
    expect(timer.textContent).toContain("05");
  });

  it("should tick every second", () => {
    vi.setSystemTime(Date.parse(START) - 10_000);
    render(<Countdown target={START} end={END} />);
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByTestId("countdown-seconds").textContent).toBe("07");
  });

  it("should announce the start once the contest is live", () => {
    vi.setSystemTime(Date.parse(START) + 1000);
    render(<Countdown target={START} end={END} />);
    act(() => void vi.advanceTimersByTime(0));
    expect(screen.getByText(/the contest is live/i)).toBeTruthy();
  });

  it("should say the contest is over once it ends", () => {
    vi.setSystemTime(Date.parse(END) + 1000);
    render(<Countdown target={START} end={END} />);
    act(() => void vi.advanceTimersByTime(0));
    expect(screen.getByText(/the contest has ended/i)).toBeTruthy();
    expect(screen.queryByText(/is live/i)).toBeNull();
  });

  it("should render placeholders on the server instead of a stale time", () => {
    vi.setSystemTime(Date.parse(START) - 10_000);
    expect(renderToString(<Countdown target={START} end={END} />)).toContain("--");
  });
});
