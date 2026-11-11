import './crawl.css';

import { useRef } from 'react';

import { EVENT } from '@/components/landing/nuopen/content/event';

import { gsap } from '../motion/gsap';
import { useGsap } from '../motion/use-gsap';

// A New Hope's crawl rolls for well over a minute, about a line every 2.5 s.
const CRAWL_S = 75;
/** Entry and exit offsets along the tilted plane, in viewport heights. */
const ENTER = 0.38;
const EXIT = 0.62;

/** The opening crawl, scrubbed by scroll: what NU Open is, told the way every episode starts. */
export function Crawl() {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced }) => {
    if (reduced) return;
    gsap.fromTo(
      '.crawl-text',
      { y: () => -innerHeight * ENTER },
      {
        y: (_: number, text: HTMLElement) => -(text.offsetHeight + innerHeight * EXIT),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    );
  }, root);

  return (
    <section
      ref={root}
      id="crawl"
      aria-labelledby="crawl-title"
      className="crawl"
      data-roll-s={CRAWL_S}
    >
      <div className="crawl-viewport">
        <div className="crawl-plane">
          <div className="crawl-text">
            <p className="crawl-episode">{`Episode ${EVENT.episode}`}</p>
            <h2 id="crawl-title" className="crawl-title">
              {EVENT.subtitle}
            </h2>
            {EVENT.crawl.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
