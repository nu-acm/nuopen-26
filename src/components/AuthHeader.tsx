import { useLandingText } from '@/components/landing/nuopen/content/use-landing-text';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SideToggle } from '@/components/landing/nuopen/components/ui/side-toggle';
import { SoundToggle } from '@/components/landing/nuopen/components/ui/sound-toggle';

export function AuthHeader() {
  const { t } = useTranslation();
  const text = useLandingText();
  return (
    <header className="auth-header nuopen-landing">
      <div className="auth-header-inner">
        <Link
          to="/"
          className="account-brand"
          aria-label={text('{{name}} home', { name: 'NU Open' })}
        >
          <span className="site-brand-wordmark">NU Open</span>
          <span className="site-brand-edition">VII</span>
        </Link>
        <div className="auth-header-actions">
          <div className="account-header-tools">
            <SideToggle />
            <SoundToggle />
          </div>
          <div className="account-header-secondary">
            <LanguageSwitcher />
            <Link
              to="/"
              className="account-back site-nav-link site-nav-action"
              aria-label={t('account.backToLanding')}
            >
              <span aria-hidden="true">←</span> {t('account.backToStory')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
