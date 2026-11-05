import { useId, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { authClient } from '@/lib/auth-client';
import { ConfirmButton } from '@/components/ui/confirm-button';

/** The existing sign-out action lives only in the participant's personal-data view. */
export function AccountSignOut({ email }: { email: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const signOut = async () => {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
      await navigate({ to: '/', reloadDocument: true });
    } catch {
      setError(true);
      setPending(false);
    }
  };
  return (
    <section className="account-session-panel" aria-labelledby={titleId}>
      <div>
        <h2 id={titleId}>{t('account.session')}</h2>
        <p>{email}</p>
      </div>
      <ConfirmButton
        variant="ghost"
        label={t('common.signOut')}
        confirmLabel={t('common.confirm')}
        loading={pending}
        loadingLabel={t('common.loading')}
        confirmationTone="accent"
        onConfirm={() => void signOut()}
      />
      {error && (
        <p role="alert" className="account-session-error">
          {t('account.signOutFailed')}
        </p>
      )}
    </section>
  );
}
