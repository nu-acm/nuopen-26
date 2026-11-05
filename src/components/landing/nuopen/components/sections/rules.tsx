import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import './rules.css';

import { useEffect, useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';
import { pad2 } from '@/components/landing/nuopen/lib/countdown';
import type { Side } from '@/components/landing/nuopen/lib/side';

import { gsap } from '../motion/gsap';
import { reveal } from '../motion/reveal';
import { useGsap } from '../motion/use-gsap';
import { type BustLook, bustActor } from '../three/bust';
import { useStage } from '../three/use-stage';
import { useSide } from '../ui/use-side';

const PUNCHLINE = EVENT.rules.length - 1;

const HEAD: Record<Side, { title: string; aside: string }> = {
  dark: {
    title: 'The Imperial code',
    aside: 'Break them and the jury will find your lack of faith disturbing.',
  },
  light: {
    title: 'The Jedi code',
    aside: 'Break them and the Council will not grant you the rank of Master.',
  },
};

export function Rules() {
  const text = useLandingText();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const look = useRef<BustLook>({ progress: 0, pointerX: 0, pointerY: 0 });
  const head = HEAD[useSide((s) => s.side)];

  useStage(stage, (ctx) => bustActor(ctx, look.current), 30);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      look.current.pointerX = (event.clientX / innerWidth) * 2 - 1;
      look.current.pointerY = (event.clientY / innerHeight) * 2 - 1;
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);

  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.to(look.current, {
      progress: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    reveal('.rules-head > *', '.rules-head');
    reveal('.rule', '.rules-list');
  }, root);

  return (
    <section ref={root} id="rules" aria-labelledby="rules-title" className="rules section split">
      <div ref={stage} aria-hidden className="rules-stage split-main" />

      <div className="rules-copy split-copy">
        <div className="rules-head">
          <p className="kicker">{text('Rules of engagement')}</p>
          <h2 id="rules-title" className="h2 font-display">
            {text(head.title)}
          </h2>
          <p className="rules-aside">{text(head.aside)}</p>
        </div>

        <ol className="rules-list">
          {EVENT.rules.map((rule, i) => (
            <li key={text(rule.title)} className={i === PUNCHLINE ? 'rule rule-punch hud' : 'rule'}>
              <span className="rule-num font-mono">{pad2(i + 1)}</span>
              <div>
                <h3 className="rule-title h3 font-display">{text(rule.title)}</h3>
                <p className="rule-text">{text(rule.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
