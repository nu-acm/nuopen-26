import { useEffect, useRef, type CSSProperties } from 'react';
import { useRouterState } from '@tanstack/react-router';
import {
  crossesAccountBoundary,
  JUMP_DURATION,
  NAVIGATION_JUMP,
} from '@/components/landing/nuopen/lib/navigation-jump';

// Fixed geometry: no random hydration differences, model downloads, canvas, or frame loop.
const STREAKS = Array.from(
  { length: 64 },
  (_, i) =>
    ({
      '--angle': `${i * 137.508}deg`,
      '--distance': `${3 + ((i * 17) % 38)}vmax`,
      '--length': `${10 + ((i * 13) % 35)}vmax`,
      opacity: 0.3 + (i % 4) * 0.13,
    }) as CSSProperties,
);

export function NavigationJump() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const previous = useRef(path);
  const prepared = useRef<string | null>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const stars = useRef<HTMLDivElement>(null);
  const play = useRef<() => void>(() => {});

  useEffect(() => {
    const root = overlay.current;
    const field = stars.current;
    if (!root || !field) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let animations: Animation[] = [];
    const stop = () => {
      animations.forEach((animation) => {
        animation.onfinish = null;
        animation.cancel();
      });
      animations = [];
      root.hidden = true;
      delete root.dataset.active;
    };
    play.current = () => {
      stop();
      if (motion.matches || !root.animate) return;
      root.hidden = false;
      root.dataset.active = 'true';
      const veil = root.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0.94, offset: 0.16 },
          { opacity: 0.92, offset: 0.5 },
          { opacity: 0, offset: 1 },
        ],
        { duration: JUMP_DURATION, easing: 'linear' },
      );
      const streaks = field.animate(
        [
          { transform: 'scale(1)', opacity: 0 },
          { transform: 'scale(1.45)', opacity: 1, offset: 0.25 },
          { transform: 'scale(2.6)', opacity: 0 },
        ],
        { duration: JUMP_DURATION, easing: 'cubic-bezier(.3,0,.55,1)' },
      );
      animations = [veil, streaks];
      veil.onfinish = stop;
    };
    const begin = (event: Event) => {
      prepared.current = (event as CustomEvent<string>).detail;
      play.current();
    };
    const changed = () => {
      if (motion.matches) stop();
    };
    addEventListener(NAVIGATION_JUMP, begin);
    motion.addEventListener('change', changed);
    return () => {
      removeEventListener(NAVIGATION_JUMP, begin);
      motion.removeEventListener('change', changed);
      play.current = () => {};
      stop();
    };
  }, []);

  useEffect(() => {
    if (previous.current === path) return;
    if (crossesAccountBoundary(previous.current, path) && !prepared.current) play.current();
    previous.current = path;
    prepared.current = null;
  }, [path]);

  return (
    <div ref={overlay} className="navigation-jump" data-navigation-jump hidden aria-hidden="true">
      <div ref={stars} className="navigation-jump-stars">
        {STREAKS.map((style, index) => (
          <i
            key={index}
            style={
              {
                '--angle': style['--angle' as keyof CSSProperties],
                '--distance': style['--distance' as keyof CSSProperties],
                '--length': style['--length' as keyof CSSProperties],
                '--streak-opacity': style.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
