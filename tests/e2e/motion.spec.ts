import { test, expect } from './fixtures';

test('lightsaber trail fades, follows the Force palette and respects motion and touch', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/login');
  await expect(page.locator('.account-login-content')).not.toHaveAttribute('inert');
  const trail = page.locator('.nu-saber-trail');
  const strokes = trail.locator('path[d]');
  const swipe = async () => {
    await page.mouse.move(200, 300);
    await page.mouse.move(450, 350, { steps: 8 });
  };
  await expect(trail).toHaveAttribute('aria-hidden', 'true');
  await expect(trail).toHaveCSS('pointer-events', 'none');
  if (info.project.name === 'mobile') {
    await swipe();
    await expect(trail).toBeHidden();
    await expect(strokes).toHaveCount(0);
    return;
  }
  await expect(trail).toBeVisible();
  await swipe();
  await expect(strokes.first()).toBeAttached();
  await expect(strokes).toHaveCount(0);
  const lightFilter = await trail.evaluate((element) => getComputedStyle(element).filter);
  await page.getByRole('button', { name: 'Dark side', exact: true }).click();
  await expect(trail).not.toHaveCSS('filter', lightFilter);
  await swipe();
  await expect(strokes.first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(trail).toBeHidden();
  await expect(strokes).toHaveCount(0);
  await swipe();
  await expect(strokes).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await swipe();
  await expect(strokes.first()).toBeAttached();
  await page.mouse.move(-1, -1);
  await expect(strokes).toHaveCount(0);
});

test('changing reduced-motion preference stops and resumes the account sky and radar', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const frames = { sky: 0 };
    (window as unknown as { visualFrames: typeof frames }).visualFrames = frames;
    const clear = Reflect.get(
      CanvasRenderingContext2D.prototype,
      'clearRect',
    ) as CanvasRenderingContext2D['clearRect'];
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.classList.contains('site-starfield')) frames.sky++;
      return clear.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/login');
  await expect(page.locator('.account-login-content')).not.toHaveAttribute('inert');
  const count = () =>
    page.evaluate(() => (window as unknown as { visualFrames: { sky: number } }).visualFrames.sky);
  await expect.poll(count).toBeGreaterThan(3);
  await expect(page.locator('.mission-radar')).toHaveCSS('animation-name', 'account-radar-orbit');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.mission-radar')).toHaveCSS('animation-name', 'none');
  await page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );
  const before = await count();
  await page.waitForTimeout(300);
  const after = await count();
  expect(after, 'Reduced motion freezes the painted sky').toBe(before);
  await info.attach('live-motion', {
    body: JSON.stringify({ before, after }),
    contentType: 'application/json',
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(count).toBeGreaterThan(after);
  await expect(page.locator('.mission-radar')).toHaveCSS('animation-name', 'account-radar-orbit');
});
