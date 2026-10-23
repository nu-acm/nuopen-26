"use client";

import "./hero.css";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";

import { EVENT } from "@/content/event";
import { INTRO_DONE } from "@/lib/intro";

import { gsap } from "../motion/gsap";
import { useGsap } from "../motion/use-gsap";
import { useJump } from "../space/use-jump";
import { DESTROYER_MODEL, destroyerActor, type Flight } from "../three/destroyer";
import { useStage } from "../three/use-stage";
import { Countdown } from "../ui/countdown";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight>({ scroll: 0, ready: 0 });
  const jump = useJump();
  preload(DESTROYER_MODEL, { as: "fetch", crossOrigin: "anonymous" });

  useStage(stage, (ctx) => destroyerActor(ctx, flight.current), 42);

  useEffect(() => {
    const ready = () => void (flight.current.ready = 1);
    if (document.documentElement.dataset.intro !== "1") return ready();
    addEventListener(INTRO_DONE, ready, { once: true });
    return () => removeEventListener(INTRO_DONE, ready);
  }, []);

  useGsap(
    ({ reduced }) => {
      if (reduced) return;
      const trigger = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(flight.current, { scroll: 1, ease: "none", scrollTrigger: trigger });
      gsap.to(".hero-copy", { yPercent: -12, opacity: 0, ease: "none", scrollTrigger: { ...trigger, end: "70% top" } });
    },
    root,
  );

  return (
    <section ref={root} id="top" className="hero relative isolate flex flex-col overflow-hidden">
      <div ref={stage} aria-hidden className="hero-stage absolute inset-x-0 -z-10" />
      <div aria-hidden className="hero-vignette pointer-events-none absolute inset-0 -z-10" />

      <div className="hero-copy mx-auto flex w-full max-w-[1400px] flex-col items-center px-[var(--gutter)] text-center">
        <p data-hero-rest className="hero-episode font-mono">
          {EVENT.organizerShort} presents · Episode {EVENT.episode}
        </p>
        <h1 data-hero-title className="hero-title font-logo outline-crawl">
          {EVENT.name}
        </h1>
        <p data-hero-rest className="hero-sub font-display">
          {EVENT.subtitle}
        </p>
        <p data-hero-rest className="lead mt-5 max-w-[40rem]">
          The {EVENT.edition}th annual ICPC-style programming contest by {EVENT.organizerShort}. {EVENT.tagline}
        </p>
        <div data-hero-rest className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={EVENT.registerHref} className="btn">
            Register your team
          </a>
          <a href="#crawl" onClick={jump} className="btn-ghost">
            Read the crawl
          </a>
        </div>
      </div>

      <div data-hero-rest className="hero-strip mx-auto w-full max-w-[1400px]">
        <dl className="grid grid-cols-1 border-t border-line sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1.2fr_1.4fr]">
          <div className="hero-cell">
            <dt className="label">Date</dt>
            <dd>
              {EVENT.contest.dateLabel} <span className="text-ink-3">· {EVENT.contest.weekday}</span>
            </dd>
          </div>
          <div className="hero-cell">
            <dt className="label">Base</dt>
            <dd>
              {EVENT.venue.name}, <span className="text-ink-3">{EVENT.venue.city.split(",")[0]}</span>
            </dd>
          </div>
          <div className="hero-cell sm:col-span-2 lg:col-span-1">
            <dt className="label">Contest starts in</dt>
            <dd>
              <Countdown target={EVENT.contest.start} end={EVENT.contest.end} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
