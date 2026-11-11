import { ArrowUpRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useId, useState, useSyncExternalStore } from 'react';
import { LinkButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import type { ContestAccess } from '@/lib/contest';

const everyFewSeconds = (onChange: () => void) => {
  const id = setInterval(onChange, 5000);
  return () => clearInterval(id);
};

/** True from `start` on, without a reload. The server renders false; the browser catches up. */
function useStarted(start: string | null) {
  return useSyncExternalStore(
    everyFewSeconds,
    () => start !== null && Date.now() >= Date.parse(start),
    () => false,
  );
}

/**
 * A finalized team's table number and Codeforces account. Every member sees it from the moment
 * the teams are finalized, for good; the upload button joins it at the contest start.
 */
export function ContestCard({ contest }: { contest: ContestAccess }) {
  const [shown, setShown] = useState(false);
  const loginId = useId();
  const passwordId = useId();
  const started = useStarted(contest.contestStart);

  return (
    <Card variant="team">
      <CardHeader variant="team">
        <p className="account-eyebrow">
          <KeyRound size={16} aria-hidden="true" />
          Contest access
        </p>
        <CardTitle variant="team">{`Table ${contest.tableNumber}`}</CardTitle>
        <CardDescription variant="account">
          Sign in to Codeforces with these during the contest. Don't share the password outside your
          team.
        </CardDescription>
      </CardHeader>
      <CardContent variant="team">
        <Field>
          <FieldLabel htmlFor={loginId}>Codeforces login</FieldLabel>
          <Input
            id={loginId}
            readOnly
            value={contest.login}
            onFocus={(e) => e.currentTarget.select()}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={passwordId}>Codeforces password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={passwordId}
              readOnly
              type={shown ? 'text' : 'password'}
              autoComplete="off"
              value={contest.password}
              onFocus={(e) => e.currentTarget.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => setShown((value) => !value)}
                aria-label="Show password"
                aria-pressed={shown}
                title="Show password"
              >
                {shown ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {started && (
          <LinkButton href={contest.uploadUrl} target="_blank" rel="noopener noreferrer">
            <span>Upload video</span>
            <ArrowUpRight className="account-button-arrow" aria-hidden="true" />
          </LinkButton>
        )}
      </CardContent>
    </Card>
  );
}
