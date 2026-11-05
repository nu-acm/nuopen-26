import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { EVENT } from '@/components/landing/nuopen/content/event';
import { CalendarDays, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MissionArt } from '@/components/login/MissionArt';

export function LoginVisual() {
  const { t } = useTranslation();
  const text = useLandingText();
  return (
    <aside className="login-visual" aria-label="NU Open 2026">
      <div className="login-visual-copy">
        <p className="account-eyebrow">01 / {t('login.title')}</p>
        <h2>{t('login.welcome')}</h2>
        <span>{t('login.welcomeHint')}</span>
      </div>
      <MissionArt />
      <ol className="registration-steps">
        <li>
          <span>01</span>
          {t('login.title')}
        </li>
        <li>
          <span>02</span>
          {t('onboarding.title')}
        </li>
        <li>
          <span>03</span>
          {t('dashboard.newTeamTitle')} / {t('dashboard.joinTeam')}
        </li>
      </ol>
      <div className="login-event">
        <span>
          <CalendarDays aria-hidden="true" />
          {text(EVENT.contest.dateLabel)}
        </span>
        <span>
          <MapPin aria-hidden="true" />
          {EVENT.venue.name}
        </span>
      </div>
    </aside>
  );
}
