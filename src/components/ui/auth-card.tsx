import { useCallback, useSyncExternalStore } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const noopSubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Centred card used by the login and onboarding screens. */
export function AuthCard({
  title,
  subtitle,
  className,
  children,
  illustration,
  contentKey,
  layout = 'centered',
  headingDetail,
  profileExtras,
  eyebrow = '02',
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  illustration?: React.ReactNode;
  contentKey?: string;
  layout?: 'centered' | 'profile' | 'invitation';
  headingDetail?: React.ReactNode;
  profileExtras?: React.ReactNode;
  eyebrow?: string;
}) {
  // SSR controls must not accept input before React can retain it or handle submission.
  const clientReady = useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot);
  const focusContent = useCallback(
    (node: HTMLDivElement | null) => {
      if (clientReady && node && document.activeElement === document.body) {
        node.querySelector<HTMLElement>('[autofocus]')?.focus();
      }
    },
    [clientReady],
  );
  if (layout === 'profile') {
    return (
      <main className="account-profile-layout">
        <section className="account-page-heading">
          <p className="account-eyebrow" aria-hidden="true">
            {eyebrow}
          </p>
          <h1>{title}</h1>
          {subtitle && <p className="account-profile-subtitle">{subtitle}</p>}
          {headingDetail}
        </section>
        <div className="account-profile-panels">
          <Card variant="profile" className={className}>
            <CardContent
              inert={!clientReady}
              aria-busy={!clientReady || undefined}
              ref={focusContent}
              variant="auth"
            >
              {children}
            </CardContent>
          </Card>
          {profileExtras}
        </div>
      </main>
    );
  }
  if (layout === 'invitation') {
    return (
      <main className="account-invitation-layout">
        <Card variant="invitation">
          <CardHeader variant="auth">
            <div className="invitation-symbol" aria-hidden="true">
              2026
            </div>
            <CardTitle as="h1" variant="auth">
              {title}
            </CardTitle>
            {subtitle && <CardDescription variant="auth">{subtitle}</CardDescription>}
            {headingDetail}
          </CardHeader>
          <CardContent
            inert={!clientReady}
            aria-busy={!clientReady || undefined}
            ref={focusContent}
            variant="auth"
          >
            {children}
          </CardContent>
        </Card>
      </main>
    );
  }
  if (illustration) {
    return (
      <main className="account-login-grid">
        {illustration}
        <Card variant="login" className={className}>
          <CardHeader variant="login">
            <CardTitle as="h1" variant="login">
              {title}
            </CardTitle>
            {subtitle && <CardDescription variant="login">{subtitle}</CardDescription>}
          </CardHeader>
          <CardContent
            inert={!clientReady}
            aria-busy={!clientReady || undefined}
            ref={focusContent}
            key={contentKey}
            variant="login"
          >
            {children}
          </CardContent>
        </Card>
      </main>
    );
  }
  return (
    <div className="whd-grid-bg relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Star glow, echoing the landing hero */}
      <div
        aria-hidden="true"
        className="whd-auth-glow pointer-events-none absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-70"
      />

      <Card variant="auth" className={cn('relative w-full max-w-md', className)}>
        <CardHeader variant="auth">
          <CardTitle as="h1" variant="auth">
            {title}
          </CardTitle>
          {subtitle && <CardDescription variant="auth">{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent
          inert={!clientReady}
          aria-busy={!clientReady || undefined}
          ref={focusContent}
          variant="auth"
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
