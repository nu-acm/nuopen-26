// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";
import { sideStore } from "@/lib/side";

import { Header, NAV } from "./header";

describe("Header", () => {
  beforeEach(() => {
    sideStore.reset();
    document.documentElement.dataset.side = "dark";
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should link every nav item to a section on the page", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    for (const item of NAV) expect(within(nav).getByRole("link", { name: item.label })).toHaveProperty("hash", `#${item.id}`);
  });

  it("should send Register to the registration page", () => {
    render(<Header />);
    expect(screen.getAllByRole("link", { name: /register/i })[0].getAttribute("href")).toBe(EVENT.registerHref);
  });

  it("should switch to the light side and back", () => {
    render(<Header />);
    fireEvent.click(screen.getAllByRole("button", { name: "Light side" })[0]);
    expect(document.documentElement.dataset.side).toBe("light");
    fireEvent.click(screen.getAllByRole("button", { name: "Dark side" })[0]);
    expect(document.documentElement.dataset.side).toBe("dark");
  });

  it("should offer the side switch inside the phone menu", () => {
    render(<Header />);
    const menu = document.getElementById("mobile-menu");
    expect(menu).not.toBeNull();
    expect(within(menu as HTMLElement).getByRole("button", { name: "Light side", hidden: true })).toBeTruthy();
  });

  it("should give the menu button a 44 pixel hit area", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: "Menu" }).className).toContain("h-11 w-11");
  });

  it("should give the sound button a 44 pixel hit area", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<Header />);
    expect((await screen.findByRole("button", { name: /music/i })).className).toContain("h-11 w-11");
  });

  it("should turn the music off and on", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<Header />);
    fireEvent.click(await screen.findByRole("button", { name: /mute the music/i }));
    expect(sideStore.get().music).toBe(false);
    expect(screen.getByRole("button", { name: /play the music/i })).toBeTruthy();
  });

  it("should hide the music button when the soundtrack file is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<Header />);
    await act(async () => {});
    expect(screen.queryByRole("button", { name: /music/i })).toBeNull();
  });

  it("should mark the section on screen as the current one in the nav", () => {
    const watchers: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
          watchers.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    const rules = Object.assign(document.createElement("section"), { id: "rules" });
    document.body.append(rules);
    render(<Header />);
    act(() => watchers.forEach((cb) => cb([{ target: rules, isIntersecting: true }])));
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(within(nav).getByRole("link", { name: "Rules" }).getAttribute("aria-current")).toBe("location");
    expect(within(nav).getByRole("link", { name: "FAQ" }).getAttribute("aria-current")).toBeNull();
    rules.remove();
  });

  it("should open and close the phone menu", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /menu/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("should keep the closed menu in the layout so it can slide open, but out of reach of keyboard and screen readers", () => {
    render(<Header />);
    const menu = document.getElementById("mobile-menu") as HTMLElement;
    expect(menu.hasAttribute("hidden")).toBe(false);
    expect(menu.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /menu/i }));
    expect(menu.hasAttribute("inert")).toBe(false);
    expect(menu.dataset.open).toBe("true");
  });
});
