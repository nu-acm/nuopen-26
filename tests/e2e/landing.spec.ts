import { test, expect, onboard } from './fixtures';
import { EVENT } from '@/components/landing/nuopen/content/event';

// Static captures retain every source section while avoiding motion during layout measurements.
test.use({ reducedMotion: 'reduce' });

test('keeps the original NU Open landing copy and FAQ behavior', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'NU Open', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.hero-sub')).toHaveText(EVENT.subtitle);
  for (const paragraph of EVENT.crawl)
    await expect(page.locator('#crawl')).toContainText(paragraph);
  await expect(page.locator('#side')).toContainText('Every pilot picks a side');
  await expect(page.locator('#briefing')).toContainText(EVENT.contest.dateLabel);
  await expect(page.locator('#briefing')).toContainText('1–3 per team');
  await expect(page.locator('#record')).toContainText('Six battles behind us');
  await expect(page.locator('#bounty')).toContainText(`Prize pool ${EVENT.prize.text}`);
  for (const rule of EVENT.rules) await expect(page.locator('#rules')).toContainText(rule.text);
  for (const item of EVENT.faq) {
    const question = page.locator('#faq').getByRole('button', { name: item.q, exact: true });
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page
        .locator('.faq-item')
        .filter({ has: page.getByRole('button', { name: item.q, exact: true }) }),
    ).toContainText(item.a);
  }
  const firstQuestion = page
    .locator('#faq')
    .getByRole('button', { name: EVENT.faq[0].q, exact: true });
  await firstQuestion.click();
  await expect(
    page.locator('#faq').getByRole('region', { name: EVENT.faq[0].q, exact: true }),
  ).toBeVisible();
  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
  const credits = await page.request.get('/nuopen/models/CREDITS.txt');
  expect(credits.ok()).toBe(true);
  expect(await credits.text()).toContain('Anakin Skywalker');
});

test('keeps the original landing hero breakpoints and loads its reference photo', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize()!;
  for (const width of new Set([viewport.width, 320, 768, 1440])) {
    await page.setViewportSize({ ...viewport, width });
    await page.evaluate(
      () =>
        new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => done())),
        ),
    );
    const columns = await page
      .locator('.hero-strip dl')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns, `Original hero grid at ${width}px`).toBe(
      width < 640 ? 1 : width < 1024 ? 2 : 3,
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      `${width}px overflow`,
    ).toBeLessThanOrEqual(0);
  }
  await page.setViewportSize(viewport);
  const photo = page.locator('.record-photo');
  // Load the real lazy image without starting unrelated offscreen WebGL scenes.
  await photo.evaluate((image) => {
    (image as HTMLImageElement).loading = 'eager';
  });
  await expect
    .poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await page.evaluate(() => scrollTo(0, 0));
});

test('Force controls synchronize the original header, cards, palette and rules', async ({
  page,
}) => {
  await page.goto('/');
  const header = page.locator('[data-site-header]');
  const mobile = page.viewportSize()!.width < 1024;
  if (mobile) await header.getByRole('button', { name: 'Menu', exact: true }).click();
  await header.getByRole('button', { name: 'Dark side', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-side', 'dark');
  await expect(page.locator('#rules-title')).toHaveText('The Imperial code');
  await expect(page.locator('#side .side-option').first()).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--saber').trim(),
    ),
  ).toBe('#ff3131');
  if (mobile) {
    await page.keyboard.press('Escape');
    await expect(header.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  }
  await page.locator('#side .side-option').last().click();
  await expect(page.locator('#rules-title')).toHaveText('The Jedi code');
  await expect(page.locator('html')).toHaveAttribute('data-side', 'light');
});

test('saved Force and music choices restore after a fresh navigation', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('[data-site-header]');
  if (page.viewportSize()!.width < 1024)
    await header.getByRole('button', { name: 'Menu', exact: true }).click();
  await header.getByRole('button', { name: 'Dark side', exact: true }).click();
  await header.getByRole('button', { name: 'Mute the music', exact: true }).click();
  await expect(header.getByRole('button', { name: 'Play the music', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-side', 'dark');
  await expect(page.locator('#rules-title')).toHaveText('The Imperial code');
  await expect(page.locator('#side .side-option').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(header.getByRole('button', { name: 'Play the music', exact: true })).toBeVisible();
  for (const track of ['imperial-march.m4a', 'main-theme.m4a'])
    expect((await page.request.head(`/nuopen/audio/${track}`)).ok()).toBe(true);
});

test('NU Open registration calls the existing WHD OTP, profile and team backend', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await page
    .locator('.hero-copy')
    .getByRole('link', { name: 'Register your team', exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('.account-login-content')).not.toHaveAttribute('inert');
  await page.getByRole('textbox', { name: /^Email\s*\*?$/ }).fill('nuopen-landing@example.test');
  await page.getByRole('button', { name: 'Send code', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Enter the code' })).toBeVisible();
  const otp = app.codes.get('nuopen-landing@example.test');
  expect(otp).toBeTruthy();
  await page.getByRole('textbox', { name: 'Enter the code' }).fill(otp!);
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.goto('/');
  await page
    .locator('.hero-copy')
    .getByRole('link', { name: 'Complete profile', exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await onboard(page, 'NU Landing Participant');
  await page.getByRole('textbox', { name: 'Team name' }).fill('Source Landing Team');
  await page.getByRole('button', { name: 'Create a team', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Source Landing Team', exact: true }),
  ).toBeVisible();
  await page.goto('/');
  await page.locator('.hero-copy').getByRole('link', { name: 'Manage team', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(
    await app.db
      .prepare('SELECT full_name FROM participant WHERE full_name = ?')
      .bind('NU Landing Participant')
      .first('full_name'),
  ).toBe('NU Landing Participant');
});

test('original landing CTAs still obey WHD registration closure', async ({ page, app }) => {
  await app.setDeadline(new Date(Date.now() + 6000).toISOString());
  await page.goto('/');
  await expect(
    page.locator('.hero-copy').getByRole('link', { name: 'Register your team', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.hero-copy').getByRole('link', { name: 'Sign in', exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.locator('#register').getByRole('link', { name: 'Sign in', exact: true }),
  ).toHaveAttribute('href', '/login');
});
