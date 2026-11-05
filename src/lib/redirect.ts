/**
 * The only post-login destination we honour from the URL: an invite link.
 * Anything else is dropped, so `?redirect=` cannot bounce people off-site.
 */
const INVITE_PATH = /^\/invite\/[a-z0-9]+(-[a-z0-9]+)*$/;

export function safeInviteRedirect(value: unknown): string | undefined {
  return typeof value === 'string' && INVITE_PATH.test(value) ? value : undefined;
}

/**
 * `validateSearch` for routes that carry an invite link through sign-up. The key
 * is always set: TanStack merges raw parent search params back in, so leaving
 * it out would let an unvalidated `redirect` through.
 */
export function validateRedirectSearch(search: Record<string, unknown>): { redirect?: string } {
  return { redirect: safeInviteRedirect(search.redirect) };
}
