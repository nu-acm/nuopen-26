import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const text = useLandingText();
  return (
    <div className="account-page">
      <Starfield />
      <AccountAtmosphere />
      <AuthHeader />
      {accountTab && (
        <div className="account-nav-wrap">
          <nav className="account-nav" aria-label={t('account.navigation')}>
            <Link
              className="site-nav-link"
              to="/dashboard"
              aria-current={accountTab === 'team' ? 'page' : undefined}
            >
              <span>01</span>
              {t('account.teamTab')}
            </Link>
            <Link
              className="site-nav-link"
              to="/onboarding"
              aria-current={accountTab === 'personal' ? 'page' : undefined}
            >
              <span>02</span>
              {t('account.personalTab')}
            </Link>
          </nav>
        </div>
      )}
      {children}
      <footer className="account-footer">
        <p className="account-footer-brand">
          NU Open · {text('Episode {{episode}}', { episode: 'VII' })}
        </p>
        <nav aria-label={t('footer.documents')}>
          <Link to="/faq">{t('navbar.faq')}</Link>
          <a href={TELEGRAM_CHAT_URL} target="_blank" rel="noopener noreferrer">
            {t('faq.contactUs')}
          </a>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
        </nav>
      </footer>
    </div>
  );
}
