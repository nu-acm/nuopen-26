const DAY_MS = 86_400_000;
const ASTANA = 'Etc/GMT-5'; // Fixed UTC+5 (IANA inverts the sign), matching the +05:00 in every date string.

const startOfDay = (date: string) => Date.parse(`${date}T00:00:00+05:00`);

/** Index of the first milestone whose day is not over yet (so a date stays highlighted all day), or -1 when all have passed. */
export function nextIndex(timeline: readonly { readonly date: string }[], now: number): number {
  return timeline.findIndex(({ date }) => startOfDay(date) + DAY_MS > now);
}

export function formatDay(date: string, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style,
    timeZone: ASTANA,
  }).format(startOfDay(date));
}
