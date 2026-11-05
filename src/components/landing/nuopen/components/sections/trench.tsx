import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { RegistrationLink } from '../ui/registration-link';

import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { gsap } from '../motion/gsap';
import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';
import { type Approach, tieActor } from '../three/tie';
import { useStage } from '../three/use-stage';
import { Countdown } from '../ui/countdown';

export function Trench() {
  const text = useLandingText();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const approach = useRef<Approach>({ progress: 0 });

  useStage(stage, (ctx) => tieActor(ctx, approach.current), 30);

  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.to(approach.current, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: root.current,
        start: 'top bottom',
        end: 'center center',
        scrub: true,
      },
    });
    gsap.fromTo(
      '.trench-floor',
      { '--advance': 0 },
      {
        '--advance': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
    reveal('.trench-copy > *', '.trench-copy');
  }, root);

  return (
    <section ref={root} id="register" aria-labelledby="register-title" className="trench">
      <div ref={stage} aria-hidden className="trench-stage" />
      <div aria-hidden className="trench-floor" />

      <div className="section trench-inner">
        <div className="trench-copy">
          <p className="kicker">{text('Stay on target')}</p>
          <h2 id="register-title" className="h2-xl font-display">
            {text('Join the')} <span className="trench-battle">{text('battle')}</span>
          </h2>
          <p className="lead mt-5">
            {text(EVENT.contest.dateLabel)} · {EVENT.venue.name}, {text(EVENT.venue.city)}
          </p>

          <div className="trench-count">
            <p className="label">{text('Contest starts in')}</p>
            <Countdown
              target={EVENT.contest.start}
              end={EVENT.contest.end}
              className="mt-3 flex-wrap"
            />
          </div>

          <div className="trench-actions">
            <RegistrationLink className="btn trench-cta">
              {text('Register your team')}
            </RegistrationLink>
            <a href={`mailto:${EVENT.contacts.email}`} className="btn-ghost">
              {text('Ask us anything')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
