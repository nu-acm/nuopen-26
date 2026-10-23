// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EVENT } from "@/content/event";

import { Footer } from "./footer";

describe("Footer", () => {
  afterEach(cleanup);

  it("should link once to the credits page instead of listing every model", () => {
    const { container } = render(<Footer />);
    expect(screen.getByRole("link", { name: "3D model credits" }).getAttribute("href")).toBe("/credits");
    expect(container.querySelector('a[href*="sketchfab.com"]')).toBeNull();
  });

  it("should render the email, phone and social contact links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: EVENT.contacts.email }).getAttribute("href")).toBe(
      `mailto:${EVENT.contacts.email}`,
    );
    expect(screen.getByRole("link", { name: EVENT.contacts.phone }).getAttribute("href")).toBe(EVENT.contacts.phoneHref);
    for (const social of EVENT.contacts.social) {
      const link = screen.getByRole("link", { name: social.label });
      expect(link.getAttribute("href")).toBe(social.href);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("should print the copyright without a Lucasfilm disclaimer", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 ACM@NU Student Chapter, Nazarbayev University/)).toBeTruthy();
    expect(screen.queryByText(/Lucasfilm/)).toBeNull();
  });
});
