import { test, expect } from './fixtures';

test('serves English pages and metadata even with a previous language preference', async ({
  page,
  context,
  app,
}) => {
  await context.addCookies([{ name: 'locale', value: 'ru', url: app.url }]);
  await context.setExtraHTTPHeaders({ 'Accept-Language': 'kk-KZ,ru;q=0.9' });

  for (const path of ['/', '/login', '/faq', '/privacy', '/terms']) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    const head = await page.evaluate(
      (html) => {
        const document = new DOMParser().parseFromString(html, 'text/html');
        return {
          lang: document.documentElement.lang,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
          titles: document.querySelectorAll('title').length,
          descriptions: document.querySelectorAll('meta[name="description"]').length,
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          meta: Object.fromEntries(
            Array.from(document.querySelectorAll('meta[property], meta[name]')).map((meta) => [
              meta.getAttribute('property') ?? meta.getAttribute('name'),
              meta.getAttribute('content'),
            ]),
          ),
        };
      },
      await response!.text(),
    );

    const canonical = new URL(path, 'https://nuopen.nuacm.kz').href;
    expect(head.lang).toBe('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('button', { name: /switch language/i, includeHidden: true }),
    ).toHaveCount(0);
    expect(head.titles).toBe(1);
    expect(head.descriptions).toBe(1);
    expect(head.title).not.toMatch(/[\u2013\u2014]/);
    expect(head.description).toBeTruthy();
    expect(head.description).not.toMatch(/[\u2013\u2014]/);
    expect(head.canonical).toBe(canonical);
    expect(head.meta['og:url']).toBe(canonical);
    expect(head.meta['og:title']).toBe(head.title);
    expect(head.meta['twitter:title']).toBe(head.title);
    expect(head.meta['og:description']).toBe(head.description);
    expect(head.meta['twitter:description']).toBe(head.description);
    expect(head.meta['og:locale']).toBe('en_US');
    expect(head.meta['og:image']).toBe('https://nuopen.nuacm.kz/social-preview.png');
    expect(head.meta['twitter:image']).toBe(head.meta['og:image']);

    if (path === '/') {
      expect(head.title).toBe('NU Open 2026 · Episode VII: The Code Awakens');
      expect(head.description).toContain('ICPC-style programming contest');
      const image = await page.request.get('/social-preview.png');
      expect(image.ok()).toBe(true);
      expect(image.headers()['content-type']).toContain('image/png');
      const png = await image.body();
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    }
    if (path === '/login') {
      expect(head.title).toBe('NU Open 2026');
      await expect(page.getByRole('button', { name: 'Send code', exact: true })).toBeVisible();
    }
    if (path === '/faq') {
      expect(head.title).toBe('All questions about NU Open | NU Open 2026');
      expect(head.description).toContain('eligibility, team size, registration');
    }
  }

  await page.goto('/login');
  await page.locator('.account-footer').getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page).toHaveURL(`${app.url}/faq`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://nuopen.nuacm.kz/faq',
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'All questions about NU Open | NU Open 2026',
  );
  expect((await context.cookies()).find((cookie) => cookie.name === 'locale')?.value).toBe('ru');
});
