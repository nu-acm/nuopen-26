import { expect, test, type Page } from "@playwright/test";

const SECTIONS = ["top", "crawl", "side", "briefing", "record", "bounty", "schedule", "rules", "allies", "faq", "register"];

const skipIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("nuopen:intro-seen", "1"));

test.describe("NU Open landing", () => {
  test("should show the title, the date and a way to register", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "NU Open" })).toBeVisible();
    await expect(page.getByText("7 November 2026").first()).toBeVisible();
    await expect(page.locator("#top").getByRole("link", { name: /register your team/i })).toHaveAttribute("href", "/register");
  });

  test("should play the intro once the visitor begins, then reveal the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/a long time ago in a galaxy far/i)).toBeVisible();
    await page.mouse.click(200, 200);
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "1", { timeout: 12_000 });
    await expect(page.locator("#top").getByRole("link", { name: /register your team/i })).toBeVisible();
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "1");
  });

  test("should render every section of the story in order", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const tops = await Promise.all(SECTIONS.map((id) => page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top + scrollY)));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test("should glide to a section from the menu and focus it", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Rules" }).click();
    await expect(page).toHaveURL(/#rules$/);
    // SwiftShader builds each 3D stage the glide passes on the main thread; at 4x CPU throttle it landed after 11.6s (23 Oct 2026).
    await expect(page.locator("#rules")).toBeInViewport({ timeout: 15_000 });
    await expect(page.locator("#rules")).toBeFocused({ timeout: 4000 });
  });

  test("should switch to the light side and remember it", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await page.locator("[data-site-header]").getByRole("button", { name: "Light side" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-side", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-side", "light");
  });

  test("should open an answer in the archives", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/#faq");
    const question = page.getByRole("button", { name: "Is it free?" });
    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Taking part in NU Open costs nothing.")).toBeVisible();
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("should never scroll sideways", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("should lay out every footer contact on one line on a desktop", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/");
  const tops = await page.locator(".site-footer .footer-links a").evaluateAll((links) => links.map((a) => Math.round(a.getBoundingClientRect().top)));
  expect(tops.length).toBe(5);
  expect(new Set(tops).size).toBe(1);
});

test.describe("on a short laptop screen", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should keep the whole sticky partners column on screen", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const side = page.locator(".allies-side");
    const { top, height } = await side.evaluate((el) => ({ top: parseFloat(getComputedStyle(el).top), height: el.getBoundingClientRect().height }));
    expect(top + height).toBeLessThanOrEqual(720);
  });
});

test("should open the 3D model credits from the footer", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/");
  await page.getByRole("link", { name: "3D model credits" }).click();
  await expect(page).toHaveURL(/\/credits$/);
  await expect(page.getByRole("heading", { level: 1, name: "3D models" })).toBeVisible();
});

test.describe("on a small phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  const lineCount = (page: Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));

  test("should keep short labels on one line", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    for (const selector of [".header-logo", ".side-option-title", ".footer-episode"]) expect(await lineCount(page, selector), selector).toBe(1);
  });

  test("should keep each year's partners on one row", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const rows = await page.locator(".allies-names").evaluateAll((lists) =>
      lists.map((list) => new Set(Array.from(list.children, (chip) => Math.round(chip.getBoundingClientRect().top))).size),
    );
    expect(rows.every((n) => n === 1)).toBe(true);
  });
});

test.describe("3D on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("should keep only a couple of 3D scenes alive while scrolling the whole page", async ({ page }) => {
    test.slow();
    await skipIntro(page);
    await page.goto("/");
    let most = 0;
    const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; y <= end; y += 422) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(150);
      most = Math.max(most, await page.locator("canvas:not([aria-hidden])").count());
    }
    expect(most).toBeLessThanOrEqual(3);
    await expect(page.locator(".trench-stage canvas")).toHaveCount(0);
  });
});
