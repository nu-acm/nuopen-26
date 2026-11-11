import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { MIN_TEAM_SIZE, MAX_TEAM_SIZE, isEligibleTeamSize } from '@/lib/event';
import type { TeamData } from '@/lib/team.server';

export function DashboardStats({ team, email }: { team: TeamData | null; email: string }) {
  const { t } = useTranslation();
  const ready = !!team && isEligibleTeamSize(team.members.length);
  return (
    <Card variant="dashboard-checklist">
      <CardContent variant="dashboard-checklist">
        <p className="account-eyebrow">{t('account.flightReadiness')}</p>
        <h2>{t('account.yourChecklist')}</h2>
        <ol className="readiness-list">
          <li>
            <span>01</span>
            <div>
              {t('account.emailVerified')}
              <small>{email}</small>
            </div>
            <b aria-label={t('account.complete')}>✓</b>
          </li>
          <li>
            <span>02</span>
            <div>
              {t('account.profileComplete')}
              <small>
                <Link to="/onboarding">{t('dashboard.editProfile')} ↗</Link>
              </small>
            </div>
            <b aria-label={t('account.complete')}>✓</b>
          </li>
          <li data-ready={ready}>
            <span>03</span>
            <div>
              {t(team ? 'account.teamRegistered' : 'account.assembleTeam')}
              <small>
                {team
                  ? ready
                    ? t('dashboard.membersCount', {
                        count: team.members.length,
                        max: MAX_TEAM_SIZE,
                      })
                    : t('dashboard.teamIncomplete', { min: MIN_TEAM_SIZE, max: MAX_TEAM_SIZE })
                  : t('dashboard.noTeam')}
              </small>
            </div>
            <b aria-label={t(ready ? 'account.complete' : 'account.pending')}>
              {ready ? '✓' : '—'}
            </b>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
