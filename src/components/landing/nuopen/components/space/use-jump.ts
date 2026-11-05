import type Lenis from 'lenis';
import { useLenis } from 'lenis/react';
import type { MouseEvent } from 'react';

import { prefersReducedMotion } from '../motion/gsap';

const GLIDE_S = 1.4;
// Lenis's default exponential curve stops abruptly; this one starts and lands softly.
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const linear = (t: number) => t;

let latest = 0;

function arrive(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
  target.focus({ preventScroll: true });
}

/** A section with `data-roll-s` plays itself: the page scrolls through it at one steady speed until any scroll takes over. */
function roll(lenis: Lenis, target: HTMLElement) {
  const seconds = Number(target.dataset.rollS);
  if (seconds > 0)
    lenis.scrollTo(target, {
      offset: target.offsetHeight - innerHeight,
      duration: seconds,
      easing: linear,
      force: true,
    });
}

/** Click handler for in-page links: Lenis glides to the section, then keyboard focus lands in it. */
export function useJump() {
  const lenis = useLenis();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const hash = event.currentTarget.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (!target || !lenis) return;
    event.preventDefault();
    history.replaceState(null, '', hash);
    const id = ++latest;
    if (prefersReducedMotion()) {
      lenis.scrollTo(target, { immediate: true, force: true });
      arrive(target);
      return;
    }
    lenis.scrollTo(target, {
      duration: GLIDE_S,
      easing: easeInOutCubic,
      force: true,
      onComplete: () => {
        if (id !== latest) return;
        arrive(target);
        roll(lenis, target);
      },
    });
  };
}
