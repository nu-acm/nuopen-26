import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { RegistrationLink } from '../ui/registration-link';

import { useEffect, useRef } from 'react';
import { preload } from 'react-dom';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { INTRO_DONE } from '@/components/landing/nuopen/lib/intro';

import { gsap } from '../motion/gsap';
import { useGsap } from '../motion/use-gsap';
import { useJump } from '../space/use-jump';
import { DESTROYER_MODEL, destroyerActor, type Flight } from '../three/destroyer';
import { useStage } from '../three/use-stage';
import { Countdown } from '../ui/countdown';

export function Hero() {
  const text = useLandingText();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight>({ scroll: 0, ready: 0 });
  const jump = useJump();
  preload(DESTROYER_MODEL, { as: 'fetch', crossOrigin: 'anonymous' });

  useStage(stage, (ctx) => destroyerActor(ctx, flight.current), 42);

  useEffect(() => {
    const ready = () => void (flight.current.ready = 1);
    if (document.documentElement.dataset.intro !== '1') return ready();
    addEventListener(INTRO_DONE, ready, { once: true });
    return () => removeEventListener(INTRO_DONE, ready);
  }, []);

  useGsap(({ reduced }) => {
    if (reduced) return;
    const trigger = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(flight.current, { scroll: 1, ease: 'none', scrollTrigger: trigger });
    gsap.to('.hero-copy', {
      yPercent: -12,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { ...trigger, end: '70% top' },
    });
  }, root);

  return (
    <section ref={root} id="top" className="hero relative isolate flex flex-col overflow-hidden">
      <div ref={stage} aria-hidden className="hero-stage absolute inset-x-0 -z-10" />
      <div aria-hidden className="hero-vignette pointer-events-none absolute inset-0 -z-10" />

      <div className="hero-copy mx-auto flex w-full nu-max-w-1400px flex-col items-center nu-px-var-gutter text-center">
        <p data-hero-rest className="hero-episode font-mono">
          {text('{{organizer}} presents · Episode {{episode}}', {
            organizer: EVENT.organizerShort,
            episode: EVENT.episode,
          })}
        </p>
        <h1 data-hero-title className="hero-title font-logo outline-crawl">
          {EVENT.name}
        </h1>
        <p data-hero-rest className="hero-sub font-display">
          {text(EVENT.subtitle)}
        </p>
        <p data-hero-rest className="lead mt-5 nu-max-w-40rem">
          {text('The {{edition}}th annual ICPC-style programming contest by {{organizer}}.', {
            edition: EVENT.edition,
            organizer: EVENT.organizerShort,
          })}{' '}
          {text(EVENT.tagline)}
        </p>
        <div data-hero-rest className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <RegistrationLink className="btn">{text('Register your team')}</RegistrationLink>
          <a href="#crawl" onClick={jump} className="btn-ghost">
            {text('Read the crawl')}
          </a>
        </div>
      </div>

      <div data-hero-rest className="hero-strip mx-auto w-full nu-max-w-1400px">
        <dl className="grid grid-cols-1 border-t border-line sm:nu-grid-cols-1fr-1fr lg:nu-grid-cols-1fr-1-2fr-1-4fr">
          <div className="hero-cell">
            <dt className="label">{text('Date')}</dt>
            <dd>
              {text(EVENT.contest.dateLabel)}{' '}
              <span className="text-ink-3">· {text(EVENT.contest.weekday)}</span>
            </dd>
          </div>
          <div className="hero-cell">
            <dt className="label">{text('Base')}</dt>
            <dd>
              {EVENT.venue.name},{' '}
              <span className="text-ink-3">{text(EVENT.venue.city).split(',')[0]}</span>
            </dd>
          </div>
          <div className="hero-cell sm:col-span-2 lg:col-span-1">
            <dt className="label">{text('Contest starts in')}</dt>
            <dd>
              <Countdown target={EVENT.contest.start} end={EVENT.contest.end} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
