export const CONTACT_EMAIL = 'acmsc@nu.edu.kz';
export const TELEGRAM_CHAT_URL = 'https://t.me/nuopen';

export const CODE_OF_CONDUCT_URL =
  'https://drive.google.com/file/d/1RRQvDMPs3dHcb3XTs3wcah10mARCAMtd/view?usp=sharing';

/** Calendar date in Astana, used for participant age on the event day. */
export const EVENT_DATE = '2026-11-22';

export const MIN_PARTICIPANT_AGE = 16;
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 3;

export function isEligibleTeamSize(size: number): boolean {
  return size >= MIN_TEAM_SIZE && size <= MAX_TEAM_SIZE;
}
