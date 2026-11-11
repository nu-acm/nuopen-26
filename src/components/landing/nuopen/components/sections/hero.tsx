import { RegistrationLink } from '../ui/registration-link';

import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { gsap } from '../motion/gsap';
import { useGsap } from '../motion/use-gsap';
import { Countdown } from '../ui/countdown';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.to('.hero-copy', {
      yPercent: -12,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
    });
  }, root);

  return (
    <section ref={root} id="top" className="hero relative isolate flex flex-col overflow-hidden">
      <div aria-hidden className="hero-vignette pointer-events-none absolute inset-0 -z-10" />

      <div className="hero-copy mx-auto flex w-full nu-max-w-1400px flex-col items-center nu-px-var-gutter text-center">
        <p data-hero-rest className="hero-episode font-mono">
          {`${EVENT.organizerShort} presents · Episode ${EVENT.episode}`}
        </p>
        <h1 data-hero-title className="hero-title font-logo outline-crawl">
          {EVENT.name}
        </h1>
        <p data-hero-rest className="hero-sub font-display">
          {EVENT.subtitle}
        </p>
        <p data-hero-rest className="lead mt-5 nu-max-w-40rem">
          {`The ${EVENT.edition}th annual ICPC-style programming contest by ${EVENT.organizerShort}.`}
        </p>
        <div data-hero-rest className="mt-8 flex justify-center">
          <RegistrationLink className="btn">Register your team</RegistrationLink>
        </div>
      </div>

      <div data-hero-rest className="hero-strip mx-auto w-full nu-max-w-1400px">
        <dl className="grid grid-cols-1 border-t border-line sm:nu-grid-cols-1fr-1fr lg:nu-grid-cols-1fr-1-2fr-1-4fr">
          <div className="hero-cell">
            <dt className="label">Date</dt>
            <dd>
              {EVENT.contest.dateLabel}{' '}
              <span className="text-ink-3">· {EVENT.contest.weekday}</span>
            </dd>
          </div>
          <div className="hero-cell">
            <dt className="label">Base</dt>
            <dd>
              {EVENT.venue.name},{' '}
              <span className="text-ink-3">{EVENT.venue.city.split(',')[0]}</span>
            </dd>
          </div>
          <div className="hero-cell sm:col-span-2 lg:col-span-1">
            <dt className="label">Contest starts in</dt>
            <dd>
              <Countdown target={EVENT.contest.start} end={EVENT.contest.end} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
