import { lazy, Suspense } from 'react';

const HeroScene = lazy(() =>
  import('./visuals/scenes').then((module) => ({ default: module.HeroScene })),
);
const BriefingScene = lazy(() =>
  import('./visuals/scenes').then((module) => ({ default: module.BriefingScene })),
);
const ClosingScene = lazy(() =>
  import('./visuals/scenes').then((module) => ({ default: module.ClosingScene })),
);

/** Reference visuals are isolated from WHD data and loaded only on corresponding surfaces. */
export default function Scene({ variant }: { variant: 'hero' | 'briefing' | 'closing' }) {
  return (
    <Suspense fallback={null}>
      {variant === 'hero' ? (
        <HeroScene />
      ) : variant === 'briefing' ? (
        <BriefingScene />
      ) : (
        <ClosingScene />
      )}
    </Suspense>
  );
}
