import { useState } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { AccountShell } from '@/components/AccountShell';
import { LoginVisual } from '@/components/login/LoginVisual';
import { AuthCard } from '@/components/ui/auth-card';
import { EmailForm } from '@/components/login/EmailForm';
import { OtpForm } from '@/components/login/OtpForm';
import { GoogleButton } from '@/components/login/GoogleButton';
import { getSession, isGoogleSignInEnabled } from '@/lib/auth.server';
import { isRegistrationOpen } from '@/lib/registration.server';
import { Notice } from '@/components/ui/notice';
import { getParticipant } from '@/lib/onboarding.server';
import { safeInviteRedirect, validateRedirectSearch } from '@/lib/redirect';

/**
 * Where a signed-in visitor belongs: onboarding until they have a profile,
 * the dashboard afterwards. Used both to bounce people away from /login and
 * to route them after a successful verification.
 */
const getPostLoginDestination = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession(getRequest());
  if (!session?.user) return null;
  const profile = await getParticipant(session.user.id);
  return profile ? '/dashboard' : '/onboarding';
});

const getLoginOptions = createServerFn({ method: 'GET' }).handler(() => ({
  googleEnabled: isGoogleSignInEnabled(),
  registrationOpen: isRegistrationOpen(),
}));

export const Route = createFileRoute('/login')({
  // `?redirect=/invite/…` survives sign-in, so an invite link opened while
  // signed out still ends on that invite (via onboarding if needed).
  validateSearch: validateRedirectSearch,
  beforeLoad: async ({ search }) => {
    const destination = await getPostLoginDestination();
    if (destination === '/onboarding') throw redirect({ to: '/onboarding', search });
    // Re-checked here as well as in validateSearch: this is where we navigate.
    if (destination) throw redirect({ to: safeInviteRedirect(search.redirect) ?? destination });
  },
  loader: () => getLoginOptions(),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { googleEnabled, registrationOpen } = Route.useLoaderData();
  const search = Route.useSearch();
  const [email, setEmail] = useState<string | null>(null);

  const handleVerified = async () => {
    const destination = (await getPostLoginDestination()) ?? '/onboarding';
    if (destination === '/onboarding') await navigate({ to: '/onboarding', search });
    else await navigate({ to: safeInviteRedirect(search.redirect) ?? destination });
  };

  return (
    <AccountShell>
      {email === null ? (
        <AuthCard
          title="Sign in"
          contentKey="email"
          subtitle="Enter your email and we will send you a 6-digit code."
          illustration={<LoginVisual />}
        >
          {!registrationOpen && (
            <Notice className="mb-5">
              Registration is closed. If you already registered, you can still sign in to see your
              team.
            </Notice>
          )}
          {googleEnabled && (
            <>
              <GoogleButton redirect={search.redirect} />
              <div className="account-form-divider">
                <span className="h-px flex-1 bg-whd-border" />
                <span className="text-sm text-whd-text-muted">or</span>
                <span className="h-px flex-1 bg-whd-border" />
              </div>
            </>
          )}
          <EmailForm onSent={setEmail} />
        </AuthCard>
      ) : (
        <AuthCard
          title="Enter the code"
          contentKey="otp"
          subtitle={`We sent a 6-digit code to ${email}.`}
          illustration={<LoginVisual />}
        >
          <OtpForm email={email} onVerified={handleVerified} onChangeEmail={() => setEmail(null)} />
        </AuthCard>
      )}
    </AccountShell>
  );
}
