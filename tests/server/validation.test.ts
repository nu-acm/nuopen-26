import { expect, it } from 'vite-plus/test';
import { safeInviteRedirect, validateRedirectSearch } from '@/lib/redirect';
import {
  createTeamSchema,
  EDUCATION_LEVELS,
  onboardingSchema,
  requiresGuardianPhone,
  VALIDATION_MESSAGES,
} from '@/lib/validation';
import { profile } from './support';

it('carries valid invite paths through login while discarding unsafe redirects', () => {
  expect(safeInviteRedirect('/invite/team-123')).toBe('/invite/team-123');
  for (const value of [
    'https://other.test',
    '//other.test',
    '/invite/../admin',
    '/dashboard',
    ['invite'],
  ]) {
    expect(safeInviteRedirect(value)).toBeUndefined();
    expect(validateRedirectSearch({ redirect: value })).toEqual({ redirect: undefined });
  }
});

it('requires a valid guardian phone for minors at every study level and normalizes phone digits', () => {
  for (const educationLevel of EDUCATION_LEVELS) {
    const minor = { ...profile, iin: '101101600001', educationLevel };
    expect(onboardingSchema.safeParse(minor).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...minor, parentPhone: '(1)' }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...minor, parentPhone: '+7 702 000 00 00' }).success).toBe(
      true,
    );
    expect(onboardingSchema.safeParse({ ...profile, educationLevel }).success).toBe(true);
  }
  expect(
    onboardingSchema.parse({
      ...profile,
      iin: '101101600001',
      educationLevel: 'College',
      phone: '+7 (701) 000-00-00',
      parentPhone: '+7 702 000 00 00',
    }),
  ).toMatchObject({
    phone: '77010000000',
    parentPhone: '77020000000',
  });
  expect(onboardingSchema.safeParse(profile).success).toBe(true);
});

it('validates both phone fields as E.164 and preserves digits-only storage', () => {
  for (const [input, digits] of [
    ['+7 (701) 000-00-00', '77010000000'],
    ['  +7 701 000 00 00  ', '77010000000'],
    ['77010000000', '77010000000'],
    ['+1.213.373.4253', '12133734253'],
    ['+1234567', '1234567'],
    ['+123456789012345', '123456789012345'],
  ]) {
    const parsed = onboardingSchema.parse({ ...profile, phone: input, parentPhone: input });
    expect(parsed).toMatchObject({ phone: digits, parentPhone: digits });
    expect(onboardingSchema.parse(parsed)).toEqual(parsed);
  }
  for (const input of [
    '123456',
    '+1234567890123456',
    '+07010000000',
    'call +77010000000',
    '+77010000000 ext 123',
    '++77010000000',
    '7701+0000000',
    '+7/701/0000000',
  ]) {
    for (const field of ['phone', 'parentPhone'] as const) {
      const result = onboardingSchema.safeParse({ ...profile, [field]: input });
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({ path: [field], message: VALIDATION_MESSAGES[`${field}Invalid`] }),
      );
    }
  }
});

it('preserves required and optional phone errors after trimming', () => {
  for (const phone of ['', '   ']) {
    expect(onboardingSchema.safeParse({ ...profile, phone }).error?.issues).toContainEqual(
      expect.objectContaining({ path: ['phone'], message: 'Phone is required' }),
    );
  }
  for (const parentPhone of [undefined, '', '   ']) {
    expect(onboardingSchema.parse({ ...profile, parentPhone }).parentPhone).toBeUndefined();
    const minor = { ...profile, iin: '101101600001', parentPhone };
    expect(onboardingSchema.safeParse(minor).error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['parentPhone'],
        message:
          'Enter a parent or guardian phone number. It is required for participants under 18 on the event day or when the IIN has no usable birth date.',
      }),
    );
  }
});

it('checks age on the event date and requires a contact for unusable IIN birth dates', () => {
  // Turning 18 on the event day is adult; turning 18 the next day still needs a contact.
  expect(requiresGuardianPhone('081122600001')).toBe(false);
  expect(requiresGuardianPhone('081123600001')).toBe(true);
  expect(requiresGuardianPhone('081110600001')).toBe(false);
  expect(requiresGuardianPhone('101101600001')).toBe(true);
  expect(requiresGuardianPhone('080229600001')).toBe(false);
  expect(requiresGuardianPhone('080101400001')).toBe(false);
  for (const iin of ['000000000001', '090229600001', '070101700001', '991101600001']) {
    expect(requiresGuardianPhone(iin)).toBe(true);
    expect(onboardingSchema.safeParse({ ...profile, iin }).success).toBe(false);
    expect(
      onboardingSchema.safeParse({ ...profile, iin, parentPhone: '77020000000' }).success,
    ).toBe(true);
  }
  const invalidIin = onboardingSchema.safeParse({ ...profile, iin: 'not-an-iin' });
  expect(invalidIin.error?.issues).toContainEqual(
    expect.objectContaining({ path: ['iin'], message: 'IIN must be exactly 12 digits' }),
  );
});

it('accepts non-students and enforces the minimum age on the event date', () => {
  const nonStudent = { ...profile, educationLevel: 'Not currently studying', placeOfStudy: '' };
  expect(onboardingSchema.safeParse(nonStudent).success).toBe(true);
  expect(onboardingSchema.safeParse({ ...profile, placeOfStudy: '' }).error?.issues).toContainEqual(
    expect.objectContaining({ path: ['placeOfStudy'], message: 'Place of study is required' }),
  );
  const entrant = { ...nonStudent, parentPhone: '77020000000' };
  expect(onboardingSchema.safeParse({ ...entrant, iin: '101122600001' }).success).toBe(true);
  expect(
    onboardingSchema.safeParse({ ...entrant, iin: '101123600001' }).error?.issues,
  ).toContainEqual(
    expect.objectContaining({
      path: ['iin'],
      message: 'You must be at least 16 on the day of the contest.',
    }),
  );
});

it('rejects team names the Codeforces users file cannot carry', () => {
  expect(createTeamSchema.parse({ name: '  Binary Blossoms ' })).toEqual({
    name: 'Binary Blossoms',
  });
  for (const name of ['Bits | Bytes', 'Line\nBreak', 'Carriage\rReturn'])
    expect(createTeamSchema.safeParse({ name }).error?.issues[0]?.message).toBe(
      "Team name can't contain | or line breaks",
    );
});

it('requires explicit consent to the current policy version', () => {
  for (const consent of [undefined, false, 'true']) {
    const result = onboardingSchema.safeParse({ ...profile, consent });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['consent'],
          message: 'Please agree to the terms and personal data processing to continue.',
        }),
      );
  }
  expect(onboardingSchema.safeParse({ ...profile, policyVersion: '2026-10-01' }).success).toBe(
    false,
  );
  expect(onboardingSchema.safeParse(profile).success).toBe(true);
});

it('requires explicit document acknowledgment of the current version', () => {
  for (const documentsRead of [undefined, false, 'true']) {
    const result = onboardingSchema.safeParse({ ...profile, documentsRead });
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['documentsRead'],
        message:
          'Please confirm that you have read the Code of Conduct and Instructions and Rules to continue.',
      }),
    );
  }
  for (const documentsPolicyVersion of [undefined, 'previous-documents']) {
    const result = onboardingSchema.safeParse({ ...profile, documentsPolicyVersion });
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['documentsPolicyVersion'],
        message:
          'The documents have changed. Reload this page and review them before confirming again.',
      }),
    );
  }
});
