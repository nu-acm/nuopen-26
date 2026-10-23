"use client";

import "./side-choice.css";

import { type CSSProperties, useEffect, useRef } from "react";

import { type Side, sideStore } from "@/lib/side";

import { gsap } from "../motion/gsap";
import { reveal } from "../motion/reveal";
import { useGsap } from "../motion/use-gsap";
import { type Hilt, saberActor } from "../three/saber";
import { useStage } from "../three/use-stage";
import { useSide } from "../ui/use-side";

// Not --saber: every card previews its own blade whichever side is on.
const BLADE: Record<Side, { colour: string; glow: string }> = {
  dark: { colour: "var(--blade-dark)", glow: "var(--blade-dark-glow)" },
  light: { colour: "var(--blade-light)", glow: "var(--blade-light-glow)" },
};

type Option = { side: Side; title: string; blade: string; music: string };

const DARK: Option = { side: "dark", title: "Dark side", blade: "Red", music: "The Imperial March" };
const LIGHT: Option = { side: "light", title: "Light side", blade: "Blue", music: "The Main Theme" };

const readSaberColour = () => getComputedStyle(document.documentElement).getPropertyValue("--saber").trim();

function SideCard({ option, chosen }: { option: Option; chosen: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={() => sideStore.choose(option.side)}
      style={{ "--blade": BLADE[option.side].colour, "--blade-glow": BLADE[option.side].glow } as CSSProperties}
      className="side-option hud side-reveal"
    >
      <span aria-hidden className="side-bar" />
      <span className="side-option-title font-display">{option.title}</span>
      <span className="side-facts">
        <span className="side-fact">
          <span className="label">Blade</span>
          <span>{option.blade}</span>
        </span>
        <span className="side-fact">
          <span className="label">Soundtrack</span>
          <span>{option.music}</span>
        </span>
      </span>
    </button>
  );
}

export function SideChoice() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hilt = useRef<Hilt>({ color: "", turn: 0 });
  const side = useSide((s) => s.side);

  useStage(stage, (ctx) => saberActor(ctx, hilt.current));

  useEffect(() => {
    hilt.current.color = readSaberColour();
  }, [side]);

  useGsap(
    ({ reduced }) => {
      const el = root.current;
      if (reduced || !el) return;
      reveal(".side-reveal", el);
      gsap.to(hilt.current, {
        turn: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    root,
  );

  return (
    <section ref={root} id="side" aria-labelledby="side-title" className="side-choice relative isolate overflow-hidden">
      <div className="side-copy">
        <p className="kicker side-reveal">Choose your side</p>
        <h2 id="side-title" className="h2-xl font-display side-title side-reveal">
          Every pilot picks a side
        </h2>
        <p className="lead side-reveal">
          Your side sets the blade colour and the soundtrack. The problems are the same either way.
        </p>
      </div>

      <div className="side-row">
        <SideCard option={DARK} chosen={side === DARK.side} />
        <div className="side-band">
          <div ref={stage} aria-hidden className="side-stage" />
        </div>
        <SideCard option={LIGHT} chosen={side === LIGHT.side} />
      </div>
    </section>
  );
}
