export const NAVIGATION_JUMP = 'nuopen:navigation-jump';
export const JUMP_DURATION = 420;

export function isAccountPath(path: string) {
  return /^\/(login|dashboard|onboarding)(?:\/)?$/.test(path) || path.startsWith('/invite/');
}

/** Only the landing/account boundary gets a jump, including browser history navigation. */
export function crossesAccountBoundary(from: string, to: string) {
  return (from === '/' && isAccountPath(to)) || (isAccountPath(from) && to === '/');
}
