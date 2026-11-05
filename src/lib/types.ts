import type { getSession } from '@/lib/auth.server';

/** The session shape returned by Better Auth, or null when signed out. */
export type Session = Awaited<ReturnType<typeof getSession>>;
