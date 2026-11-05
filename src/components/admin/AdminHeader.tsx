import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import type { AdminHeaderControls } from '@/lib/admin-header-context';

const navLinkClass = 'admin-nav-link';

/** Header shared by /admin and /checkin: navigation, refresh, sign out. */
export function AdminHeader({
  onSignOut,
  onRefresh,
  isRefreshing,
  refreshCooldownSeconds = 0,
}: AdminHeaderControls & { onSignOut: () => void }) {
  const { t } = useTranslation();

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <Link to="/" className="admin-brand" aria-label="NU Open">
          <span className="site-brand-wordmark">NU Open</span>
          <span className="site-brand-edition">VII</span>
        </Link>
        <div className="admin-header-actions">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || refreshCooldownSeconds > 0}
            >
              {isRefreshing
                ? t('admin.refreshing')
                : refreshCooldownSeconds > 0
                  ? t('admin.refreshIn', { seconds: refreshCooldownSeconds })
                  : t('admin.refresh')}
            </Button>
          )}
          <LanguageSwitcher />
          <ConfirmButton
            variant="ghost"
            label={t('common.signOut')}
            confirmLabel={t('common.confirm')}
            onConfirm={onSignOut}
            confirmationTone="accent"
          />
        </div>
      </div>
      <div className="admin-nav-wrap">
        <nav className="admin-nav">
          <Link to="/dashboard" className={navLinkClass}>
            {t('navbar.dashboard')}
          </Link>
          <Link
            to="/admin"
            className={navLinkClass}
            activeProps={{
              className: 'admin-nav-active',
            }}
          >
            {t('admin.navReport')}
          </Link>
          <Link
            to="/checkin"
            className={navLinkClass}
            activeProps={{
              className: 'admin-nav-active',
            }}
          >
            {t('admin.checkin')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
