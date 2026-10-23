"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger } from "./gsap";

function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

/** Lenis driven by the GSAP ticker, so ScrollTrigger reads the smoothed position (portfolio SmoothScroll). */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<LenisRef>(null);

  useEffect(() => {
    // Same tree on server and client (useId depends on it); reduced motion only switches smoothing off.
    const reduced = prefersReducedMotion();
    // The ref is empty on the first frames; reading it lazily keeps Lenis driven.
    const update = (time: number) => {
      const instance = lenis.current?.lenis;
      if (!instance) return;
      if (reduced) instance.options.smoothWheel = false;
      instance.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    let cancelled = false;
    // Fonts land after triggers measure; without a refresh pins engage with a jump.
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    let pending = 0;
    // Accordions and late rows change the page height; scrubbed triggers would fire at stale offsets.
    const resized = new ResizeObserver(() => {
      clearTimeout(pending);
      pending = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    resized.observe(document.body);
    return () => {
      cancelled = true;
      clearTimeout(pending);
      resized.disconnect();
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return (
    <ReactLenis root ref={lenis} options={{ autoRaf: false, lerp: 0.12, smoothWheel: true, syncTouch: false }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
