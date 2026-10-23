// Fixed UTC+5 (IANA inverts the sign): Asia/Almaty depends on device tzdata, which predates the 2024 move to +5 on old phones.
const ASTANA = "Etc/GMT-5";

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: ASTANA });

export function contestWindow(start: string, end: string) {
  const from = clock.format(new Date(start));
  const to = clock.format(new Date(end));
  return { range: `${from}–${to}`, zone: "Astana time (UTC+5)" };
}
