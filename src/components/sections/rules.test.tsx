// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";
import { sideStore } from "@/lib/side";

import { Rules } from "./rules";

vi.mock("@/components/three/use-stage", () => ({ useStage: () => undefined }));

describe("Rules", () => {
  afterEach(() => {
    cleanup();
    sideStore.reset();
  });

  it("should list the five rules in order, numbered 01 to 05", () => {
    render(<Rules />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(EVENT.rules.length);
    items.forEach((item, i) => {
      expect(within(item).getByText(`0${i + 1}`)).toBeTruthy();
      expect(within(item).getByRole("heading", { level: 3 }).textContent).toBe(EVENT.rules[i].title);
    });
  });

  it("should put the rules list in the copy column and the figure stage in the main column", () => {
    const { container } = render(<Rules />);
    expect(container.querySelector(".split-copy .rules-list")).not.toBeNull();
    expect(container.querySelector(".rules-stage.split-main")).not.toBeNull();
  });

  it("should mark only the last rule as the emphasised punchline", () => {
    render(<Rules />);
    const items = screen.getAllByRole("listitem");
    expect(items[items.length - 1].classList.contains("rule-punch")).toBe(true);
    expect(items.slice(0, -1).some((item) => item.classList.contains("rule-punch"))).toBe(false);
  });

  it("should head the rules as the Imperial code on the dark side", () => {
    render(<Rules />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("The Imperial code");
  });

  it("should switch to the Jedi code when the visitor turns to the light side", () => {
    render(<Rules />);
    act(() => sideStore.choose("light"));
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("The Jedi code");
    expect(screen.getByText(/rank of Master/)).toBeTruthy();
  });
});
