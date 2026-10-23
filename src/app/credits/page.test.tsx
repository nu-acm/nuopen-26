// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EVENT } from "@/content/event";

import Credits from "./page";

describe("Credits", () => {
  afterEach(cleanup);

  it("should credit every model with its title, author, licence and a link to its source", () => {
    const { container } = render(<Credits />);
    for (const credit of EVENT.credits) {
      const link = screen.getByRole("link", { name: credit.model });
      expect(link.getAttribute("href")).toBe(credit.href);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      const row = link.closest("li")!;
      expect(row.textContent).toContain(credit.author);
      expect(row.textContent).toContain(credit.license);
    }
    expect(container.querySelectorAll(".credits-licence")).toHaveLength(EVENT.credits.length);
  });

  it("should say the models were changed, as their CC licences require", () => {
    render(<Credits />);
    expect(screen.getByText(/compressed and re-oriented for the web/i)).toBeTruthy();
  });

  it("should send the visitor back to the landing", () => {
    render(<Credits />);
    expect(screen.getByRole("link", { name: /back to the landing/i }).getAttribute("href")).toBe("/");
  });
});
