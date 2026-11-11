import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthHeader } from '@/components/AuthHeader';
import { Starfield } from '@/components/landing/visuals/Starfield';
import { AccountAtmosphere } from '@/components/landing/visuals/AccountAtmosphere';
import { TELEGRAM_CHAT_URL } from '@/lib/event';

export function AccountShell({
  children,
  accountTab,
}: {
  children: ReactNode;
  accountTab?: 'team' | 'personal';
}) {
  return (
    <div className="account-page">
      <Starfield />
      <AccountAtmosphere />
      <AuthHeader />
      {accountTab && (
        <div className="account-nav-wrap">
          <nav className="account-nav" aria-label="Your account">
            <Link
              className="site-nav-link"
              to="/dashboard"
              aria-current={accountTab === 'team' ? 'page' : undefined}
            >
              <span>01</span>
              My team
            </Link>
            <Link
              className="site-nav-link"
              to="/onboarding"
              aria-current={accountTab === 'personal' ? 'page' : undefined}
            >
              <span>02</span>
              Personal data
            </Link>
          </nav>
        </div>
      )}
      {children}
      <footer className="account-footer">
        <p className="account-footer-brand">NU Open · Episode VII</p>
        <nav aria-label="Legal">
          <Link to="/faq">FAQ</Link>
          <a href={TELEGRAM_CHAT_URL} target="_blank" rel="noopener noreferrer">
            Contact us
          </a>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </div>
  );
}
