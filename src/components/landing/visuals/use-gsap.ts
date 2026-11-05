import { useLayoutEffect, type RefObject } from 'react';

import { gsap } from './gsap';

/** Runs GSAP setup scoped to an element and reverts every tween and trigger on cleanup. */
export function useGsap(
  setup: (ctx: { reduced: boolean }) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let extra: void | (() => void);
    let ctx: gsap.Context;
    const start = () => {
      ctx = gsap.context(() => {
        extra = setup({ reduced: motion.matches });
      }, el);
    };
    const stop = () => {
      extra?.();
      extra = undefined;
      ctx.revert();
    };
    const update = () => {
      stop();
      start();
    };
    start();
    motion.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      stop();
    };
    // oxlint-disable-next-line react/exhaustive-deps -- set up once per mount
  }, []);
}
