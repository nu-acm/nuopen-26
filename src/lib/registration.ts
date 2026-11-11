/** Client-safe registration constants (no `cloudflare:workers`, no env). */
export const REGISTRATION_CLOSED_ERROR = 'Registration is closed.' as const;

export const REGISTRATION_OPEN_DATE = '2026-11-11';
/** End of November 20 in Astana (UTC+5). */
export const DEFAULT_REGISTRATION_DEADLINE = '2026-11-20T23:59:59+05:00';
export const CONFIRMATION_DATE = '2026-11-21';

export type RegistrationStatus = {
  open: boolean;
  /** Effective ISO deadline, including the event default. */
  deadline: string | null;
};
