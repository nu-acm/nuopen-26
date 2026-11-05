import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { useSyncExternalStore } from 'react';

import { pad2, timeLeft } from '@/components/landing/nuopen/lib/countdown';

const everySecond = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const currentSecond = () => Math.floor(Date.now() / 1000);
const noTimeOnServer = () => null;

const UNITS = [
  { key: 'days', label: 'days' },
  { key: 'hours', label: 'hrs' },
  { key: 'minutes', label: 'min' },
  { key: 'seconds', label: 'sec' },
] as const;

/** Time to the contest start; renders dashes on the server so the HTML never shows a stale time. */
export function Countdown({
  target,
  end,
  className = '',
}: {
  target: string;
  end: string;
  className?: string;
}) {
  const text = useLandingText();
  const now = useSyncExternalStore(everySecond, currentSecond, noTimeOnServer);
  const left = now === null ? null : timeLeft(now * 1000, Date.parse(target));
  if (left?.done) {
    const over = now !== null && now * 1000 >= Date.parse(end);
    return (
      <p role="timer" className={`label nu-text-var-saber ${className}`}>
        {text(over ? 'The contest has ended' : 'The contest is live')}
      </p>
    );
  }

  return (
    <div
      role="timer"
      aria-label={text('Time until the contest starts')}
      className={`flex items-end gap-4 sm:gap-6 ${className}`}
    >
      {UNITS.map(({ key, label }) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <span
            data-testid={`countdown-${key}`}
            className="font-mono nu-text-1-75rem leading-none font-medium text-ink tabular-nums sm:nu-text-2-25rem"
          >
            {left ? pad2(left[key]) : '--'}
          </span>
          <span className="label">{text(label)}</span>
        </div>
      ))}
    </div>
  );
}
