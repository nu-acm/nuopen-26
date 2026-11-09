import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, test } from '@playwright/test';

type SentEmail = { to: string; subject: string; body: string; htmlBody: string; name: string };
type CodeMessage = {
  subject: string;
  from?: string;
  ageMs?: number;
  draft?: boolean;
  trashed?: boolean;
};

const source = readFileSync(new URL('../../gas/Code.gs', import.meta.url), 'utf8');

function mailer(messages: CodeMessage[] = []) {
  const sent: SentEmail[] = [];
  const searches: string[] = [];
  const sandbox = {
    MailApp: { sendEmail: (email: SentEmail) => sent.push(email) },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text: string) => ({ setMimeType: () => text }),
    },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'mailer@example.test' }) },
    GmailApp: {
      search: (query: string) => {
        searches.push(query);
        return [
          {
            getMessages: () =>
              messages.map((message) => ({
                getFrom: () => message.from ?? 'NU Open <mailer@example.test>',
                getSubject: () => message.subject,
                getDate: () => new Date(Date.now() - (message.ageMs ?? 2 * 86_400_000)),
                isDraft: () => message.draft ?? false,
                isInTrash: () => message.trashed ?? false,
                moveToTrash: () => void (message.trashed = true),
              })),
          },
        ];
      },
    },
  };
  const api = runInNewContext(`${source}\n;({ sendOtp, cleanupOldCodes })`, sandbox) as {
    sendOtp: (input: { email: string; otp: string }) => string;
    cleanupOldCodes: () => void;
  };
  return { ...api, sent, searches };
}

test('sends a recognizable, selectable NU Open code without splitting its digits', async ({
  page,
}, info) => {
  const { sendOtp, sent } = mailer();
  expect(JSON.parse(sendOtp({ email: ' pilot@example.test ', otp: '012345' }))).toEqual({
    ok: true,
  });
  expect(sent).toHaveLength(1);
  const email = sent[0];
  expect(email.to).toBe('pilot@example.test');
  expect(email.name).toBe('NU Open');
  expect(email.subject).toBe('012345 is your NU Open verification code');
  expect(email.body).toContain('verification code is 012345');
  expect(email.body).toContain('expires in 5 minutes');
  expect(email.htmlBody).not.toMatch(/<script\b|\son[a-z]+\s*=|javascript:/i);
  await page.setContent(email.htmlBody);
  const code = page.getByText('012345', { exact: true });
  await expect(code).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
  await expect(page.getByText('Incoming transmission')).toBeVisible();
  if (info.project.name === 'mobile') await code.tap();
  else await code.click();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe('012345');
});

test('rejects invalid codes and only cleans up matching old verification mail', () => {
  const messages: CodeMessage[] = [
    { subject: '012345 is your NU Open verification code' },
    { subject: '123456 is your NU Open code' },
    { subject: "234567 is your Women's Hack Day code" },
    { subject: '345678 is your NU Open verification code', ageMs: 60_000 },
    { subject: '456789 is your NU Open verification code', from: 'other@example.test' },
    { subject: '567890 is your NU Open verification code extra' },
    { subject: '678901 is your NU Open verification code', draft: true },
  ];
  const { sendOtp, cleanupOldCodes, sent, searches } = mailer(messages);
  for (const otp of ['123 456', '12345', '1234567', '<12345']) {
    expect(JSON.parse(sendOtp({ email: 'pilot@example.test', otp }))).toEqual({
      ok: false,
      error: 'Invalid code',
    });
  }
  expect(sent).toHaveLength(0);
  cleanupOldCodes();
  expect(searches).toHaveLength(3);
  expect(messages.map((message) => !!message.trashed)).toEqual([
    true,
    true,
    true,
    false,
    false,
    false,
    false,
  ]);
});
