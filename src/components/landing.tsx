"use client";

import { SmoothScroll } from "./motion/smooth-scroll";
import { Allies } from "./sections/allies";
import { Reward } from "./sections/bounty";
import { Briefing } from "./sections/briefing";
import { Crawl } from "./sections/crawl";
import { Faq } from "./sections/faq";
import { Footer } from "./sections/footer";
import { Hero } from "./sections/hero";
import { Hyperspace } from "./sections/hyperspace";
import { Intro } from "./sections/intro";
import { PreviousEpisodes } from "./sections/record";
import { Rules } from "./sections/rules";
import { FlightPlan } from "./sections/schedule";
import { SideChoice } from "./sections/side-choice";
import { Trench } from "./sections/trench";
import { Starfield } from "./space/starfield";
import { usePrefetchModels } from "./three/prefetch";
import { Header } from "./ui/header";
import { SaberProgress } from "./ui/saber-progress";
import { Soundtrack } from "./ui/soundtrack";
import { SideSync } from "./ui/use-side";

export function Landing() {
  usePrefetchModels();
  return (
    <SmoothScroll>
      <SideSync />
      <Starfield />
      <SaberProgress />
      <a href="#main" className="sr-only-focusable btn btn-sm fixed left-[var(--gutter)] top-3 z-[90]">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Crawl />
        <SideChoice />
        <Hyperspace />
        <Briefing />
        <PreviousEpisodes />
        <Reward />
        <FlightPlan />
        <Rules />
        <Allies />
        <Faq />
        <Trench />
      </main>
      <Footer />
      <Intro />
      <Soundtrack />
    </SmoothScroll>
  );
}
