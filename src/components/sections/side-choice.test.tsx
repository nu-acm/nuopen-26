// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sideStore } from "@/lib/side";

import { SideChoice } from "./side-choice";

vi.mock("@/components/three/use-stage", () => ({ useStage: () => undefined }));

const pressed = (name: RegExp) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("SideChoice", () => {
  beforeEach(() => {
    sideStore.reset();
    document.documentElement.dataset.side = "dark";
  });
  afterEach(cleanup);

  it("should title the section with a level two heading", () => {
    render(<SideChoice />);
    expect(screen.getByRole("heading", { level: 2, name: "Every pilot picks a side" })).toBeTruthy();
  });

  it("should set the title in the largest heading size reserved for the choice", () => {
    render(<SideChoice />);
    expect(screen.getByRole("heading", { level: 2 }).className).toContain("h2-xl");
  });

  it("should preview the red blade on the dark side card before it is chosen", () => {
    render(<SideChoice />);
    expect(screen.getByRole("button", { name: /dark side/i }).style.getPropertyValue("--blade")).toBe("var(--blade-dark)");
  });

  it("should keep each card's own blade colour whichever side is chosen", () => {
    render(<SideChoice />);
    fireEvent.click(screen.getByRole("button", { name: /light side/i }));
    expect(screen.getByRole("button", { name: /light side/i }).style.getPropertyValue("--blade")).toBe("var(--blade-light)");
    expect(screen.getByRole("button", { name: /dark side/i }).style.getPropertyValue("--blade")).toBe("var(--blade-dark)");
  });

  it("should render a dark side and a light side button", () => {
    render(<SideChoice />);
    expect(screen.getByRole("button", { name: /dark side/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /light side/i })).toBeTruthy();
  });

  it("should press the dark side by default", () => {
    render(<SideChoice />);
    expect(pressed(/dark side/i)).toBe("true");
    expect(pressed(/light side/i)).toBe("false");
  });

  it("should tint the page and press the light side when it is chosen", () => {
    render(<SideChoice />);
    fireEvent.click(screen.getByRole("button", { name: /light side/i }));
    expect(document.documentElement.dataset.side).toBe("light");
    expect(pressed(/light side/i)).toBe("true");
    expect(pressed(/dark side/i)).toBe("false");
  });

  it("should return to the dark side when it is chosen again", () => {
    render(<SideChoice />);
    fireEvent.click(screen.getByRole("button", { name: /light side/i }));
    fireEvent.click(screen.getByRole("button", { name: /dark side/i }));
    expect(document.documentElement.dataset.side).toBe("dark");
    expect(pressed(/dark side/i)).toBe("true");
  });

  it("should place the saber between the dark and light cards", () => {
    render(<SideChoice />);
    const dark = screen.getByRole("button", { name: /dark side/i });
    const band = document.querySelector(".side-band");
    expect(dark.nextElementSibling).toBe(band);
    expect(band?.nextElementSibling).toBe(screen.getByRole("button", { name: /light side/i }));
  });

  it("should state each side's blade and soundtrack as plain facts", () => {
    render(<SideChoice />);
    for (const fact of ["Red", "The Imperial March", "Blue", "The Main Theme"]) {
      expect(screen.getByText(fact)).toBeTruthy();
    }
  });
});
