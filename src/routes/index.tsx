import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { Landing } from '@/components/landing/nuopen/components/landing';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';
import { getTeamByParticipant } from '@/lib/team.server';
import { getRegistrationStatus } from '@/lib/registration.server';
import { MIN_TEAM_SIZE } from '@/db/schema';
import type { NextStep } from '@/lib/next-step';

/** The session, plus where this visitor is in the sign-up funnel. */
const getLandingState = createServerFn({ method: 'GET' }).handler(async () => ({
  ...(await getFunnelState()),
  registration: getRegistrationStatus(),
}));

async function getFunnelState() {
  const session = await getSession(getRequest());
  if (!session?.user) return { session, nextStep: 'register' as NextStep };
  const profile = await getParticipant(session.user.id);
  if (!profile) return { session, nextStep: 'onboarding' as NextStep };
  if (!profile.teamId) return { session, nextStep: 'team' as NextStep };
  // A team competes with exactly MIN_TEAM_SIZE members.
  const team = await getTeamByParticipant(session.user.id);
  const ready = !!team && team.members.length === MIN_TEAM_SIZE;
  return { session, nextStep: (ready ? 'ready' : 'incomplete') as NextStep };
}

export const Route = createFileRoute('/')({
  loader: () => getLandingState(),
  component: LandingPage,
});

function LandingPage() {
  const { nextStep, registration } = Route.useLoaderData();
  return <Landing nextStep={nextStep} registration={registration} />;
}
