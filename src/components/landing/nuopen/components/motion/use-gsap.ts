import { useLayoutEffect, type RefObject } from 'react';

import { gsap, prefersReducedMotion } from './gsap';

/** Runs GSAP setup scoped to an element and reverts every tween and trigger on cleanup. */
export function useGsap(
  setup: (ctx: { reduced: boolean }) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const reduced = prefersReducedMotion();
    let extra: void | (() => void);
    const ctx = gsap.context(() => {
      extra = setup({ reduced });
    }, scope.current);
    return () => {
      extra?.();
      ctx.revert();
    };
    // oxlint-disable-next-line react/exhaustive-deps -- set up once per mount
  }, []);
}
