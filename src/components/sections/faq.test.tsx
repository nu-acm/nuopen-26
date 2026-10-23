// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EVENT } from "@/content/event";

import { Faq } from "./faq";

const panelOf = (button: HTMLElement) => document.getElementById(button.getAttribute("aria-controls") ?? "");

describe("Faq", () => {
  afterEach(cleanup);

  it("should start every answer collapsed", () => {
    render(<Faq />);
    for (const item of EVENT.faq) {
      const button = screen.getByRole("button", { name: item.q });
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(panelOf(button)?.hasAttribute("inert")).toBe(true);
    }
  });

  it("should put the heading in the copy column and the accordion in the main column", () => {
    const { container } = render(<Faq />);
    expect(container.querySelector(".faq-head.split-copy")).not.toBeNull();
    expect(container.querySelector(".faq-body.split-main")).not.toBeNull();
  });

  it("should expand an answer on click and collapse it on a second click", () => {
    render(<Faq />);
    const [first] = EVENT.faq;
    const button = screen.getByRole("button", { name: first.q });

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panelOf(button)?.hasAttribute("inert")).toBe(false);

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panelOf(button)?.hasAttribute("inert")).toBe(true);
  });

  it("should keep several answers open at once", () => {
    render(<Faq />);
    const [first, second] = EVENT.faq;
    const firstButton = screen.getByRole("button", { name: first.q });
    const secondButton = screen.getByRole("button", { name: second.q });

    fireEvent.click(firstButton);
    fireEvent.click(secondButton);
    expect(firstButton.getAttribute("aria-expanded")).toBe("true");
    expect(secondButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("should label each answer region with its question", () => {
    render(<Faq />);
    const button = screen.getByRole("button", { name: EVENT.faq[0].q });
    const panel = panelOf(button);
    expect(panel?.getAttribute("role")).toBe("region");
    expect(panel?.getAttribute("aria-labelledby")).toBe(button.id);
  });

  it("should link the contact line to the mailbox", () => {
    render(<Faq />);
    expect(screen.getByRole("link", { name: EVENT.contacts.email }).getAttribute("href")).toBe(
      `mailto:${EVENT.contacts.email}`,
    );
  });
});
