"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";

/** Reading progress drawn as a lightsaber blade along the top edge. */
export function SaberProgress() {
  const blade = useRef<HTMLDivElement>(null);
  useLenis((lenis) => {
    if (blade.current) blade.current.style.transform = `scaleX(${lenis.progress || 0})`;
  });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div
        ref={blade}
        className="h-[2px] w-full origin-left rounded-r-full bg-[var(--core)]"
        style={{ transform: "scaleX(0)", boxShadow: "0 0 4px var(--saber), 0 0 12px var(--saber-glow), 0 0 28px var(--saber-glow)" }}
      />
    </div>
  );
}
