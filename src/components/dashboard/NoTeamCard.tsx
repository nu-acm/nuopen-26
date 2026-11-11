import { Sparkles, Square, ArrowUpRight, Link as LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { createTeamSchema, inviteSlugSchema } from '@/lib/validation';
import { webHapticsOptions } from '@/lib/web-haptics';
import { AI_COOLDOWN_MS } from '@/lib/ai';

/** Pause after each generation (and a shorter one after cancelling) to spare Workers AI. */
const CANCEL_COOLDOWN_MS = 3000;

/** Seconds left until `until`, ticking while a cooldown is running. */
function useCountdown(until: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (until <= Date.now()) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [until]);
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** Shown when a participant has no team: create one, or join with a code. */
export function NoTeamCard({
  registrationOpen,
  onCreate,
  onJoin,
  onGenerate,
}: {
  registrationOpen: boolean;
  onCreate: (name: string) => Promise<void>;
  onJoin: (slug: string) => Promise<void>;
  /** Asks the AI for a team name suggestion. */
  onGenerate: () => Promise<string>;
}) {
  const { trigger } = useWebHaptics(webHapticsOptions);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const cooldownSeconds = useCountdown(cooldownUntil);
  // Each generation gets an id; cancelling bumps it so a late reply is ignored.
  const generationRef = useRef(0);

  const fail = (setError: (m: string) => void, message: string) => {
    void trigger('error');
    setError(message);
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const parsed = createTeamSchema.safeParse({ name });
    if (!parsed.success) return fail(setNameError, parsed.error.issues[0].message);
    setPending(true);
    try {
      await onCreate(parsed.data.name);
    } catch (err) {
      fail(
        setNameError,
        err instanceof Error ? err.message : 'That did not work. Please try again.',
      );
    } finally {
      setPending(false);
    }
  };

  const submitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError(null);
    // Accept a full invite URL as well as a bare code.
    const cleaned = slug.trim().replace(/^.*\/invite\//, '');
    const parsed = inviteSlugSchema.safeParse({ slug: cleaned });
    if (!parsed.success) return fail(setSlugError, parsed.error.issues[0].message);
    setPending(true);
    try {
      await onJoin(parsed.data.slug);
    } catch (err) {
      fail(
        setSlugError,
        err instanceof Error ? err.message : 'That did not work. Please try again.',
      );
    } finally {
      setPending(false);
    }
  };

  const generate = async () => {
    const id = ++generationRef.current;
    setNameError(null);
    setGenerating(true);
    setCooldownUntil(Date.now() + AI_COOLDOWN_MS);
    try {
      const suggestion = await onGenerate();
      if (id !== generationRef.current) return;
      setName(suggestion);
      void trigger('success');
    } catch (err) {
      if (id !== generationRef.current) return;
      fail(
        setNameError,
        err instanceof Error ? err.message : 'Could not come up with a name. Try again later.',
      );
    } finally {
      if (id === generationRef.current) setGenerating(false);
    }
  };

  const cancelGenerate = () => {
    generationRef.current++;
    setGenerating(false);
    setCooldownUntil(Date.now() + CANCEL_COOLDOWN_MS);
  };

  const generateLabel = generating
    ? 'Stop'
    : cooldownSeconds > 0
      ? `Try again in ${cooldownSeconds}s`
      : 'Suggest a team name';

  if (!registrationOpen) {
    return (
      <Card variant="team">
        <CardHeader variant="no-team">
          <CardTitle variant="account">You are not in a team yet</CardTitle>
          <CardDescription variant="warning">
            Registration is closed. You can no longer create or join a team.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="account-no-team-grid">
      <Card variant="team">
        <CardHeader variant="no-team">
          <p className="account-eyebrow">Take the lead</p>
          <CardTitle variant="account">Build your squadron</CardTitle>
          <CardDescription variant="account">
            Create a team and invite your teammates, or join one with an invite link.
          </CardDescription>
        </CardHeader>
        <CardContent variant="no-team">
          <form onSubmit={submitCreate} className="account-team-form" noValidate>
            <FormField
              label="Team name"
              error={nameError ?? undefined}
              disabled={pending || generating}
            >
              {(p) => (
                <InputGroup>
                  <InputGroupInput
                    {...p}
                    value={name}
                    placeholder="e.g. Binary Blossoms"
                    onChange={(e) => setName(e.target.value)}
                    disabled={pending || generating}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={generating ? cancelGenerate : generate}
                      disabled={pending || (!generating && cooldownSeconds > 0)}
                      aria-label={generateLabel}
                      title={generateLabel}
                    >
                      {generating ? (
                        <Square size={16} aria-hidden="true" />
                      ) : (
                        <Sparkles size={18} aria-hidden="true" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              )}
            </FormField>
            {generating && (
              <p className="-mt-1 text-sm text-whd-text-muted" aria-live="polite">
                Thinking of a name…
              </p>
            )}
            <Button type="submit" disabled={pending || generating}>
              <span>Create a team</span>
              <ArrowUpRight className="account-button-arrow" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card variant="team">
        <CardHeader variant="no-team">
          <p className="account-eyebrow">Answer the call</p>
          <CardTitle variant="account">Already have a crew?</CardTitle>
          <CardDescription variant="account">
            Use the invitation link or code shared by your captain to join their team.
          </CardDescription>
        </CardHeader>
        <CardContent variant="no-team">
          <form onSubmit={submitJoin} className="account-team-form account-join-form" noValidate>
            <FormField label="Invite code" error={slugError ?? undefined} disabled={pending}>
              {(p) => (
                <Input
                  {...p}
                  value={slug}
                  placeholder="binary-blossoms"
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={pending}
                />
              )}
            </FormField>
            <Button type="submit" variant="secondary" disabled={pending}>
              <LinkIcon size={18} aria-hidden="true" />
              Join a team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
