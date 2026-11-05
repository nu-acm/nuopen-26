import {
  useLandingText,
  type LandingText,
} from '@/components/landing/nuopen/content/use-landing-text';
import './briefing.css';

import { useRef, type ReactNode } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { contestWindow } from '@/components/landing/nuopen/lib/contest-window';
import { pad2 } from '@/components/landing/nuopen/lib/countdown';

import { gsap } from '../motion/gsap';
import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';
import { briefingDeathStarActor, type Progress } from '../three/deathstar-briefing';
import { useStage } from '../three/use-stage';

const { contest, venue, team } = EVENT;
const timing = contestWindow(contest.start, contest.end);

type Fact = { label: string; value: string; detail: string; action?: ReactNode };

function briefingFacts(text: LandingText): Fact[] {
  return [
    { label: text('Date'), value: text(contest.dateLabel), detail: text(contest.weekday) },
    {
      label: text('Time'),
      value: timing.range,
      detail: text('{{zone}} · {{hours}} hours', { zone: text(timing.zone), hours: contest.hours }),
    },
    {
      label: text('Base'),
      value: venue.name,
      detail: `${text(venue.address)}, ${text(venue.city)}`,
      action: (
        <a
          href={venue.mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="briefing-map font-mono"
        >
          {text('Open in maps')}
          <svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
          </svg>
        </a>
      ),
    },
    {
      label: text('Crew'),
      value: text('{{min}}–{{max}} per team', { min: team.min, max: team.max }),
      detail: text('Age {{age}}+, solo or in a team', { age: team.minAge }),
    },
    {
      label: text('Format'),
      value: text('{{format}} on {{platform}}', {
        format: text(contest.format),
        platform: contest.platform,
      }),
      detail: text('Compete in person at Nazarbayev University'),
    },
    { label: text('Entry'), value: text('Free'), detail: text('No participation fee') },
  ];
}

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

function Reticle() {
  return (
    <svg
      className="briefing-reticle"
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle r="44" />
      {TICKS.map((deg) => (
        <line
          key={deg}
          transform={`rotate(${deg})`}
          x1="0"
          y1="-44"
          x2="0"
          y2={deg % 90 === 0 ? -48 : -46}
        />
      ))}
    </svg>
  );
}

function Row({ index, fact }: { index: number; fact: Fact }) {
  return (
    <div className="briefing-row">
      <dt className="label">
        {pad2(index)} · {fact.label}
      </dt>
      <dd>
        <span className="briefing-value">{fact.value}</span>
        <span className="briefing-detail">{fact.detail}</span>
        {fact.action}
      </dd>
    </div>
  );
}

export function Briefing() {
  const text = useLandingText();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDListElement>(null);
  const progress = useRef<Progress>({ scroll: 0 });

  useStage(stage, (ctx) => briefingDeathStarActor(ctx, progress.current), 28);

  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.to(progress.current, {
      scroll: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const trigger = readout.current;
    if (trigger)
      reveal('.briefing-row', trigger, { y: 0, duration: 0.4, stagger: 0.12, ease: 'steps(4)' });
  }, root);

  return (
    <section ref={root} id="briefing" aria-labelledby="briefing-title" className="section">
      <div className="briefing-grid split">
        <header className="briefing-head split-main">
          <p className="kicker">{text('Mission briefing')}</p>
          <h2 id="briefing-title" className="h2 mt-6 font-display">
            {text('The target.')}
          </h2>
          <p className="lead mt-6">
            {text(
              'Five hours, one problem set, and everything you need to plan the day. Read it once, then bring your squadron.',
            )}
          </p>
        </header>
        <div className="briefing-target split-copy">
          <div className="briefing-frame">
            <div ref={stage} aria-hidden className="briefing-stage hud" />
            <Reticle />
          </div>
          <p className="label briefing-caption">{text('Target acquired')}</p>
        </div>
        <dl ref={readout} className="briefing-readout hud split-main">
          {briefingFacts(text).map((fact, i) => (
            <Row key={fact.label} index={i + 1} fact={fact} />
          ))}
        </dl>
      </div>
    </section>
  );
}
