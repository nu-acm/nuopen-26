import { useEffect } from 'react';
import { ScrollTrigger } from './motion/gsap';
import type { NextStep } from '@/lib/next-step';
import type { RegistrationStatus } from '@/lib/registration';

import { SmoothScroll } from './motion/smooth-scroll';
import { Allies } from './sections/allies';
import { Reward } from './sections/bounty';
import { Briefing } from './sections/briefing';
import { Crawl } from './sections/crawl';
import { Faq } from './sections/faq';
import { Footer } from './sections/footer';
import { Hero } from './sections/hero';
import { Intro } from './sections/intro';
import { PreviousEpisodes } from './sections/record';
import { Rules } from './sections/rules';
import { FlightPlan } from './sections/schedule';
import { Trench } from './sections/trench';
import { Starfield } from './space/starfield';
import { usePrefetchModels } from './three/prefetch';
import { Header } from './ui/header';
import { RegistrationProvider } from './ui/registration-link';

export function Landing({
  nextStep,
  registration,
}: {
  nextStep: NextStep;
  registration: RegistrationStatus;
}) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let current = true;
    void document.fonts.ready.then(() => {
      if (current) ScrollTrigger.refresh();
    });
    return () => {
      current = false;
    };
  }, []);
  usePrefetchModels();
  return (
    <RegistrationProvider nextStep={nextStep} registration={registration}>
      <div className="nuopen-landing nuopen-page">
        <SmoothScroll>
          <Starfield />
          <a
            href="#main"
            className="sr-only-focusable btn btn-sm fixed top-3 nu-left-var-gutter nu-z-90"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1}>
            <Hero />
            <Crawl />
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
        </SmoothScroll>
      </div>
    </RegistrationProvider>
  );
}
