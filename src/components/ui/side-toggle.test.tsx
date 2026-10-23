// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SIDE_KEY, sideStore } from "@/lib/side";

import { SideToggle } from "./side-toggle";

describe("SideToggle", () => {
  beforeEach(() => {
    sideStore.reset();
    localStorage.clear();
    document.documentElement.dataset.side = "dark";
  });
  afterEach(cleanup);

  it("should group the two side segments under a side label", () => {
    render(<SideToggle />);
    const group = screen.getByRole("group", { name: "Side" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["Dark", "Light"]);
  });

  it("should press the dark segment by default", () => {
    render(<SideToggle />);
    expect(screen.getByRole("button", { name: "Dark side" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Light side" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("should choose the side it is clicked on and remember it for the next visit", () => {
    render(<SideToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Light side" }));
    expect(sideStore.get().side).toBe("light");
    expect(document.documentElement.dataset.side).toBe("light");
    expect(localStorage.getItem(SIDE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Light side" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("should give the control a 44 pixel tall hit area", () => {
    render(<SideToggle />);
    expect(screen.getByRole("group", { name: "Side" }).className).toContain("h-11");
  });
});
