import { useEffect, useRef } from 'react';

import {
  createStars,
  DRIFT_SPEED,
  project,
  type Star,
} from '@/components/landing/nuopen/lib/starfield';

import { prefersReducedMotion } from '../motion/gsap';

const TINTS = ['#ffffff', '#d6e9ff', '#fff1dc'];
const TINT_PATTERN = [0, 0, 0, 1, 2];
const ALPHA_LEVELS = 4;
const FRAME_INTERVAL_MS = 30;

const alphaOf = (star: Star) => Math.min(1, 0.25 + (1 - star.z) * 0.9);
const levelOf = (alpha: number) => Math.round(((alpha - 0.25) / 0.75) * (ALPHA_LEVELS - 1));
const levelAlpha = (level: number) => 0.25 + (level / (ALPHA_LEVELS - 1)) * 0.75;

function respawn(star: Star) {
  star.z = 1;
  star.x = Math.random() * 2 - 1;
  star.y = Math.random() * 2 - 1;
}

/** The starfield behind the landing page. */
export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const reduced = prefersReducedMotion();
    const phone = Math.min(innerWidth, innerHeight) < 600;
    const stars = createStars(innerWidth < 700 ? 420 : 900);
    const tints = stars.map((_, i) => TINT_PATTERN[i % TINT_PATTERN.length]);
    const buckets: number[][] = Array.from({ length: TINTS.length * ALPHA_LEVELS }, () => []);
    const px = new Float32Array(stars.length);
    const py = new Float32Array(stars.length);
    const pr = new Float32Array(stars.length);
    let w = 0;
    let h = 0;

    const offscreen = (p: { sx: number; sy: number }) =>
      p.sx < -20 || p.sx > w + 20 || p.sy < -20 || p.sy > h + 20;

    // One fill per tint and brightness instead of one per star.
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const bucket of buckets) bucket.length = 0;
      for (let i = 0; i < stars.length; i++) {
        const head = project(stars[i], w, h);
        if (offscreen(head)) continue;
        px[i] = head.sx;
        py[i] = head.sy;
        pr[i] = head.r * 0.7;
        buckets[tints[i] * ALPHA_LEVELS + levelOf(alphaOf(stars[i]))].push(i);
      }
      buckets.forEach((bucket, b) => {
        if (bucket.length === 0) return;
        ctx.globalAlpha = levelAlpha(b % ALPHA_LEVELS);
        ctx.fillStyle = TINTS[Math.floor(b / ALPHA_LEVELS)];
        ctx.beginPath();
        for (const i of bucket) {
          ctx.moveTo(px[i] + pr[i], py[i]);
          ctx.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
        }
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = phone ? 1 : Math.min(devicePixelRatio, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    if (reduced) return () => observer.disconnect();

    let frame = 0;
    let last = -Infinity;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - last < FRAME_INTERVAL_MS) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const s of stars) {
        s.z -= DRIFT_SPEED * dt;
        if (s.z <= 0.02) respawn(s);
      }
      draw();
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="nu-starfield pointer-events-none fixed inset-x-0 top-0 h-lvh w-full"
    />
  );
}
