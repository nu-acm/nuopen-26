import { useEffect } from 'react';

import { type Side, sideStore } from '@/components/landing/nuopen/lib/side';

import { FIGURES } from './bust';
import { DEATH_STAR_MODEL } from './deathstar';
import { DESTROYER_MODEL } from './destroyer';
import { SABER_MODEL } from './saber';
import { TIE_MODEL } from './tie';

/** Must match the breakpoint in trench.css below which the TIE fighter is hidden. */
const TIE_SHOWN = '(min-width: 900px)';

/**
 * The models below the hero in scroll order; the hero's own ship is preloaded with the page.
 * The other side's figure goes last: first visits start light, and many visitors then pick dark.
 */
export function modelsAhead(side: Side, wide: boolean): string[] {
  const other: Side = side === 'light' ? 'dark' : 'light';
  return [
    SABER_MODEL,
    DEATH_STAR_MODEL,
    FIGURES[side].url,
    ...(wide ? [TIE_MODEL] : []),
    FIGURES[other].url,
  ];
}

/** Fills the HTTP cache one file at a time, so the next section's model arrives first. */
export async function prefetchInOrder(urls: string[], get: typeof fetch = fetch) {
  for (const url of urls) {
    try {
      await (await get(url, { credentials: 'same-origin' })).arrayBuffer();
    } catch (error) {
      console.warn('Model prefetch failed', url, error);
    }
  }
}

/** Once the hero's ship has downloaded, fetches every model ahead so sections show theirs the moment they scroll in. */
export function usePrefetchModels() {
  useEffect(() => {
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
      return;
    const watch = new PerformanceObserver((list) => {
      if (!list.getEntries().some((entry) => entry.name.endsWith(DESTROYER_MODEL))) return;
      watch.disconnect();
      void prefetchInOrder(modelsAhead(sideStore.get().side, matchMedia(TIE_SHOWN).matches));
    });
    watch.observe({ type: 'resource', buffered: true });
    return () => watch.disconnect();
  }, []);
}
