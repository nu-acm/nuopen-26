import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import './allies.css';

import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';

const YEAR = new Date(EVENT.contest.start).getFullYear();

const COMPANIES = [...new Set(EVENT.partners.flatMap((partner) => partner.names))];

export function Allies() {
  const text = useLandingText();
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<HTMLOListElement>(null);
  const side = useRef<HTMLDivElement>(null);

  useGsap(({ reduced }) => {
    if (reduced || !root.current) return;
    reveal('.allies-head > *', root.current);
    if (timeline.current) reveal('.allies-row', timeline.current);
    if (side.current) reveal('.allies-side > *', side.current);
  }, root);

  return (
    <section ref={root} id="allies" aria-labelledby="allies-title" className="section split allies">
      <div className="allies-copy split-copy">
        <div className="allies-head">
          <p className="kicker">{text('Allies')}</p>
          <h2 id="allies-title" className="h2 font-display">
            {text('Allies across the galaxy')}
          </h2>
          <p className="lead">
            {text(
              'Partners have backed NU Open since 2020. Here is every company that has put its name behind the contest, year by year.',
            )}
          </p>
        </div>

        <ol ref={timeline} className="allies-timeline">
          {EVENT.partners.map((partner) => (
            <li key={partner.year} className="allies-row">
              <time dateTime={String(partner.year)} className="allies-year font-mono">
                {partner.year}
              </time>
              <ul
                className="allies-names"
                aria-label={text('Partners in {{year}}', { year: partner.year })}
              >
                {partner.names.map((name) => (
                  <li key={name} className="allies-chip font-display">
                    {name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div ref={side} className="allies-side split-main">
        <div className="allies-wall-block">
          <p className="label">
            {text('{{count}} companies since {{year}}', {
              count: COMPANIES.length,
              year: EVENT.partners[0].year,
            })}
          </p>
          <ul className="allies-wall" aria-label={text('All partners')}>
            {COMPANIES.map((name) => (
              <li key={name} className="allies-chip allies-wall-chip font-display">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="hud allies-pitch">
          <h3 className="h3 font-display">{text('Become an ally')}</h3>
          <p className="allies-pitch-text">
            {text('Put your name in front of the teams who compete. Partners get:')}
          </p>
          <ul className="allies-points">
            {EVENT.partnerPitch.map((point) => (
              <li key={point}>{text(point)}</li>
            ))}
          </ul>
          <a
            href={`mailto:${EVENT.contacts.email}?subject=${encodeURIComponent(text('{{name}} {{year}} partnership', { name: EVENT.name, year: YEAR }))}`}
            className="btn allies-cta"
          >
            {text('Write to ACM@NU')}
          </a>
          <p className="label allies-address">{EVENT.contacts.email}</p>
        </div>
      </div>
    </section>
  );
}
