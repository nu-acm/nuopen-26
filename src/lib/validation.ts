import { z } from 'zod';
import { DOCUMENTS_POLICY_VERSION, REGISTRATION_POLICY_VERSION } from '@/lib/consent';
import { EVENT_DATE, MIN_PARTICIPANT_AGE } from '@/lib/event';

export const EDUCATION_LEVELS = [
  'School',
  'College',
  'Foundation',
  "Bachelor's",
  "Master's",
  'PhD',
  'Not currently studying',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

const IIN_PATTERN = /^\d{12}$/;

function ageOnEventDay(iin: string): number | null {
  const century = Number(iin[6]);
  if (century < 1 || century > 6) return null;

  const year = 1700 + Math.ceil(century / 2) * 100 + Number(iin.slice(0, 2));
  const month = Number(iin.slice(2, 4));
  const day = Number(iin.slice(4, 6));
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const eventDate = new Date(`${EVENT_DATE}T00:00:00Z`);
  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== month - 1 ||
    birthDate.getUTCDate() !== day ||
    birthDate > eventDate
  ) {
    return null;
  }

  let age = eventDate.getUTCFullYear() - year;
  if (
    eventDate.getUTCMonth() < month - 1 ||
    (eventDate.getUTCMonth() === month - 1 && eventDate.getUTCDate() < day)
  ) {
    age--;
  }
  return age;
}

/** An unusable birth date still requires a guardian contact. */
export function requiresGuardianPhone(iin: string): boolean {
  if (!IIN_PATTERN.test(iin)) return false;
  const age = ageOnEventDay(iin);
  return age === null || age < 18;
}

export const VALIDATION_MESSAGES = {
  emailRequired: 'Email is required',
  invalidEmail: 'Enter a valid email',
  codeMustBe6Digits: 'The code is 6 digits',
  fullNameRequired: 'Full name is required',
  fullNameMax: 'Full name is too long',
  iinInvalid: 'IIN must be exactly 12 digits',
  participantTooYoung: 'You must be at least 16 on the day of the contest.',
  phoneRequired: 'Phone is required',
  phoneInvalid: 'Enter a valid phone number',
  educationInvalid: 'Choose your level of study',
  teamNameMin: 'Team name must be at least 3 characters',
  teamNameMax: 'Team name must be 30 characters or fewer',
  teamNameChars: "Team name can't contain | or line breaks",
  inviteCodeRequired: 'Invite code is required',
  inviteCodeInvalid: 'That invite code is not valid',
  cityRequired: 'City is required',
  cityMax: 'City is too long',
  placeOfStudyRequired: 'Place of study is required',
  placeOfStudyMax: 'Place of study is too long',
  parentPhoneInvalid: 'Enter a valid phone number',
  parentPhoneRequired:
    'Enter a parent or guardian phone number. It is required for participants under 18 on the event day or when the IIN has no usable birth date.',
  consentRequired: 'Please agree to the terms and personal data processing to continue.',
  policyChanged:
    'The registration policy has changed. Reload this page and review it before continuing.',
  documentsRequired:
    'Please confirm that you have read the Code of Conduct and Instructions and Rules to continue.',
  documentsChanged:
    'The documents have changed. Reload this page and review them before confirming again.',
} as const;

// ── Login step 1: email ──────────────────────────────────────────────────────
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { error: VALIDATION_MESSAGES.emailRequired })
    .pipe(z.email({ error: VALIDATION_MESSAGES.invalidEmail })),
});
export type EmailInput = z.infer<typeof emailSchema>;

// ── Login step 2: one-time code ──────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { error: VALIDATION_MESSAGES.codeMustBe6Digits })
    .regex(/^\d{6}$/, { error: VALIDATION_MESSAGES.codeMustBe6Digits }),
});
export type OtpInput = z.infer<typeof otpSchema>;

function phoneSchema(error: string) {
  return z
    .string()
    .transform((value) => {
      const compact = value.replace(/[\s().-]/g, '');
      return compact.startsWith('+') ? compact : `+${compact}`;
    })
    .pipe(z.e164({ error }))
    .transform((value) => value.slice(1));
}

// ── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: VALIDATION_MESSAGES.fullNameRequired })
      .max(100, { error: VALIDATION_MESSAGES.fullNameMax }),
    iin: z.string().regex(IIN_PATTERN, { error: VALIDATION_MESSAGES.iinInvalid }),
    phone: z
      .string()
      .trim()
      .min(1, { error: VALIDATION_MESSAGES.phoneRequired })
      .pipe(phoneSchema(VALIDATION_MESSAGES.phoneInvalid)),
    city: z
      .string()
      .trim()
      .min(1, { error: VALIDATION_MESSAGES.cityRequired })
      .max(100, { error: VALIDATION_MESSAGES.cityMax }),
    placeOfStudy: z.string().trim().max(100, { error: VALIDATION_MESSAGES.placeOfStudyMax }),
    parentPhone: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined)
      .pipe(phoneSchema(VALIDATION_MESSAGES.parentPhoneInvalid).optional()),
    educationLevel: z.enum(EDUCATION_LEVELS, { error: VALIDATION_MESSAGES.educationInvalid }),
    consent: z.literal(true, { error: VALIDATION_MESSAGES.consentRequired }),
    policyVersion: z.literal(REGISTRATION_POLICY_VERSION, {
      error: VALIDATION_MESSAGES.policyChanged,
    }),
    documentsRead: z.literal(true, { error: VALIDATION_MESSAGES.documentsRequired }),
    documentsPolicyVersion: z.literal(DOCUMENTS_POLICY_VERSION, {
      error: VALIDATION_MESSAGES.documentsChanged,
    }),
  })
  .refine((d) => d.educationLevel === 'Not currently studying' || !!d.placeOfStudy, {
    message: VALIDATION_MESSAGES.placeOfStudyRequired,
    path: ['placeOfStudy'],
  })
  .refine(
    (d) => {
      if (!IIN_PATTERN.test(d.iin)) return true;
      const age = ageOnEventDay(d.iin);
      return age === null || age >= MIN_PARTICIPANT_AGE;
    },
    { message: VALIDATION_MESSAGES.participantTooYoung, path: ['iin'] },
  )
  .refine((d) => !requiresGuardianPhone(d.iin) || !!d.parentPhone, {
    message: VALIDATION_MESSAGES.parentPhoneRequired,
    path: ['parentPhone'],
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ── Teams ────────────────────────────────────────────────────────────────────
/** The Codeforces users file separates columns with "|" and users with line breaks. */
export const TEAM_NAME_FORBIDDEN = /[|\r\n]/;

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: VALIDATION_MESSAGES.teamNameMin })
    .max(30, { error: VALIDATION_MESSAGES.teamNameMax })
    .refine((name) => !TEAM_NAME_FORBIDDEN.test(name), {
      error: VALIDATION_MESSAGES.teamNameChars,
    }),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const inviteSlugSchema = z.object({
  slug: z
    .string()
    .min(1, { error: VALIDATION_MESSAGES.inviteCodeRequired })
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: VALIDATION_MESSAGES.inviteCodeInvalid }),
});
export type InviteSlugInput = z.infer<typeof inviteSlugSchema>;
