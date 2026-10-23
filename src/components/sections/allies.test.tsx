// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EVENT } from "@/content/event";

import { Allies } from "./allies";

const COMPANIES = [...new Set(EVENT.partners.flatMap((p) => [...p.names]))];

describe("Allies", () => {
  afterEach(cleanup);

  it("should render every partner year in order", () => {
    const { container } = render(<Allies />);
    const years = Array.from(container.querySelectorAll("time"), (t) => t.textContent);
    expect(years).toEqual(EVENT.partners.map((p) => String(p.year)));
  });

  it("should list the partners under each year", () => {
    render(<Allies />);
    for (const partner of EVENT.partners) {
      const list = screen.getByRole("list", { name: `Partners in ${partner.year}` });
      const names = within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent);
      expect(names).toEqual([...partner.names]);
    }
  });

  it("should show each company once on the wall, in the order it first appeared", () => {
    render(<Allies />);
    const wall = screen.getByRole("list", { name: "All partners" });
    expect(within(wall).getAllByRole("listitem").map((item) => item.textContent)).toEqual(COMPANIES);
  });

  it("should count the companies and say since when", () => {
    render(<Allies />);
    expect(screen.getByText(`${COMPANIES.length} companies since ${EVENT.partners[0].year}`)).toBeTruthy();
  });

  it("should send the partnership pitch to the contact mailbox with the subject", () => {
    render(<Allies />);
    const link = screen.getByRole("link", { name: /write to acm@nu/i });
    expect(link.getAttribute("href")).toBe(
      `mailto:${EVENT.contacts.email}?subject=${encodeURIComponent("NU Open 2026 partnership")}`,
    );
  });

  it("should put the timeline in the copy column and the wall with the pitch in the main column", () => {
    const { container } = render(<Allies />);
    expect(container.querySelector(".split-copy .allies-timeline")).not.toBeNull();
    expect(container.querySelector(".allies-side.split-main .allies-wall")).not.toBeNull();
    expect(container.querySelector(".allies-side.split-main .allies-pitch")).not.toBeNull();
  });

  it("should show every partner pitch point", () => {
    render(<Allies />);
    for (const point of EVENT.partnerPitch) expect(screen.getByText(point)).toBeTruthy();
  });
});
