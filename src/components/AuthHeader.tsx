import { Link } from '@tanstack/react-router';
import { SideToggle } from '@/components/landing/nuopen/components/ui/side-toggle';
import { SoundToggle } from '@/components/landing/nuopen/components/ui/sound-toggle';

export function AuthHeader() {
  return (
    <header className="auth-header nuopen-landing">
      <div className="auth-header-inner">
        <Link to="/" className="account-brand" aria-label="NU Open home">
          <span className="site-brand-wordmark">NU Open</span>
          <span className="site-brand-edition">VII</span>
        </Link>
        <div className="auth-header-actions">
          <div className="account-header-tools">
            <SideToggle />
            <SoundToggle />
          </div>
          <div className="account-header-secondary">
            <Link
              to="/"
              className="account-back site-nav-link site-nav-action"
              aria-label="Back to landing page"
            >
              <span aria-hidden="true">←</span> Back to the story
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
