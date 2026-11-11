export const CONTACT_EMAIL = 'acm_w@nu.edu.kz';

/** The participant chat linked in the FAQ. */
export const TELEGRAM_CHAT_URL = 'https://t.me/whd_2026';

export const CODE_OF_CONDUCT_URL =
  'https://drive.google.com/file/d/1omx4qtnA4DYh6qeLnf9o_lQiF8wSb2HG/view?usp=sharing';
export const INSTRUCTIONS_AND_RULES_URL =
  'https://drive.google.com/file/d/1lblOCnzRenDdfWUR13vQMKcli6M9exZf/view?usp=sharing';

/** Calendar date in Astana, used for participant age on the event day. */
export const EVENT_DATE = '2026-11-22';

export const MIN_PARTICIPANT_AGE = 16;
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 3;

export function isEligibleTeamSize(size: number): boolean {
  return size >= MIN_TEAM_SIZE && size <= MAX_TEAM_SIZE;
}
