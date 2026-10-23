"use client";

import { type Side, sideStore } from "@/lib/side";

import { useSide } from "./use-side";

const SEGMENTS: { side: Side; label: string }[] = [
  { side: "dark", label: "Dark" },
  { side: "light", label: "Light" },
];

const SEGMENT = "flex h-full min-w-[4.5rem] flex-1 items-center justify-center border px-4 font-mono text-[0.75rem] font-bold uppercase tracking-[0.14em] transition-[color,background-color,box-shadow,border-color] duration-300";
const IDLE = "border-line text-ink-3 hover:text-ink";
const LIT = "relative z-[1] border-[var(--saber)] bg-[var(--saber-soft)] text-ink shadow-[inset_0_0_0_1px_var(--saber),0_0_14px_var(--saber-glow)]";

/** Dark | Light switch; the chosen segment glows in the page's --saber. */
export function SideToggle() {
  const side = useSide((s) => s.side);
  return (
    <div role="group" aria-label="Side" className="flex h-11">
      {SEGMENTS.map((segment, index) => {
        const pressed = side === segment.side;
        return (
          <button
            key={segment.side}
            type="button"
            aria-label={`${segment.label} side`}
            aria-pressed={pressed}
            onClick={() => sideStore.choose(segment.side)}
            className={`${SEGMENT} ${index > 0 ? "-ml-px" : ""} ${pressed ? LIT : IDLE}`}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
