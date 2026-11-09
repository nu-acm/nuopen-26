import { useEffect, useRef } from 'react';

const SEGMENTS = 32;
const LIFETIME = 180;
const SLOTS = Array.from({ length: SEGMENTS }, (_, index) => index);
type Point = { x: number; y: number; time: number };

export function SaberTrail() {
  const trail = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const element = trail.current;
    if (!element) return;
    const paths = Array.from(element.querySelectorAll('path'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    let points: Point[] = [];
    let frame = 0;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      points = [];
      for (const path of paths) path.removeAttribute('d');
    };

    const draw = (now: number) => {
      frame = 0;
      points = points.filter((point) => now - point.time < LIFETIME);
      paths.forEach((path, index) => {
        const from = points[index];
        const to = points[index + 1];
        if (!from || !to) {
          path.removeAttribute('d');
          return;
        }
        const life = Math.max(0, 1 - (now - from.time) / LIFETIME);
        path.setAttribute('d', `M${from.x},${from.y}L${to.x},${to.y}`);
        path.setAttribute('opacity', String(life * life));
        path.setAttribute('stroke-width', String(0.5 + life * 1.7));
      });
      if (points.length > 0) frame = requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || motion.matches || !mouse.matches || document.hidden)
        return;
      const now = performance.now();
      const previous = points.at(-1);
      if (previous && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 1)
        return;
      // A pause starts a new stroke, rather than bridging to an expired position.
      if (previous && now - previous.time >= LIFETIME) points = [];
      points.push({ x: event.clientX, y: event.clientY, time: now });
      if (points.length > SEGMENTS + 1) points.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) clear();
    };
    motion.addEventListener('change', clear);
    mouse.addEventListener('change', clear);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', leave);
    document.addEventListener('visibilitychange', clear);
    addEventListener('blur', clear);
    addEventListener('resize', clear);
    return () => {
      clear();
      motion.removeEventListener('change', clear);
      mouse.removeEventListener('change', clear);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('visibilitychange', clear);
      removeEventListener('blur', clear);
      removeEventListener('resize', clear);
    };
  }, []);

  return (
    <svg ref={trail} className="nu-saber-trail" aria-hidden="true" focusable="false">
      {SLOTS.map((slot) => (
        <path key={slot} />
      ))}
    </svg>
  );
}
