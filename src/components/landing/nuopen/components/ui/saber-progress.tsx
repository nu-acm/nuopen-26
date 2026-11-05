import { useEffect, useRef } from 'react';

/** Reading progress drawn as a lightsaber blade along the top edge. */
export function SaberProgress() {
  const blade = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const remaining = document.documentElement.scrollHeight - innerHeight;
      const progress = remaining > 0 ? Math.min(1, Math.max(0, scrollY / remaining)) : 1;
      if (blade.current) blade.current.style.setProperty('--progress', String(progress));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 nu-z-70 nu-h-3px">
      <div
        ref={blade}
        data-saber-progress
        className="nu-saber-progress nu-h-2px w-full origin-left rounded-r-full nu-bg-var-core"
      />
    </div>
  );
}
