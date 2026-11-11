import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { sendSignInCode } from '@/lib/auth-client';
import { emailSchema } from '@/lib/validation';
import { webHapticsOptions } from '@/lib/web-haptics';

export function EmailForm({ onSent }: { onSent: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { trigger } = useWebHaptics(webHapticsOptions);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      void trigger('error');
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      await sendSignInCode(parsed.data.email);
      void trigger('success');
      onSent(parsed.data.email);
    } catch {
      void trigger('error');
      setError('Could not send the code. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <FieldGroup>
        <FormField disabled={pending} label="Email" error={error ?? undefined} required>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          )}
        </FormField>

        <Button type="submit" disabled={pending} className="w-full">
          <>
            {pending && <Spinner data-icon="inline-start" />}
            <span>{pending ? 'Loading…' : 'Send code'}</span>
          </>
          <ArrowUpRight className="account-button-arrow" aria-hidden="true" />
        </Button>
      </FieldGroup>
    </form>
  );
}
