import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { useEffect, useRef } from 'react';

import { INTRO_DONE, INTRO_KEY, INTRO_TITLE } from '@/components/landing/nuopen/lib/intro';
import { sideStore } from '@/components/landing/nuopen/lib/side';

import { gsap } from '../motion/gsap';
import { useSide } from '../ui/use-side';

/**
 * "A long time ago…", then the title recedes into place. Shown when the head script marked a first visit.
 * With the music on it waits for a click first: browsers allow sound only after one, and the score starts with the title.
 */
export function Intro() {
  const text = useLandingText();
  const overlay = useRef<HTMLDivElement>(null);
  const withSound = useSide((s) => s.music);

  useEffect(() => {
    const html = document.documentElement;
    const root = overlay.current;
    if (html.dataset.intro !== '1' || !root) return;
    html.toggleAttribute('data-intro-live', true);
    const page = document.querySelectorAll('main, [data-site-header]');
    page.forEach((el) => el.toggleAttribute('inert', true));
    const finish = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        // Blocked storage: the intro simply plays again next time.
      }
      unlisten();
      page.forEach((el) => el.removeAttribute('inert'));
      delete html.dataset.intro;
      html.removeAttribute('data-intro-live');
      gsap.set('[data-hero-title], [data-hero-rest], [data-site-header]', {
        clearProps: 'opacity,transform',
      });
      dispatchEvent(new Event(INTRO_DONE));
    };

    const line = root.querySelector('.intro-line');
    const gate = sideStore.get().music ? root.querySelector('.intro-begin') : null;
    const reveal = gsap
      .timeline({ paused: true, onComplete: finish })
      .to([line, gate], { autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' })
      .set(root, { autoAlpha: 0 })
      .call(() => void dispatchEvent(new Event(INTRO_TITLE)), undefined, '+=0.25')
      .fromTo(
        '[data-hero-title]',
        { opacity: 1, scale: 3.4 },
        { scale: 1, duration: 2.8, ease: 'power3.out' },
        '<',
      )
      .fromTo(
        '[data-hero-rest]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' },
        '-=1.3',
      )
      .fromTo(
        '[data-site-header]',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power1.out' },
        '<0.3',
      );
    const opening = gsap
      .timeline()
      .fromTo(line, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power1.inOut' });
    if (gate) opening.to(gate, { autoAlpha: 1, duration: 0.6 });
    else opening.call(start, undefined, '+=1.7');

    let started = false;
    function start() {
      if (started) return;
      started = true;
      opening.kill();
      reveal.play();
    }
    function skip() {
      started = true;
      opening.kill();
      reveal.progress(1);
    }
    const advance = () => (started ? skip() : start());
    function keys(e: KeyboardEvent) {
      if (e.key === 'Escape') skip();
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    }
    function unlisten() {
      removeEventListener('pointerdown', advance);
      removeEventListener('keydown', keys);
      removeEventListener('wheel', skip);
    }
    addEventListener('pointerdown', advance);
    addEventListener('keydown', keys);
    addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      opening.kill();
      reveal.kill();
      unlisten();
      page.forEach((el) => el.removeAttribute('inert'));
      html.removeAttribute('data-intro-live');
    };
  }, []);

  return (
    <div ref={overlay} className="intro">
      <div>
        <p className="intro-line" aria-hidden>
          {text('A long time ago in a galaxy far,')}
          <br />
          {text('far away….')}
        </p>
        {withSound && (
          <p className="intro-begin label">
            <span className="intro-click">{text('Click anywhere to begin')}</span>
            <span className="intro-tap">{text('Tap anywhere to begin')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
