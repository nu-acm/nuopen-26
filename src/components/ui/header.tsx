"use client";

import { useEffect, useState } from "react";

import { EVENT } from "@/content/event";
import { sideStore } from "@/lib/side";

import { useJump } from "../space/use-jump";
import { SideToggle } from "./side-toggle";
import { TRACKS } from "./soundtrack";
import { useSide } from "./use-side";

export const NAV = [
  { id: "briefing", label: "Briefing" },
  { id: "schedule", label: "Schedule" },
  { id: "rules", label: "Rules" },
  { id: "faq", label: "FAQ" },
] as const;

function useTrackFound() {
  const side = useSide((s) => s.side);
  const [found, setFound] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(TRACKS[side], { method: "HEAD" })
      .then((r) => live && setFound(r.ok))
      .catch(() => live && setFound(false));
    return () => {
      live = false;
    };
  }, [side]);
  return found;
}

function SoundToggle() {
  const on = useSide((s) => s.music);
  const found = useTrackFound();
  const label = on ? "Mute the music" : "Play the music";
  if (!found) return null;
  return (
    <button
      type="button"
      onClick={() => sideStore.toggleMusic()}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-sm text-ink-2 transition-colors hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        {on ? (
          <path d="M3 12h2m2-4v8m4-11v14m4-10v6m4-8v10" />
        ) : (
          <path d="M3 12h18" />
        )}
      </svg>
    </button>
  );
}

/** The nav section crossing the middle of the screen; null between them. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const targets = NAV.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          setCurrent((prev) => (isIntersecting ? target.id : prev === target.id ? null : prev));
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    targets.forEach((t) => watcher.observe(t));
    return () => watcher.disconnect();
  }, []);
  return current;
}

export function Header() {
  const jump = useJump();
  const current = useCurrentSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    jump(e);
  };

  return (
    <header
      data-site-header
      className={`fixed inset-x-0 top-0 z-50 border-b ${
        open
          ? "border-line bg-space"
          : `transition-[background-color,border-color] duration-500 ${scrolled ? "border-line bg-[rgb(3_4_10/0.96)]" : "border-transparent"}`
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1240px] items-center gap-4 px-[var(--gutter)]">
        <a href="#top" onClick={go} className="flex items-baseline gap-2 whitespace-nowrap" aria-label={`${EVENT.name} home`}>
          <span className="header-logo font-logo text-[1.05rem] tracking-[0.02em] text-ink">NU Open</span>
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-[var(--saber)]">{EVENT.episode}</span>
        </a>

        <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={go}
              aria-current={current === item.id ? "location" : undefined}
              className="relative rounded-sm px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-2 transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:bg-[var(--core)] after:opacity-0 after:shadow-[0_0_6px_var(--saber)] after:transition-opacity hover:text-ink aria-[current=location]:text-ink aria-[current=location]:after:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <SideToggle />
          </div>
          <SoundToggle />
          <a href={EVENT.registerHref} className="btn btn-sm ml-1">
            Register
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center text-ink lg:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        data-open={open}
        inert={!open}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[400ms] ease-[var(--ease-out)] motion-reduce:transition-none data-[open=true]:grid-rows-[1fr] lg:hidden"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-h-[calc(100svh-var(--header-h))] overflow-y-auto overscroll-contain border-t border-line bg-space px-[var(--gutter)] pb-6 pt-2">
            <nav aria-label="Sections menu" className="flex flex-col">
              {NAV.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={go} className="border-b border-line py-4 font-display text-[1.5rem] text-ink">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4">
              <SideToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
