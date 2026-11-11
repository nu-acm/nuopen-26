import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PilotName } from '@/components/dashboard/PilotName';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EVENT } from '@/components/landing/nuopen/content/event';
import { MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '@/lib/event';
import type { TeamData } from '@/lib/team.server';

export function DashboardLayout({
  fullName,
  email,
  team,
  feedback,
  children,
  sidebar,
}: {
  fullName: string;
  email: string;
  team: TeamData | null;
  feedback?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
}) {
  const { t } = useTranslation();
  const text = useLandingText();
  const firstName = fullName.trim().split(/\s+/)[0] || t('account.pilot');
  return (
    <main className="dashboard-main">
      <section className="dashboard-welcome" aria-labelledby="dashboard-title">
        <div className="dashboard-welcome-copy">
          <p className="account-eyebrow">03 / {t('account.missionControl')}</p>
          <h1 id="dashboard-title">
            {t('account.welcomeAboard')}
            <br />
            <PilotName key={firstName} name={firstName} />
          </h1>
          <p className="account-dashboard-lead">
            {t(team ? 'account.teamIntro' : 'account.teamlessIntro')}
          </p>
        </div>
        <div className="dashboard-event">
          <span>
            {text('Episode {{episode}}', { episode: EVENT.episode })} / {text(EVENT.contest.format)}
          </span>
          <strong>{text(EVENT.contest.dateLabel)}</strong>
          <span>{EVENT.venue.name}</span>
        </div>
      </section>
      {feedback}
      <div className="dashboard-columns">
        <div className="dashboard-team-column">{children}</div>
        <aside className="dashboard-sidebar">
          <DashboardStats team={team} email={email} />
          <section className="dashboard-brief">
            <p className="account-eyebrow">{t('account.missionParameters')}</p>
            <h2>{t('account.stayOnTarget')}</h2>
            <p>
              {t('account.missionCopy', {
                min: MIN_TEAM_SIZE,
                max: MAX_TEAM_SIZE,
                hours: EVENT.contest.hours,
              })}
            </p>
            <p>
              {t('account.venueCopy', { venue: EVENT.venue.name, city: text(EVENT.venue.city) })}
            </p>
            <Link to="/" hash="rules" className="account-text-button">
              {t('account.reviewRules')} ↗
            </Link>
          </section>
          {sidebar}
        </aside>
      </div>
    </main>
  );
}
