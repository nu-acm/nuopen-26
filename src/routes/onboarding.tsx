import { useEffect, useState } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { webHapticsOptions } from '@/lib/web-haptics';
import { CvCard } from '@/components/dashboard/CvCard';
import { AccountSignOut } from '@/components/AccountSignOut';
import { useTranslation } from 'react-i18next';
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { AccountShell } from '@/components/AccountShell';
import { AuthCard } from '@/components/ui/auth-card';
import { OnboardingForm, type OnboardingDefaults } from '@/components/onboarding/OnboardingForm';
import { ensureSession, getSession } from '@/lib/auth.server';
import { getParticipant, upsertParticipant } from '@/lib/onboarding.server';
import { isRegistrationOpen, REGISTRATION_CLOSED_I18N_KEY } from '@/lib/registration.server';
import { LinkButton } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { onboardingSchema } from '@/lib/validation';
import { safeInviteRedirect, validateRedirectSearch } from '@/lib/redirect';
import { DOCUMENTS_POLICY_VERSION, REGISTRATION_POLICY_VERSION } from '@/lib/consent';

/** Existing profile values, so onboarding doubles as "edit my details". */
const loadProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession(getRequest());
  if (!session?.user) return { authed: false as const };

  const registrationOpen = isRegistrationOpen();
  const p = await getParticipant(session.user.id);
  if (!p)
    return {
      authed: true as const,
      registrationOpen,
      defaults: undefined,
      email: session.user.email,
      hasCv: false,
    };

  return {
    authed: true as const,
    email: session.user.email,
    hasCv: !!p.cvUrl,
    registrationOpen,
    defaults: {
      fullName: p.fullName,
      iin: p.iin,
      phone: p.phone,
      city: p.city,
      placeOfStudy: p.placeOfStudy,
      parentPhone: p.parentPhone ?? '',
      educationLevel: p.educationLevel,
      consent: !!p.consentedAt && p.consentPolicyVersion === REGISTRATION_POLICY_VERSION,
      documentsRead:
        !!p.documentsAcknowledgedAt && p.documentsPolicyVersion === DOCUMENTS_POLICY_VERSION,
    } satisfies OnboardingDefaults,
  };
});

const saveProfile = createServerFn({ method: 'POST' })
  .validator(onboardingSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession(getRequest());

    // Re-checked on the server: the client cannot bypass the deadline.
    if (!isRegistrationOpen()) throw new Error(REGISTRATION_CLOSED_I18N_KEY);

    await upsertParticipant({ userId: session.user.id, ...data });
    return { ok: true };
  });

export const Route = createFileRoute('/onboarding')({
  validateSearch: validateRedirectSearch,
  loaderDeps: ({ search }) => search,
  // Wait for current profile data before mounting a form with local input state.
  staleTime: 0,
  preloadStaleTime: 0,
  loader: {
    staleReloadMode: 'blocking',
    handler: async ({ deps }) => {
      const result = await loadProfile();
      if (!result.authed) throw redirect({ to: '/login', search: deps });
      return result;
    },
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const { defaults, registrationOpen, email, hasCv } = Route.useLoaderData();
  const { redirect: inviteRedirect } = Route.useSearch();

  const { trigger } = useWebHaptics(webHapticsOptions);
  const [cvFeedback, setCvFeedback] = useState<{ error: boolean; message: string } | null>(null);
  useEffect(() => {
    if (!cvFeedback) return;
    const timer = setTimeout(() => setCvFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [cvFeedback]);

  const cvPanel = defaults ? (
    <CvCard
      hasCv={hasCv}
      registrationOpen={registrationOpen}
      onDone={async (message) => {
        await router.invalidate();
        void trigger('success');
        setCvFeedback({ error: false, message });
      }}
      onError={(message) => {
        void trigger('error');
        setCvFeedback({ error: true, message });
      }}
    />
  ) : null;

  if (!registrationOpen) {
    // With a profile the details are frozen; without one, sign-up is over.
    return (
      <AccountShell accountTab="personal">
        <AuthCard title={t('onboarding.closedTitle')} layout="invitation">
          <Notice className="mb-5">
            {defaults ? t('onboarding.closedExisting') : t('onboarding.closedNew')}
          </Notice>
          {defaults ? (
            <LinkButton href="/dashboard" className="w-full">
              {t('dashboard.title')}
            </LinkButton>
          ) : (
            <LinkButton href="/" variant="secondary" className="w-full">
              {t('onboarding.backHome')}
            </LinkButton>
          )}
          {cvPanel}
          <AccountSignOut email={email} />
        </AuthCard>
      </AccountShell>
    );
  }

  return (
    <AccountShell accountTab="personal">
      <AuthCard
        title={t('account.profileTitle')}
        subtitle={t('account.profileIntro')}
        layout="profile"
        eyebrow={`02 / ${t('account.personalTab')}`}
        headingDetail={
          <div className="profile-help">
            <p className="account-eyebrow">{t('account.yourClearance')}</p>
            <p>{t('account.profileHelp')}</p>
          </div>
        }
        profileExtras={
          <>
            {cvFeedback && (
              <p
                role={cvFeedback.error ? 'alert' : 'status'}
                className={
                  cvFeedback.error
                    ? 'account-feedback account-feedback-error'
                    : 'account-feedback account-feedback-success'
                }
              >
                {t(cvFeedback.message)}
              </p>
            )}
            {cvPanel}
            <AccountSignOut email={email} />
          </>
        }
      >
        <OnboardingForm
          defaults={defaults}
          email={email}
          onSubmit={async (values) => {
            await saveProfile({ data: values });
            await router.invalidate({ sync: true });
            await navigate({ to: safeInviteRedirect(inviteRedirect) ?? '/dashboard' });
          }}
        />
      </AuthCard>
    </AccountShell>
  );
}
