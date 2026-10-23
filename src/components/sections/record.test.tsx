// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviousEpisodes } from "./record";

const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

describe("PreviousEpisodes", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("should server-render the final stat numbers for crawlers and no-JS readers", () => {
    const html = renderToString(<PreviousEpisodes />);
    for (const value of ["2,100", "800", "10", "6"]) expect(html).toContain(`>${value}<`);
  });

  it("should describe the photo with alt text", () => {
    render(<PreviousEpisodes />);
    expect(screen.getByRole("img", { name: /NU Open 2024/ })).toBeTruthy();
  });

  it("should show the final numbers straight away when reduced motion is on", () => {
    reducedMotion(true);
    render(<PreviousEpisodes />);
    expect(screen.getByText("2,100")).toBeTruthy();
    expect(screen.getByText("800")).toBeTruthy();
  });

  it("should lay the copy and the stats out on the shared split grid", () => {
    render(<PreviousEpisodes />);
    expect(document.querySelector(".split > .split-copy")).toBeTruthy();
    expect(document.querySelector(".split > .split-main.record-stats")).toBeTruthy();
  });

  it("should start the participant count at zero when motion is allowed", () => {
    reducedMotion(false);
    render(<PreviousEpisodes />);
    expect(document.querySelector<HTMLElement>('[data-value="2100"]')?.textContent).toBe("0");
  });
});
