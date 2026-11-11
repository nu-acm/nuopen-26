import { useId, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useWebHaptics } from 'web-haptics/react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload-2';
import { CV_UPLOAD_HINT } from '@/lib/cv';
import { getCvSelectionError } from '@/lib/cv-client';
import {
  EDUCATION_LEVELS,
  requiresGuardianPhone,
  onboardingSchema,
  VALIDATION_MESSAGES,
  type EducationLevel,
  type OnboardingInput,
} from '@/lib/validation';
import { webHapticsOptions } from '@/lib/web-haptics';
import { REGISTRATION_CLOSED_ERROR } from '@/lib/registration';
import { DOCUMENTS_POLICY_VERSION, REGISTRATION_POLICY_VERSION } from '@/lib/consent';
import { CODE_OF_CONDUCT_URL, INSTRUCTIONS_AND_RULES_URL } from '@/lib/event';

export type OnboardingDefaults = Partial<
  Record<Exclude<keyof OnboardingInput, 'consent' | 'documentsRead'>, string>
> & { consent?: boolean; documentsRead?: boolean };

type Errors = Partial<Record<keyof OnboardingInput | 'form', string>>;

export function OnboardingForm({
  defaults,
  email,
  onSubmit,
}: {
  defaults?: OnboardingDefaults;
  email?: string;
  onSubmit: (values: OnboardingInput, cv: File | null) => Promise<boolean>;
}) {
  const consentId = useId();
  const documentsId = useId();
  const [values, setValues] = useState({
    fullName: defaults?.fullName ?? '',
    iin: defaults?.iin ?? '',
    phone: defaults?.phone ?? '',
    city: defaults?.city ?? '',
    placeOfStudy: defaults?.placeOfStudy ?? '',
    parentPhone: defaults?.parentPhone ?? '',
    educationLevel: (defaults?.educationLevel ?? '') as EducationLevel | '',
    consent: defaults?.consent ?? false,
    policyVersion: REGISTRATION_POLICY_VERSION,
    documentsRead: defaults?.documentsRead ?? false,
    documentsPolicyVersion: DOCUMENTS_POLICY_VERSION,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [cvError, setCvError] = useState('');
  const { trigger } = useWebHaptics(webHapticsOptions);

  const set =
    <K extends keyof typeof values>(key: K) =>
    (v: (typeof values)[K]) =>
      setValues((prev) => ({ ...prev, [key]: v }));

  const needsParentPhone = requiresGuardianPhone(values.iin);

  const selectCv = (files: File[]) => {
    const error = getCvSelectionError(files);
    setCvError(error ?? '');
    if (!error) setCv(files[0]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setErrors({});

    const parsed = onboardingSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof OnboardingInput;

        if (key && !next[key]) next[key] = issue.message;
      }
      void trigger('error');
      setErrors(next);
      return;
    }

    setPending(true);
    try {
      if (await onSubmit(parsed.data, cv)) void trigger('success');
    } catch (err) {
      void trigger('error');
      // Server validation errors serialize their issues into Error.message.
      const next: Errors = {};
      if (err instanceof Error) {
        try {
          const issues: unknown = JSON.parse(err.message);
          if (Array.isArray(issues)) {
            for (const issue of issues) {
              const key = issue?.path?.[0];
              if (
                typeof key === 'string' &&
                Object.hasOwn(values, key) &&
                Object.values(VALIDATION_MESSAGES).some((message) => message === issue.message)
              ) {
                const field = key as keyof OnboardingInput;
                if (!next[field]) next[field] = issue.message;
              }
            }
          }
        } catch {
          // Plain errors are handled below.
        }
      }
      if (Object.keys(next).length === 0) {
        next.form =
          err instanceof Error && err.message === REGISTRATION_CLOSED_ERROR
            ? err.message
            : 'Could not save. Please try again.';
      }
      setErrors(next);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="account-profile-form" noValidate>
      <FieldGroup>
        {email && (
          <div className="profile-verified-email">
            <FormField label="Email address" hint="Your verified sign-in address.">
              {(p) => <Input {...p} type="email" value={email} readOnly />}
            </FormField>
          </div>
        )}
        <FormField disabled={pending} label="Full name" error={errors.fullName} required>
          {(p) => (
            <Input
              {...p}
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => set('fullName')(e.target.value)}
              disabled={pending}
            />
          )}
        </FormField>

        <FormField disabled={pending} label="IIN" hint="12 digits" error={errors.iin} required>
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              maxLength={12}
              value={values.iin}
              onChange={(e) => set('iin')(e.target.value.replace(/\D/g, '').slice(0, 12))}
              disabled={pending}
            />
          )}
        </FormField>

        <FormField disabled={pending} label="Phone" error={errors.phone} required>
          {(p) => (
            <Input
              {...p}
              type="tel"
              autoComplete="tel"
              placeholder="+7 700 000 00 00"
              value={values.phone}
              onChange={(e) => set('phone')(e.target.value)}
              disabled={pending}
            />
          )}
        </FormField>

        <FormField disabled={pending} label="Level of study" error={errors.educationLevel} required>
          {(p) => (
            <Select
              {...p}
              value={values.educationLevel}
              onChange={(e) => set('educationLevel')(e.target.value as EducationLevel | '')}
              disabled={pending}
            >
              <option value="" disabled>
                Select your level of study
              </option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        {needsParentPhone && (
          <FormField
            disabled={pending}
            label="Parent or guardian phone"
            hint="Required if you will be under 18 on November 22, 2026, or your IIN has no usable birth date."
            error={errors.parentPhone}
            required
          >
            {(p) => (
              <Input
                {...p}
                type="tel"
                placeholder="+7 700 000 00 00"
                value={values.parentPhone}
                onChange={(e) => set('parentPhone')(e.target.value)}
                disabled={pending}
              />
            )}
          </FormField>
        )}

        <FormField
          disabled={pending}
          label="School, college or university"
          error={errors.placeOfStudy}
          required={values.educationLevel !== 'Not currently studying'}
        >
          {(p) => (
            <Input
              {...p}
              value={values.placeOfStudy}
              onChange={(e) => set('placeOfStudy')(e.target.value)}
              disabled={pending}
            />
          )}
        </FormField>

        <FormField disabled={pending} label="City" error={errors.city} required>
          {(p) => (
            <Input
              {...p}
              autoComplete="address-level2"
              value={values.city}
              onChange={(e) => set('city')(e.target.value)}
              disabled={pending}
            />
          )}
        </FormField>

        <Field
          variant="consent"
          data-invalid={!!errors.consent}
          data-disabled={pending || undefined}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              id={consentId}
              name="consent"
              checked={values.consent}
              onCheckedChange={set('consent')}
              disabled={pending}
              aria-required="true"
              aria-invalid={!!errors.consent}
              aria-describedby={`${consentId}-hint${errors.consent ? ` ${consentId}-error` : ''}`}
            />
            <FieldLabel htmlFor={consentId}>
              I agree to the terms and consent to the processing of my personal data.
            </FieldLabel>
          </div>
          <FieldDescription id={`${consentId}-hint`}>
            Read the{' '}
            <Link to="/privacy" target="_blank" rel="noopener">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms" target="_blank" rel="noopener">
              Terms of Service
            </Link>
            . CV upload is optional.
          </FieldDescription>
          {errors.consent && <FieldError id={`${consentId}-error`}>{errors.consent}</FieldError>}
          {errors.policyVersion && <FieldError>{errors.policyVersion}</FieldError>}
        </Field>

        <Field
          variant="consent"
          data-invalid={!!errors.documentsRead}
          data-disabled={pending || undefined}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              id={documentsId}
              name="documentsRead"
              checked={values.documentsRead}
              onCheckedChange={set('documentsRead')}
              disabled={pending}
              aria-required="true"
              aria-invalid={!!errors.documentsRead}
              aria-describedby={`${documentsId}-hint${errors.documentsRead ? ` ${documentsId}-error` : ''}`}
            />
            <FieldLabel htmlFor={documentsId}>
              I have read the Code of Conduct and Instructions and Rules.
            </FieldLabel>
          </div>
          <FieldDescription id={`${documentsId}-hint`}>
            Read the{' '}
            <a href={CODE_OF_CONDUCT_URL} target="_blank" rel="noopener">
              Code of Conduct
            </a>{' '}
            and{' '}
            <a href={INSTRUCTIONS_AND_RULES_URL} target="_blank" rel="noopener">
              Instructions and Rules
            </a>
            .
          </FieldDescription>
          {errors.documentsRead && (
            <FieldError id={`${documentsId}-error`}>{errors.documentsRead}</FieldError>
          )}
          {errors.documentsPolicyVersion && (
            <FieldError>{errors.documentsPolicyVersion}</FieldError>
          )}
        </Field>

        {!defaults && (
          <div className="account-cv-upload">
            <FileUpload
              accept="application/pdf,.pdf"
              title="Your CV"
              hint={CV_UPLOAD_HINT}
              buttonLabel={cv ? 'Choose another PDF' : 'Choose PDF'}
              uploadingLabel="Uploading…"
              disabled={pending}
              fileName={cv?.name}
              error={cvError}
              onFilesAdded={selectCv}
            />
            {cv && (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setCv(null);
                  setCvError('');
                }}
              >
                Remove selected PDF
              </Button>
            )}
          </div>
        )}

        {errors.form && (
          <p role="alert" className="text-sm text-destructive">
            {errors.form}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? 'Loading…' : 'Continue'}
        </Button>
      </FieldGroup>
    </form>
  );
}
