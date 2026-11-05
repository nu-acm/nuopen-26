import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';

/** Signed in AND onboarded — anything less gets redirected. */
const checkAccess = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession(getRequest());
  if (!session?.user) return { state: 'anonymous' as const };
  const profile = await getParticipant(session.user.id);
  return profile ? { state: 'ready' as const } : { state: 'needs-onboarding' as const };
});

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const { state } = await checkAccess();
    if (state === 'anonymous') throw redirect({ to: '/login' });
    if (state === 'needs-onboarding') throw redirect({ to: '/onboarding' });
  },
  component: () => <Outlet />,
});
