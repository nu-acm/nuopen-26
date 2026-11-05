import { useRef } from 'react';
import { useStage } from './use-stage';
import { destroyerActor, type Flight } from './destroyer';
import { briefingDeathStarActor, type Progress } from './deathstar-briefing';
import { tieActor, type Approach } from './tie';
import { gsap } from './gsap';
import { useGsap } from './use-gsap';

export function HeroScene() {
  const stage = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight>({ scroll: 0, ready: 1 });
  useStage(stage, (ctx) => destroyerActor(ctx, flight.current), 42);
  useGsap(({ reduced }) => {
    if (reduced) return;
    const root = stage.current?.closest('.landing-hero');
    if (!root) return;
    const trigger = { trigger: root, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(flight.current, { scroll: 1, ease: 'none', scrollTrigger: trigger });
    gsap.to(root.querySelector('.hero-copy'), {
      yPercent: -12,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { ...trigger, end: '70% top' },
    });
  }, stage);
  return <div ref={stage} className="hero-stage scene-host" aria-hidden="true" />;
}

export function BriefingScene() {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<Progress>({ scroll: 0 });
  useStage(stage, (ctx) => briefingDeathStarActor(ctx, progress.current), 28);
  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.to(progress.current, {
      scroll: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stage.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, stage);
  return <div ref={stage} className="briefing-stage scene-host reference-hud" aria-hidden="true" />;
}

export function ClosingScene() {
  const stage = useRef<HTMLDivElement>(null);
  const approach = useRef<Approach>({ progress: 0 });
  useStage(stage, (ctx) => tieActor(ctx, approach.current), 30);
  useGsap(({ reduced }) => {
    if (reduced) return;
    const root = stage.current?.closest('#join');
    if (!root) return;
    gsap.to(approach.current, {
      progress: 1,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'center center', scrub: true },
    });
    gsap.fromTo(
      root.querySelector('.trench-floor'),
      { '--advance': 0 },
      {
        '--advance': 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  }, stage);
  return <div ref={stage} className="trench-stage scene-host" aria-hidden="true" />;
}
