import { EVENT } from '@/components/landing/nuopen/content/event';
import { CalendarDays, MapPin } from 'lucide-react';
import { MissionArt } from '@/components/login/MissionArt';

export function LoginVisual() {
  return (
    <aside className="login-visual" aria-label="NU Open 2026">
      <div className="login-visual-copy">
        <p className="account-eyebrow">01 / Sign in</p>
        <h2>Preparing for NU Open</h2>
        <span>Sign in to set up your profile and join a team.</span>
      </div>
      <MissionArt />
      <ol className="registration-steps">
        <li>
          <span>01</span>
          Sign in
        </li>
        <li>
          <span>02</span>
          Your details
        </li>
        <li>
          <span>03</span>
          Start a team / Join a team
        </li>
      </ol>
      <div className="login-event">
        <span>
          <CalendarDays aria-hidden="true" />
          {EVENT.contest.dateLabel}
        </span>
        <span>
          <MapPin aria-hidden="true" />
          {EVENT.venue.name}
        </span>
      </div>
    </aside>
  );
}
