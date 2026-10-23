// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";

import { Briefing } from "./briefing";

vi.mock("../three/use-stage", () => ({ useStage: () => undefined }));

describe("Briefing", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should show the date, time, venue, team size, format and free entry", () => {
    render(<Briefing />);
    expect(screen.getByText(EVENT.contest.dateLabel)).toBeTruthy();
    expect(screen.getByText("11:00–16:00")).toBeTruthy();
    expect(screen.getByText(EVENT.venue.name)).toBeTruthy();
    expect(screen.getByText(`${EVENT.team.min}–${EVENT.team.max} per team`)).toBeTruthy();
    expect(screen.getByText(`${EVENT.contest.format} on ${EVENT.contest.platform}`)).toBeTruthy();
    expect(screen.getByText("Free")).toBeTruthy();
  });

  it("should put the Death Star stage in the copy column and the readout in the main column", () => {
    const { container } = render(<Briefing />);
    expect(container.querySelector(".briefing-target.split-copy .briefing-stage")).not.toBeNull();
    expect(container.querySelector(".briefing-readout.split-main")).not.toBeNull();
  });

  it("should hide the targeting reticle from assistive tech", () => {
    const { container } = render(<Briefing />);
    expect(container.querySelector(".briefing-reticle")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should keep the target acquired caption under the stage", () => {
    render(<Briefing />);
    expect(screen.getByText("Target acquired")).toBeTruthy();
  });

  it("should open the venue map in a new tab without leaking the opener", () => {
    render(<Briefing />);
    const link = screen.getByRole("link", { name: /open in maps/i });
    expect(link.getAttribute("href")).toBe(EVENT.venue.mapHref);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("should keep every row visible when reduced motion is requested", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: true, media: query }) as MediaQueryList,
    );
    render(<Briefing />);
    for (const row of document.querySelectorAll<HTMLElement>(".briefing-row")) {
      expect(row.style.opacity).toBe("");
    }
  });
});
