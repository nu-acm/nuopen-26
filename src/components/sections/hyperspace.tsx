"use client";

import "./hyperspace.css";

import { useRef } from "react";

import { transitFrame } from "@/lib/transit";
import { warpDrive } from "@/lib/warp";

import { ScrollTrigger } from "../motion/gsap";
import { useGsap } from "../motion/use-gsap";
import { jumpActor, type Transit } from "../three/jump";
import { useStage } from "../three/use-stage";

/** The flight to lightspeed between two chapters: scrolling through it is the charge, the jump and the tunnel. */
export function Hyperspace() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const transit = useRef<Transit>({ progress: 0 });

  useStage(stage, (ctx) => jumpActor(ctx, transit.current), 24);

  useGsap(
    ({ reduced }) => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          transit.current.progress = self.progress;
          const frame = transitFrame(self.progress);
          warpDrive.setLevel(frame.warp);
          if (flash.current) flash.current.style.opacity = String(frame.flash);
        },
      });
      return () => warpDrive.setLevel(0);
    },
    root,
  );

  return (
    <div ref={root} aria-hidden className="hyper">
      <div className="hyper-stick">
        <div ref={stage} className="absolute inset-0" />
        <div ref={flash} className="hyper-flash" />
      </div>
    </div>
  );
}
