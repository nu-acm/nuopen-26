import { useEffect, useState } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { AccountShell } from '@/components/AccountShell';
import { AuthCard } from '@/components/ui/auth-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { MAX_TEAM_SIZE } from '@/lib/event';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';
import { getTeamBySlug, joinTeamBySlug } from '@/lib/team.server';
import { isRegistrationOpen, REGISTRATION_CLOSED_ERROR } from '@/lib/registration.server';
import { inviteSlugSchema } from '@/lib/validation';
import { webHapticsOptions } from '@/lib/web-haptics';
import { pageMetadata, SITE_TITLE } from '@/lib/metadata';

/**
 * Resolve the public invitation before the browser continues to login/onboarding,
 * so link previews can read the team's metadata from the initial HTML.
 */
const resolveInvite = createServerFn({ method: 'GET' })
  .validator(inviteSlugSchema)
  .handler(async ({ data }) => {
    const team = await getTeamBySlug(data.slug);
    if (!team) return { status: 'not-found' as const };
    if (!isRegistrationOpen()) return { status: 'closed' as const, team };

    const session = await getSession(getRequest());
    if (!session?.user) return { status: 'anonymous' as const, team };

    const profile = await getParticipant(session.user.id);
    if (!profile) return { status: 'needs-onboarding' as const, team };
    if (profile.teamId) return { status: 'already-in-team' as const, team };
    if (team.isFull) return { status: 'full' as const, team };

    return { status: 'can-join' as const, team };
  });

const acceptInvite = createServerFn({ method: 'POST' })
  .validator(inviteSlugSchema)
  .handler(async ({ data }) => {
    const session = await getSession(getRequest());
    if (!session?.user) throw new Error('Unauthorized');
    if (!isRegistrationOpen()) throw new Error(REGISTRATION_CLOSED_ERROR);
    return joinTeamBySlug(session.user.id, data.slug);
  });

export const Route = createFileRoute('/invite/$slug')({
  loader: ({ params }) => resolveInvite({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const team = loaderData && 'team' in loaderData ? loaderData.team : undefined;
    return {
      meta: pageMetadata(
        team ? `Join ${team.name} | ${SITE_TITLE}` : `Team invitation | ${SITE_TITLE}`,
        team
          ? `You have been invited to join ${team.name} at ${SITE_TITLE}. Sign in to accept your invitation and compete on November 22 at Nazarbayev University, Astana.`
          : 'Open your NU Open team invitation to see the team and join the contest.',
      ),
    };
  },
  component: InvitePage,
});

function InvitePage() {
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  const result = Route.useLoaderData();
  const { trigger } = useWebHaptics(webHapticsOptions);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsAccount = result.status === 'anonymous' || result.status === 'needs-onboarding';

  useEffect(() => {
    if (result.status !== 'anonymous' && result.status !== 'needs-onboarding') return;
    void navigate({
      to: result.status === 'anonymous' ? '/login' : '/onboarding',
      search: { redirect: `/invite/${slug}` },
      replace: true,
    });
  }, [navigate, result.status, slug]);

  const join = async () => {
    setError(null);
    setPending(true);
    try {
      await acceptInvite({ data: { slug } });
      void trigger('success');
      await navigate({ to: '/dashboard' });
    } catch (err) {
      void trigger('error');

      setError(err instanceof Error ? err.message : 'That did not work. Please try again.');
      setPending(false);
    }
  };

  const messages: Record<string, string> = {
    'not-found': 'That invite code is not valid',
    anonymous: 'Sign in or register to accept this invitation.',
    'needs-onboarding': 'Complete your profile to accept this invitation.',
    closed: 'Registration is closed, so teams can no longer change.',
    'already-in-team': 'You are already in a team. Leave it first to join another.',
    full: 'This team is already full.',
  };

  return (
    <AccountShell accountTab="team">
      <AuthCard
        layout="invitation"
        headingDetail={
          result.status !== 'not-found' && (
            <>
              <h2 className="invitation-team-name">{result.team.name}</h2>
              <div className="invitation-facts">
                <span>{`${result.team.memberCount} of ${MAX_TEAM_SIZE}`}</span>
                <span>Nazarbayev University</span>
              </div>
            </>
          )
        }
        title={result.status === 'can-join' || needsAccount ? 'Join this team' : 'Cannot join'}
        subtitle={
          result.status === 'can-join'
            ? `You have been invited to join ${result.team.name}.`
            : messages[result.status]
        }
      >
        {result.status === 'can-join' ? (
          <div className="flex flex-col gap-3">
            <Button className="w-full" disabled={pending} onClick={join}>
              {pending ? 'Loading…' : 'Join team'}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        ) : needsAccount ? (
          <Link
            to={result.status === 'anonymous' ? '/login' : '/onboarding'}
            search={{ redirect: `/invite/${slug}` }}
            className={buttonVariants({ className: 'w-full' })}
          >
            {result.status === 'anonymous' ? 'Sign in to join' : 'Complete profile'}
          </Link>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Dashboard
          </Button>
        )}
      </AuthCard>
    </AccountShell>
  );
}
