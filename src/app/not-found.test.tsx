// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound", () => {
  afterEach(cleanup);

  it("should tell the visitor in plain words that the page does not exist", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/aren.t the pages you.re looking for/i);
  });

  it("should send the visitor back to the landing", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /back to the landing/i }).getAttribute("href")).toBe("/");
  });
});
