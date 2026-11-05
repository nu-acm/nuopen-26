import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { useEffect, useState } from 'react';
import { sideStore } from '@/components/landing/nuopen/lib/side';
import { TRACKS } from './soundtrack';
import { useSide } from './use-side';

function useTrackFound() {
  const side = useSide((s) => s.side);
  const [found, setFound] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(TRACKS[side], { method: 'HEAD' })
      .then((r) => live && setFound(r.ok))
      .catch(() => live && setFound(false));
    return () => {
      live = false;
    };
  }, [side]);
  return found;
}

export function SoundToggle() {
  const text = useLandingText();
  const on = useSide((s) => s.music);
  const found = useTrackFound();
  const label = text(on ? 'Mute the music' : 'Play the music');
  if (!found) return null;
  return (
    <button
      type="button"
      onClick={() => sideStore.toggleMusic()}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-sm text-ink-2 transition-colors hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden
      >
        {on ? <path d="M3 12h2m2-4v8m4-11v14m4-10v6m4-8v10" /> : <path d="M3 12h18" />}
      </svg>
    </button>
  );
}
