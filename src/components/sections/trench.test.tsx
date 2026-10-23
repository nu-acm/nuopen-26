// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EVENT } from "@/content/event";

import { Trench } from "./trench";

vi.mock("@/components/three/use-stage", () => ({ useStage: () => undefined }));

describe("Trench", () => {
  afterEach(cleanup);

  it("should link Register to the registration page", () => {
    render(<Trench />);
    expect(screen.getByRole("link", { name: /register your team/i }).getAttribute("href")).toBe(EVENT.registerHref);
  });

  it("should set the final call title at the xl size", () => {
    render(<Trench />);
    expect(screen.getByRole("heading", { level: 2 }).classList.contains("h2-xl")).toBe(true);
  });

  it("should hide the decorative trench floor from assistive tech", () => {
    render(<Trench />);
    expect(document.querySelector(".trench-floor")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should hide the TIE fighter stage from assistive tech", () => {
    render(<Trench />);
    expect(document.querySelector(".trench-stage")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should offer a mailto link to the organisers", () => {
    render(<Trench />);
    expect(screen.getByRole("link", { name: /ask us anything/i }).getAttribute("href")).toBe(`mailto:${EVENT.contacts.email}`);
  });
});
