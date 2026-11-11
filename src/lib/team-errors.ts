/** Messages shown when a team operation fails. */
export const TEAM_ERRORS = {
  noProfile: 'Finish your profile first.',
  alreadyInTeam: 'You are already in a team.',
  nameTaken: 'That team name is taken.',
  nameNeedsLetters: 'Use at least one Latin or Cyrillic letter or digit in the team name.',
  slugUnavailable: 'Could not create an invite link. Try a different team name.',
  invalidInvite: 'That invite link is invalid or the team no longer exists.',
  full: 'This team is already full.',
  notInTeam: 'You are not in a team.',
  notFound: 'Team not found.',
  cannotRemoveSelf: 'You cannot remove yourself.',
  captainOnlyRemove: 'Only the captain can remove members.',
  memberNotInTeam: 'This participant is not in your team.',
  captainCannotLeave: 'The captain must dissolve the team to leave.',
  captainOnlyDissolve: 'Only the captain can dissolve the team.',
  finalized: 'This team has its table number, so it can no longer change.',
  failed: 'That did not work. Please try again.',
} as const;
