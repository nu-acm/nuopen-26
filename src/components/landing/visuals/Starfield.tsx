import { useEffect, useRef } from 'react';

import { createStars, project, speedOf, type Star } from './star-math';

const TINTS = ['#ffffff', '#d6e9ff', '#fff1dc'];
const TINT_PATTERN = [0, 0, 0, 1, 2];
const WARP_TINT = '#cfeeff';
const STREAK = { width: 0.55, maxWidth: 1.6, tail: 0.35, head: 0.4 };
const ALPHA_LEVELS = 4;
const REST_FRAME_MS = 30;

const alphaOf = (star: Star) => Math.min(1, 0.25 + (1 - star.z) * 0.9);
const levelOf = (alpha: number) => Math.round(((alpha - 0.25) / 0.75) * (ALPHA_LEVELS - 1));
const levelAlpha = (level: number) => 0.25 + (level / (ALPHA_LEVELS - 1)) * 0.75;

function respawn(star: Star) {
  star.z = 1;
  star.x = Math.random() * 2 - 1;
  star.y = Math.random() * 2 - 1;
}

/** The sky behind the whole page: drifts at rest and streaks only with the hyperspace section's warp level. */
export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motion.matches;
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

    // One fill per tint and brightness instead of one per star: the resting sky is drawn on every frame.
    const drawPoints = () => {
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
    };

    const drawStreaks = (streak: number, warp: number) => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const head = project(s, w, h);
        if (offscreen(head)) continue;
        const alpha = alphaOf(s);
        const tail = project({ ...s, z: Math.min(1.4, s.z * (1 + streak * 6)) }, w, h);
        ctx.strokeStyle = warp > 0.3 ? WARP_TINT : TINTS[tints[i]];
        ctx.lineWidth = Math.min(STREAK.maxWidth, Math.max(0.5, head.r * STREAK.width));
        // Film streaks are motion blur: a faint trail toward the vanishing point and a bright head.
        ctx.globalAlpha = alpha * STREAK.tail;
        ctx.beginPath();
        ctx.moveTo(tail.sx, tail.sy);
        ctx.lineTo(head.sx, head.sy);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(
          head.sx + (tail.sx - head.sx) * STREAK.head,
          head.sy + (tail.sy - head.sy) * STREAK.head,
        );
        ctx.lineTo(head.sx, head.sy);
        ctx.stroke();
      }
    };

    const draw = (streak: number, warp: number) => {
      ctx.clearRect(0, 0, w, h);
      if (streak > 0.004) drawStreaks(streak, warp);
      else drawPoints();
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = phone ? 1 : Math.min(devicePixelRatio, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0, 0);
    };
    let frame = 0;
    let last = -Infinity;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const warp = 0;
      // The resting drift is slow enough that 30 frames a second look the same and halve the work.
      if (warp === 0 && now - last < REST_FRAME_MS) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = speedOf(warp);
      for (const s of stars) {
        s.z -= speed * dt;
        if (s.z <= 0.02) respawn(s);
      }
      draw(warp * 0.9, warp);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      reduced = motion.matches;
      last = -Infinity;
      if (document.visibilityState === 'hidden') return;
      draw(0, 0);
      if (!reduced) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="site-starfield" />;
}
