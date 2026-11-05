/**
 * Where a visitor is in the sign-up funnel, so the hero can point at the one
 * thing left to do instead of a generic "Register" button.
 */
export type NextStep = 'register' | 'onboarding' | 'team' | 'incomplete' | 'ready';

export const NEXT_STEP_ROUTE = {
  register: '/login',
  onboarding: '/onboarding',
  team: '/dashboard',
  incomplete: '/dashboard',
  ready: '/dashboard',
} as const satisfies Record<NextStep, string>;
