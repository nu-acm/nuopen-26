"use client";

import "./briefing.css";

import { useRef, type ReactNode } from "react";

import { EVENT } from "@/content/event";
import { contestWindow } from "@/lib/contest-window";
import { pad2 } from "@/lib/countdown";

import { gsap } from "../motion/gsap";
import { reveal } from "../motion/reveal";
import { useGsap } from "../motion/use-gsap";
import { briefingDeathStarActor, type Progress } from "../three/deathstar-briefing";
import { useStage } from "../three/use-stage";

const { contest, venue, team } = EVENT;
const timing = contestWindow(contest.start, contest.end);

type Fact = { label: string; value: string; detail: string; action?: ReactNode };

const FACTS: Fact[] = [
  { label: "Date", value: contest.dateLabel, detail: contest.weekday },
  { label: "Time", value: timing.range, detail: `${timing.zone} · ${contest.hours} hours` },
  {
    label: "Base",
    value: venue.name,
    detail: `${venue.address}, ${venue.city}`,
    action: (
      <a href={venue.mapHref} target="_blank" rel="noopener noreferrer" className="briefing-map font-mono">
        Open in maps
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
        </svg>
      </a>
    ),
  },
  { label: "Crew", value: `${team.min}–${team.max} per team`, detail: `Age ${team.minAge}+, solo or in a team` },
  {
    label: "Format",
    value: `${contest.format} on ${contest.platform}`,
    detail: "Campus and online teams get the same problems",
  },
  { label: "Entry", value: "Free", detail: "No fee, on campus or online" },
];

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

function Reticle() {
  return (
    <svg className="briefing-reticle" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      <circle r="44" />
      {TICKS.map((deg) => (
        <line key={deg} transform={`rotate(${deg})`} x1="0" y1="-44" x2="0" y2={deg % 90 === 0 ? -48 : -46} />
      ))}
    </svg>
  );
}

function Row({ index, fact }: { index: number; fact: Fact }) {
  return (
    <div className="briefing-row">
      <dt className="label">
        {pad2(index)} · {fact.label}
      </dt>
      <dd>
        <span className="briefing-value">{fact.value}</span>
        <span className="briefing-detail">{fact.detail}</span>
        {fact.action}
      </dd>
    </div>
  );
}

export function Briefing() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDListElement>(null);
  const progress = useRef<Progress>({ scroll: 0 });

  useStage(stage, (ctx) => briefingDeathStarActor(ctx, progress.current), 28);

  useGsap(
    ({ reduced }) => {
      if (reduced) return;
      gsap.to(progress.current, {
        scroll: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      const trigger = readout.current;
      if (trigger) reveal(".briefing-row", trigger, { y: 0, duration: 0.4, stagger: 0.12, ease: "steps(4)" });
    },
    root,
  );

  return (
    <section ref={root} id="briefing" aria-labelledby="briefing-title" className="section">
      <div className="briefing-grid split">
        <header className="briefing-head split-main">
          <p className="kicker">Mission briefing</p>
          <h2 id="briefing-title" className="font-display h2 mt-6">
            The target.
          </h2>
          <p className="lead mt-6">Five hours, one problem set, and everything you need to plan the day. Read it once, then bring your squadron.</p>
        </header>
        <div className="briefing-target split-copy">
          <div className="briefing-frame">
            <div ref={stage} aria-hidden className="briefing-stage hud" />
            <Reticle />
          </div>
          <p className="label briefing-caption">Target acquired</p>
        </div>
        <dl ref={readout} className="briefing-readout hud split-main">
          {FACTS.map((fact, i) => (
            <Row key={fact.label} index={i + 1} fact={fact} />
          ))}
        </dl>
      </div>
    </section>
  );
}
