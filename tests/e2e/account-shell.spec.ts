import landingEn from '@/i18n/landing/en.json' with { type: 'json' };
import landingRu from '@/i18n/landing/ru.json' with { type: 'json' };
import landingKk from '@/i18n/landing/kk.json' with { type: 'json' };
import en from '@/i18n/locales/en.json' with { type: 'json' };
import ru from '@/i18n/locales/ru.json' with { type: 'json' };
import kk from '@/i18n/locales/kk.json' with { type: 'json' };
import { test, expect, login, onboard } from './fixtures';

test.use({ reducedMotion: 'reduce' });

test('team and personal-data tabs keep actions separate and preserve profile edits', async ({
  page,
  app,
}) => {
  await login(page, app.codes, 'account-tabs@example.test');
  await onboard(page, 'Pilot Example');
  await page.evaluate(() => document.fonts.ready);
  const accountControls = await page.locator('.auth-header').evaluate((header) => {
    const language = header.querySelector('.whd-language-group')!.getBoundingClientRect();
    const action = header.querySelector('.account-back')!.getBoundingClientRect();
    return {
      languageX: language.x,
      languageY: language.y,
      actionX: action.x,
      actionY: action.y,
      width: action.width,
      height: action.height,
    };
  });
  expect(accountControls.languageX).toBeLessThan(accountControls.actionX);
  await expect(page.locator('.account-back')).toHaveCSS('background-color', 'rgb(247, 245, 239)');

  const nav = page.getByRole('navigation', { name: 'Your account', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(2);
  await expect(nav.getByRole('link', { name: '01 My team' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(
    page.locator('.auth-header').getByRole('link', { name: 'NU Open home' }),
  ).toBeVisible();
  await expect(page.locator('.account-page')).not.toContainText(/WHD|Women.s Hack Day/);
  await nav.getByRole('link', { name: '02 Personal data' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(nav.getByRole('link', { name: '02 Personal data' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).toHaveValue(
    'account-tabs@example.test',
  );
  await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).toHaveAttribute(
    'readonly',
  );
  await expect(page.locator('input[type="file"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await expect(
    page.locator('.auth-header').getByRole('button', { name: 'Sign out', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('textbox', { name: 'City' }).fill('Karaganda');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await nav.getByRole('link', { name: '02 Personal data' }).click();
  await expect(page.getByRole('textbox', { name: 'City' })).toHaveValue('Karaganda');
  await page.getByRole('link', { name: 'Back to landing page', exact: true }).click();
  await expect(page).toHaveURL(`${app.url}/`);
  await expect(page.getByRole('heading', { name: 'NU Open', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const landingControls = await page.locator('[data-site-header]').evaluate((header) => {
    const language = header.querySelector('.whd-language-group')!.getBoundingClientRect();
    const action = header.querySelector('.landing-header-account')!.getBoundingClientRect();
    return {
      languageX: language.x,
      languageY: language.y,
      actionX: action.x,
      actionY: action.y,
      width: action.width,
      height: action.height,
    };
  });
  expect(landingControls).toEqual(accountControls);
  await expect(page.locator('.landing-header-account')).toHaveCSS(
    'background-color',
    'rgb(247, 245, 239)',
  );
});

test('account Force controls work and sign-out lives in personal data', async ({ page, app }) => {
  await login(page, app.codes, 'personal-signout@example.test');
  // The personal-data view also provides sign-out before first-time onboarding is completed.
  await expect(page.getByRole('navigation', { name: 'Your account' })).toBeVisible();
  const header = page.locator('.auth-header');
  await header.getByRole('button', { name: 'Dark side', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-side', 'dark');
  await header.getByRole('button', { name: 'Light side', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-side', 'light');
  await expect(header.getByRole('link', { name: 'Back to landing page' })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: en.common.confirm, exact: true }).click();
  await expect(page).toHaveURL(`${app.url}/`);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('translated team controls fit and language selection follows the Force side', async ({
  page,
  app,
}) => {
  await login(page, app.codes, 'translated-controls@example.test');
  await onboard(page, 'Александра-Мария Example');
  await page
    .getByRole('textbox', { name: 'Team name', exact: true })
    .fill('Длинное название команды');
  await page.getByRole('button', { name: 'Create a team', exact: true }).click();
  await expect(page.locator('.account-team-danger button')).toBeVisible();
  for (const [locale, copy] of Object.entries({ en, ru, kk })) {
    await page.context().addCookies([{ name: 'locale', value: locale, url: app.url }]);
    await page.goto('/dashboard');
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const dissolve = page.getByRole('button', { name: copy.dashboard.dissolve, exact: true });
      for (const armed of [false, true]) {
        if (armed) await dissolve.click();
        const issues = await page.evaluate(() => {
          const issues: string[] = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('page overflow');
          for (const button of document.querySelectorAll('button')) {
            const box = button.getBoundingClientRect();
            if (!box.width || !box.height) continue;
            if (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              button.scrollWidth > button.clientWidth + 1 ||
              box.height < 44
            )
              issues.push(button.textContent || 'button bounds');
            const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              if (
                !node.textContent?.trim() ||
                node.parentElement?.closest('.sr-only, [aria-hidden="true"]')
              )
                continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) {
                if (
                  rect.width &&
                  (rect.left < box.left + 4 ||
                    rect.right > box.right - 4 ||
                    rect.top < box.top ||
                    rect.bottom > box.bottom)
                )
                  issues.push(node.textContent);
              }
            }
          }
          return issues;
        });
        expect(issues, `${locale}/${width}/${armed ? 'armed' : 'idle'}`).toEqual([]);
        if (armed) {
          // Refresh disarms the confirmation without invoking the destructive action.
          await page.reload();
        }
      }
    }
    const header = page.locator('.auth-header');
    const selected = header.locator('.whd-language-toggle[data-pressed]');
    const labels: Record<string, Record<string, string>> = {
      en: landingEn,
      ru: landingRu,
      kk: landingKk,
    };
    await header.getByRole('button', { name: labels[locale]['Dark side'], exact: true }).click();
    await expect(selected).toHaveCSS('color', 'rgb(255, 49, 49)');
    await header.getByRole('button', { name: labels[locale]['Light side'], exact: true }).click();
    await expect(selected).toHaveCSS('color', 'rgb(62, 168, 255)');
  }
});

test('pilot name stays readable during its simple fade and respects reduced motion', async ({
  page,
  app,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, app.codes, 'pilot-fade@example.test');
  await onboard(page, 'Әлия Example');
  const name = page.locator('.pilot-name');
  await expect(name).toHaveText('Әлия.');
  await expect(page.getByRole('heading', { name: /Welcome aboard,.*Әлия\./ })).toBeVisible();
  await expect(name.locator('*')).toHaveCount(0);
  await expect(name).toHaveCSS('animation-name', 'pilot-name-reveal');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(name).toHaveCSS('animation-name', 'none');
  await expect(name).toHaveCSS('opacity', '1');
});
