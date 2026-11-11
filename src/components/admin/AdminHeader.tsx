import { Link } from '@tanstack/react-router';
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
  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <Link to="/" className="admin-brand" aria-label="NU Open">
          <span className="site-brand-wordmark">NU Open</span>
          <span className="site-brand-edition">VII</span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          <Link to="/dashboard" className={navLinkClass}>
            Dashboard
          </Link>
          <Link
            to="/admin"
            className={navLinkClass}
            activeProps={{ className: 'admin-nav-active', 'aria-current': 'page' }}
          >
            Report
          </Link>
          <Link
            to="/checkin"
            className={navLinkClass}
            activeProps={{ className: 'admin-nav-active', 'aria-current': 'page' }}
          >
            Check-in
          </Link>
        </nav>
        <div className="admin-header-actions">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || refreshCooldownSeconds > 0}
            >
              {isRefreshing
                ? 'Refreshing…'
                : refreshCooldownSeconds > 0
                  ? `Refresh in ${refreshCooldownSeconds}s`
                  : 'Refresh'}
            </Button>
          )}
          <ConfirmButton
            variant="ghost"
            label="Sign out"
            confirmLabel="Sure?"
            onConfirm={onSignOut}
            confirmationTone="accent"
          />
        </div>
      </div>
    </header>
  );
}
