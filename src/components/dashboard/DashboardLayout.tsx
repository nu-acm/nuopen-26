import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
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
  const firstName = fullName.trim().split(/\s+/)[0] || 'Pilot';
  return (
    <main className="dashboard-main">
      <section className="dashboard-welcome" aria-labelledby="dashboard-title">
        <div className="dashboard-welcome-copy">
          <p className="account-eyebrow">03 / Mission control</p>
          <h1 id="dashboard-title">
            Welcome aboard,
            <br />
            <PilotName key={firstName} name={firstName} />
          </h1>
          <p className="account-dashboard-lead">
            {team
              ? 'Your squadron is registered. Keep your crew ready for contest day.'
              : 'Your clearance is complete. Assemble a squadron to register for the contest.'}
          </p>
        </div>
        <div className="dashboard-event">
          <span>
            {`Episode ${EVENT.episode}`} / {EVENT.contest.format}
          </span>
          <strong>{EVENT.contest.dateLabel}</strong>
          <span>{EVENT.venue.name}</span>
        </div>
      </section>
      {feedback}
      <div className="dashboard-columns">
        <div className="dashboard-team-column">{children}</div>
        <aside className="dashboard-sidebar">
          <DashboardStats team={team} email={email} />
          <section className="dashboard-brief">
            <p className="account-eyebrow">Mission parameters</p>
            <h2>Stay on target.</h2>
            <p>
              {`Teams of ${MIN_TEAM_SIZE} to ${MAX_TEAM_SIZE} have ${EVENT.contest.hours} hours to solve the problem set.`}
            </p>
            <p>
              {`All team members must attend in person at ${EVENT.venue.name}, ${EVENT.venue.city}.`}
            </p>
            <Link to="/" hash="rules" className="account-text-button">
              Review the contest rules ↗
            </Link>
          </section>
          {sidebar}
        </aside>
      </div>
    </main>
  );
}
