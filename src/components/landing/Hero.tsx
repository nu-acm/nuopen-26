import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { NEXT_STEP_ROUTE, type NextStep } from '@/lib/next-step';
import Countdown from '@/components/landing/Countdown';
import Scene from '@/components/landing/Scene';
import type { RegistrationStatus } from '@/lib/registration';

type Cta = { to: (typeof NEXT_STEP_ROUTE)[NextStep]; label: string } | null;

/**
 * After the deadline nobody can sign up, but people who did register still
 * need a way back to their team. A visitor without a profile has nowhere to go.
 */
function closedCta(nextStep: NextStep, t: (key: string) => string): Cta {
  if (nextStep === 'register') return { to: '/login', label: t('hero.cta.signIn') };
  if (nextStep === 'onboarding') return null;
  return { to: '/dashboard', label: t('hero.cta.ready') };
}

export default function Hero({
  nextStep,
  registration,
}: {
  nextStep: NextStep;
  registration: RegistrationStatus;
}) {
  const { t } = useTranslation();
  // Flips without a reload when the countdown reaches zero on an open page.
  const [isClosed, setIsClosed] = useState(!registration.open);

  const cta: Cta = isClosed
    ? closedCta(nextStep, t)
    : { to: NEXT_STEP_ROUTE[nextStep], label: t(`hero.cta.${nextStep}`) };

  return (
    <section id="top" className="landing-hero">
      <Scene variant="hero" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-episode">
          {t('about.editionOrdinal')} {t('about.annualEdition')} · 2026
        </p>
        <h1 className="hero-title" aria-label={t('hero.title')}>
          <span>Women’s</span>
          <span>Hack Day</span>
        </h1>
        <p className="hero-sub">
          {t('infoCards.whenAnswer')} · {t('infoCards.whereAnswer')}
        </p>
        <p className="landing-copy">{t('hero.tagline')}</p>
        {cta && (
          <div className="hero-action">
            <Link to={cta.to} preload={false} className="landing-cta hero-spy-cta">
              <span className="hero-cta-label">{cta.label}</span>
              <span className="hero-cta-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        )}
      </div>
      <div className="hero-strip">
        {!isClosed && registration.deadline ? (
          <Countdown deadline={registration.deadline} onElapsed={() => setIsClosed(true)} />
        ) : (
          <p className="hero-registration-status">
            {isClosed ? t('countdown.ended') : t('hero.registrationOpen')}
          </p>
        )}
      </div>
    </section>
  );
}
