import { useTranslation } from 'react-i18next';
import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import './schedule.css';

import { useEffect, useRef, useState } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { formatDay, nextIndex } from '@/components/landing/nuopen/lib/schedule';

import { gsap } from '../motion/gsap';
import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';

const MINUTE_MS = 60_000;
const isMainSlot = (slot: (typeof EVENT.agenda)[number]) => 'main' in slot && slot.main === true;

/** Key dates as a hyperspace route, then the contest day's running order. */
export function FlightPlan() {
  const text = useLandingText();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const root = useRef<HTMLElement>(null);
  const [next, setNext] = useState(-1);

  useEffect(() => {
    const update = () => setNext(nextIndex(EVENT.timeline, Date.now()));
    update();
    const id = setInterval(update, MINUTE_MS);
    return () => clearInterval(id);
  }, []);

  useGsap(({ reduced }) => {
    const section = root.current;
    if (reduced || !section) return;
    const copy = section.querySelector<HTMLElement>('.schedule-copy');
    const route = section.querySelector<HTMLElement>('.route');
    const agenda = section.querySelector<HTMLElement>('.agenda');
    if (copy) reveal('.schedule-copy > *', copy);
    if (route) {
      reveal('.route-step', route);
      gsap.fromTo(
        route,
        { '--draw': 0 },
        {
          '--draw': 1,
          ease: 'none',
          scrollTrigger: { trigger: route, start: 'top 80%', end: 'bottom 60%', scrub: true },
        },
      );
    }
    if (agenda) reveal('.agenda-row', agenda);
  }, root);

  return (
    <section ref={root} id="schedule" aria-labelledby="schedule-title" className="section schedule">
      <div className="schedule-copy">
        <p className="kicker">{text('Flight plan')}</p>
        <h2 id="schedule-title" className="h2 font-display">
          <span className="whitespace-nowrap">{text('The route to')}</span>{' '}
          <span className="whitespace-nowrap">
            {formatDay(EVENT.contest.start.slice(0, 10), 'long', language)}
          </span>
        </h2>
      </div>

      <p className="label schedule-caption">{text('Key dates')}</p>
      <ol aria-label={text('Key dates')} className="route">
        {EVENT.timeline.map((item, i) => (
          <li key={item.date} className="route-step" data-next={i === next ? 'true' : undefined}>
            <span aria-hidden className="route-node" />
            <time dateTime={item.date} className="route-date font-mono">
              {formatDay(item.date, 'short', language)}
            </time>
            <h3 className="route-label font-display">{text(item.label)}</h3>
            <p className="route-note">{text(item.note)}</p>
            {i === next && <p className="route-now label">{text('Next stop')}</p>}
          </li>
        ))}
      </ol>

      <p className="label schedule-caption">
        {text('Contest day · All times are Astana time (UTC+5)')}
      </p>
      <ol aria-label={text('Contest day')} className="agenda">
        {EVENT.agenda.map((slot) => (
          <li
            key={slot.from}
            className="agenda-row"
            data-main={isMainSlot(slot) ? 'true' : undefined}
          >
            <p className="agenda-time font-mono">
              {slot.from} – {slot.to}
            </p>
            <div className="agenda-body">
              <p className={isMainSlot(slot) ? 'agenda-title font-display' : 'agenda-title'}>
                {text(slot.title)}
              </p>
              {slot.venue && <p className="agenda-note">{text(slot.venue)}</p>}
            </div>
            {isMainSlot(slot) && (
              <span className="agenda-tag font-mono">
                {text('{{hours}} hours', { hours: EVENT.contest.hours })}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
