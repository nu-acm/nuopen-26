import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { EVENT } from '@/components/landing/nuopen/content/event';
import { MIN_TEAM_SIZE, MAX_TEAM_SIZE, isEligibleTeamSize } from '@/lib/event';
import type { TeamData } from '@/lib/team.server';

export function DashboardStats({ team, email }: { team: TeamData | null; email: string }) {
  const ready = !!team && isEligibleTeamSize(team.members.length);
  // Settled when the team gets its number; until then every team looks online.
  const contest = team?.contest ?? null;
  return (
    <Card variant="dashboard-checklist">
      <CardContent variant="dashboard-checklist">
        <p className="account-eyebrow">Flight readiness</p>
        <h2>Your checklist</h2>
        <ol className="readiness-list">
          <li>
            <span>01</span>
            <div>
              Email verified
              <small>{email}</small>
            </div>
            <b aria-label="Complete">✓</b>
          </li>
          <li>
            <span>02</span>
            <div>
              Profile complete
              <small>
                <Link to="/onboarding">Edit details ↗</Link>
              </small>
            </div>
            <b aria-label="Complete">✓</b>
          </li>
          <li data-ready={ready}>
            <span>03</span>
            <div>
              {team ? 'Team registered' : 'Assemble your team'}
              <small>
                {team
                  ? ready
                    ? `${team.members.length} of ${MAX_TEAM_SIZE}`
                    : `Eligible teams have ${MIN_TEAM_SIZE} to ${MAX_TEAM_SIZE} members.`
                  : 'You are not in a team yet'}
              </small>
            </div>
            {ready ? <b aria-label="Complete">✓</b> : <b>Pending</b>}
          </li>
          <li data-ready={!!contest}>
            <span>04</span>
            <div>
              {contest
                ? contest.offline
                  ? 'Competing offline'
                  : 'Competing online'
                : 'Offline or online'}
              <small>
                {contest
                  ? contest.offline
                    ? `Table ${contest.tableNumber} at ${EVENT.venue.name}`
                    : 'From anywhere, on Codeforces'
                  : 'Organisers confirm this after registration closes.'}
              </small>
            </div>
            {contest ? <b aria-label="Complete">✓</b> : <b>Pending</b>}
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
