import { test, expect } from './fixtures';
import { EVENT } from '@/components/landing/nuopen/content/event';
import en from '@/i18n/landing/en.json' with { type: 'json' };
import ru from '@/i18n/landing/ru.json' with { type: 'json' };
import kk from '@/i18n/landing/kk.json' with { type: 'json' };
import accountEn from '@/i18n/locales/en.json' with { type: 'json' };
import accountRu from '@/i18n/locales/ru.json' with { type: 'json' };
import accountKk from '@/i18n/locales/kk.json' with { type: 'json' };

test.use({ reducedMotion: 'reduce' });
const copies: Record<string, Record<string, string>> = { en, ru, kk };

for (const locale of ['en', 'ru', 'kk'] as const) {
  test(`landing language ${locale} updates every section, keeps names and persists into account pages`, async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.locator('[data-site-header]');
    await page.evaluate(() => document.fonts.ready);
    {
      const preferences = header.locator('.landing-header-language');
      const label = { en: 'EN', ru: 'РУС', kk: 'ҚАЗ' }[locale];
      await preferences.getByRole('button', { name: new RegExp(`/ ${label}$`) }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('.nuopen-page')).toHaveAttribute('lang', locale);
      await expect(preferences.locator('[data-pressed]')).toHaveText(label!);
      const text = (source: string) => copies[locale][source] ?? source;
      await expect(page.locator('.hero-sub')).toHaveText(text(EVENT.subtitle));
      const body = await page.locator('main').textContent();
      const messages = [
        EVENT.tagline,
        'Astana time (UTC+5)',
        EVENT.contest.dateLabel,
        EVENT.contest.weekday,
        ...EVENT.crawl,
        ...EVENT.stats.map((s) => s.label),
        ...EVENT.timeline.flatMap((s) => [s.label, s.note]),
        ...EVENT.agenda.flatMap((s) => (s.venue ? [s.title, s.venue] : [s.title])),
        ...EVENT.rules.flatMap((s) => [s.title, s.text]),
        ...EVENT.faq.flatMap((s) => [s.q, s.a]),
        ...EVENT.partnerPitch,
        EVENT.prize.extra,
        'Every pilot picks a side',
        'The target.',
        'Six battles behind us',
        'The route to',
        'The Jedi code',
        'Allies across the galaxy',
        'The answers you seek',
        'Stay on target',
      ];
      for (const message of messages)
        expect(body, `${locale}: ${message}`).toContain(text(message));
      for (const name of ['NU Open', 'ChatGPT', 'Codeforces', 'EPAM', 'inDrive', 'ACM@NU'])
        expect(body).toContain(name);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        { en: 'en_US', ru: 'ru_RU', kk: 'kk_KZ' }[locale]!,
      );
      await expect(page.locator('.hero-copy a.btn')).toHaveAttribute('href', '/login');
    }
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    expect((await page.context().cookies()).find((c) => c.name === 'locale')?.value).toBe(locale);
    await page.goto('/login');
    await expect(
      page.getByRole('heading', {
        name: { en: accountEn, ru: accountRu, kk: accountKk }[locale].login.title,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: { en: accountEn, ru: accountRu, kk: accountKk }[locale].account.backToLanding,
        exact: true,
      }),
    ).toHaveAttribute('href', '/');
  });
}
