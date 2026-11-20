import { env } from 'cloudflare:workers';
import { and, asc, between, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { team } from '@/db/schema';
import { MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '@/lib/event';
import {
  CONTEST_ERRORS,
  CONTEST_PASSWORD_ALPHABET,
  CONTEST_PASSWORD_LENGTH,
  formatTeamNumber,
  type ContestAccess,
} from '@/lib/contest';
import { isRegistrationOpen } from '@/lib/registration.server';
import { TEAM_ERRORS } from '@/lib/team-errors';
import { TEAM_NAME_FORBIDDEN } from '@/lib/validation';

interface AppEnv {
  DB: D1Database;
  CF_LOGIN_PREFIX?: string;
  PROCTORING_URL?: string;
  CONTEST_START?: string;
}

const appEnv = () => env as unknown as AppEnv;

function getAppDb() {
  return getDb(appEnv().DB);
}

// ── Configuration ────────────────────────────────────────────────────────────

/** Codeforces login: the prefix (proctoring's login prefix setting must match) + table number. */
export function contestLogin(number: number): string {
  return `${appEnv().CF_LOGIN_PREFIX?.trim() || 'team'}${formatTeamNumber(number)}`;
}

/** The contest start as an ISO instant, or null while it is blank or unparseable. */
export function getContestStart(): string | null {
  const raw = appEnv().CONTEST_START?.trim();
  if (!raw) return null;
  const start = new Date(raw);
  if (isNaN(start.getTime())) {
    console.warn('[contest] CONTEST_START is unparseable; the upload button stays hidden.', {
      raw,
    });
    return null;
  }
  return start.toISOString();
}

/** Shown to every member of a numbered team. Numbers are never taken back, so neither is this. */
export function getContestAccess(t: {
  number: number | null;
  contestPassword: string | null;
}): ContestAccess | null {
  if (t.number === null || t.contestPassword === null) return null;
  const base = appEnv().PROCTORING_URL?.trim().replace(/\/+$/, '');
  return {
    tableNumber: formatTeamNumber(t.number),
    login: contestLogin(t.number),
    password: t.contestPassword,
    uploadUrl: base ? `${base}/#team=${t.contestPassword}` : null,
    contestStart: getContestStart(),
  };
}

// ── Randomness ───────────────────────────────────────────────────────────────

/** Uniform integer in [0, n), rejecting the values that would bias the modulo. */
function randomBelow(n: number): number {
  const limit = 2 ** 32 - (2 ** 32 % n);
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % n;
}

export function generateContestPassword(): string {
  return Array.from(
    { length: CONTEST_PASSWORD_LENGTH },
    () => CONTEST_PASSWORD_ALPHABET[randomBelow(CONTEST_PASSWORD_ALPHABET.length)],
  ).join('');
}

/** In-place Fisher-Yates shuffle. */
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function isUniqueViolation(error: unknown, column: string): boolean {
  // Drizzle/D1 may wrap the SQLite constraint error in a cause.
  for (let cause = error; cause instanceof Error; cause = cause.cause) {
    const message = cause.message.toLowerCase();
    if (message.includes('unique') && message.includes(column)) return true;
  }
  return false;
}

// ── Organiser actions ────────────────────────────────────────────────────────

/** Correlated to the outer `team` row; raw SQL so the reference can't bind to `participant`. */
const memberCount = sql<number>`(select count(*) from participant where participant.team_id = team.id)`;

/** Eligible and not numbered yet, online or offline: what finalizeTeams numbers. */
const awaitingNumber = () =>
  and(isNull(team.number), between(memberCount, MIN_TEAM_SIZE, MAX_TEAM_SIZE));

/**
 * Mark a team as confirmed to come offline, or back to online. Numbered teams are final: the status
 * decided their number.
 */
export async function setTeamOffline(
  inviteSlug: string,
  offline: boolean,
): Promise<{ inviteSlug: string; offline: boolean }> {
  const db = getAppDb();
  const [row] = await db
    .update(team)
    .set({ offline, updatedAt: new Date() })
    .where(and(eq(team.inviteSlug, inviteSlug), isNull(team.number)))
    .returning({ inviteSlug: team.inviteSlug, offline: team.offline });
  if (row) return row;
  const existing = await db.query.team.findFirst({
    where: eq(team.inviteSlug, inviteSlug),
    columns: { id: true },
  });
  throw new Error(existing ? TEAM_ERRORS.finalized : TEAM_ERRORS.notFound);
}

export type FinalizeResult = { assigned: number; badNames: string[] };

/**
 * Give every eligible team without a number one, with a Codeforces password: offline teams first,
 * then online ones, each by size, smaller first, in random order within each size. Each UPDATE takes MAX(number) + 1 when it runs,
 * inside one batch (a transaction), so numbers never repeat or leave gaps, even when two organisers
 * click at once; a later run appends to the end. Names the
 * Codeforces users file can't carry stop the run, so organisers can fix them first.
 */
export async function finalizeTeams(): Promise<FinalizeResult> {
  if (isRegistrationOpen()) throw new Error(CONTEST_ERRORS.registrationOpen);
  const db = getAppDb();

  for (let attempt = 0; attempt < 5; attempt++) {
    const pending = await db
      .select({ id: team.id, name: team.name, size: memberCount, offline: team.offline })
      .from(team)
      .where(awaitingNumber());
    const badNames = pending.filter((t) => TEAM_NAME_FORBIDDEN.test(t.name)).map((t) => t.name);
    if (badNames.length) return { assigned: 0, badNames };
    if (!pending.length) return { assigned: 0, badNames: [] };

    const passwords = new Set<string>();
    while (passwords.size < pending.length) passwords.add(generateContestPassword());
    const passwordList = [...passwords];
    const now = new Date();
    // The batch runs in this order. The sort is stable, so each group keeps its shuffled order.
    const ordered = shuffle(pending).sort(
      (a, b) => Number(b.offline) - Number(a.offline) || a.size - b.size,
    );
    const [first, ...rest] = ordered.map((t, i) =>
      db
        .update(team)
        .set({
          number: sql`(select coalesce(max(number), 0) + 1 from team)`,
          contestPassword: passwordList[i],
          updatedAt: now,
        })
        .where(and(eq(team.id, t.id), awaitingNumber()))
        .returning({ id: team.id }),
    );
    try {
      const results = await db.batch([first, ...rest]);
      return { assigned: results.filter((updated) => updated.length > 0).length, badNames: [] };
    } catch (error) {
      // A password already held by an earlier team: draw new ones.
      if (isUniqueViolation(error, 'contest_password')) continue;
      throw error;
    }
  }
  throw new Error(TEAM_ERRORS.failed);
}

/** RFC 4180 field: proctoring reads names exactly as written, so no spreadsheet escaping. */
function csvField(value: string | number): string {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** A member's name for proctoring's list: commas separate the names, and `|` or a line break would break its users file. */
const memberName = (fullName: string) => fullName.replace(/[,|\s]+/g, ' ').trim();

/**
 * Numbered teams for proctoring's CSV import, online ones too: everyone gets a Codeforces account.
 * Two columns are optional in proctoring: `shown` starts offline teams shown in its review, online
 * ones hidden; `members` (captain first, then by name) is what its bot and Codeforces names show.
 * Holds every password: generate on request only.
 */
export async function getProctoringCsv(): Promise<string> {
  const rows = await getAppDb().query.team.findMany({
    columns: {
      id: true,
      number: true,
      contestPassword: true,
      name: true,
      offline: true,
      captainId: true,
    },
    with: { members: { columns: { id: true, fullName: true } } },
    where: and(isNotNull(team.number), isNotNull(team.contestPassword)),
    orderBy: asc(team.number),
  });
  const lines = rows.flatMap(
    ({ id, number, contestPassword, name, offline, captainId, members }) => {
      if (number === null || contestPassword === null) return [];
      const names = [
        ...members.filter((m) => m.id === captainId),
        ...members
          .filter((m) => m.id !== captainId)
          .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' })),
      ]
        .map((m) => memberName(m.fullName))
        .filter(Boolean);
      return [
        [id, number, contestLogin(number), contestPassword, name, offline ? 1 : 0, names.join(', ')]
          .map(csvField)
          .join(','),
      ];
    },
  );
  return ['id,number,login,code,name,shown,members', ...lines].join('\n');
}
