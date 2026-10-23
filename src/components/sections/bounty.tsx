"use client";

import "./bounty.css";

import { type CSSProperties, useRef } from "react";

import { EVENT } from "@/content/event";

import { gsap } from "../motion/gsap";
import { reveal } from "../motion/reveal";
import { useGsap } from "../motion/use-gsap";

const DIGIT_COPIES = 3; // a reel holds three copies of 0-9 so it can spin past the digits before landing
const REEL_LENGTH = 10 * DIGIT_COPIES;
const LANDING_COPY = 2; // the reel lands on the last copy, after two full turns
const ROLL_SECONDS = 2.4;
const ROLL_STAGGER = 0.14;
const SCAN_AT = 1.6;

const DIGITS = Array.from({ length: REEL_LENGTH }, (_, i) => i % 10);
const CHARS = [...EVENT.prize.text];
const landingSpin = (digit: number) => ((LANDING_COPY * 10 + digit) * 100) / REEL_LENGTH;

function Reel({ digit }: { digit: number }) {
  return (
    <span className="reel">
      <span className="reel-strip" data-digit={digit} style={{ "--spin": landingSpin(digit) } as CSSProperties}>
        {DIGITS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </span>
    </span>
  );
}

/** The prize pool as an Imperial readout: each digit reel spins and locks in turn, then a scan line crosses it. */
export function Reward() {
  const root = useRef<HTMLElement>(null);

  useGsap(
    ({ reduced }) => {
      const section = root.current;
      if (reduced || !section) return;
      const amount = section.querySelector<HTMLElement>(".bounty-amount");
      const panel = section.querySelector<HTMLElement>(".bounty-panel");
      if (panel) reveal(".bounty-copy", panel);
      if (!amount) return;

      const reels = section.querySelectorAll<HTMLElement>(".reel-strip");
      gsap.set(reels, { "--spin": 0 });
      const roll = gsap.timeline({ scrollTrigger: { trigger: amount, start: "top 75%", once: true } });
      reels.forEach((reel, i) => {
        roll.to(reel, { "--spin": landingSpin(Number(reel.dataset.digit)), duration: ROLL_SECONDS, ease: "power3.out" }, i * ROLL_STAGGER);
      });
      roll.fromTo(".reel-scan", { top: "0%", opacity: 0.9 }, { top: "100%", opacity: 0, duration: 0.9, ease: "power1.inOut" }, SCAN_AT);
    },
    root,
  );

  return (
    <section ref={root} id="bounty" aria-labelledby="bounty-title" className="section bounty">
      <div className="bounty-panel hud">
        <p className="kicker bounty-copy">The reward</p>
        <h2 id="bounty-title" className="bounty-amount font-display">
          <span className="sr-only">Prize pool {EVENT.prize.text}</span>
          <span aria-hidden className="bounty-figures">
            {CHARS.map((ch, i) => {
              if (/\d/.test(ch)) return <Reel key={i} digit={Number(ch)} />;
              if (ch.trim() === "") return <span key={i}>{ch}</span>;
              // The display face has no tenge sign (U+20B8); the body face does.
              return (
                <span key={i} className="font-sans bounty-currency">
                  {ch}
                </span>
              );
            })}
          </span>
          <span aria-hidden className="reel-scan" />
        </h2>
        <p className="lead bounty-copy">{EVENT.prize.extra}</p>
        <p className="label bounty-copy">Prizes go to teams that register and compete on campus.</p>
        <a href={EVENT.registerHref} className="btn bounty-copy">
          Win it. Register your team
        </a>
      </div>
    </section>
  );
}
