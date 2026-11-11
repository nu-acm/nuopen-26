import { Plus, Crown, Copy, Check } from 'lucide-react';
import { useId, useState, useSyncExternalStore } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { Input } from '@/components/ui/input';
import { Item } from '@/components/ui/item';
import { Notice } from '@/components/ui/notice';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MAX_TEAM_SIZE } from '@/lib/event';
import type { TeamData } from '@/lib/team.server';
import { webHapticsOptions } from '@/lib/web-haptics';

const noopSubscribe = () => () => {};

/**
 * The server snapshot is ''. React reads the site origin after hydration.
 * Reading it inline left the invite field blank because hydration kept the server value.
 */
function useOrigin() {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => '',
  );
}

/** Which team action is in flight: a member id for a kick, or leave/dissolve. */
export type PendingTeamAction = string | null;

export function TeamCard({
  team,
  currentUserId,
  registrationOpen,
  pendingAction,
  onKick,
  onLeave,
  onDissolve,
}: {
  team: TeamData;
  currentUserId: string;
  registrationOpen: boolean;
  pendingAction: PendingTeamAction;
  onKick: (userId: string) => void;
  onLeave: () => void;
  onDissolve: () => void;
}) {
  const { trigger } = useWebHaptics(webHapticsOptions);
  const [copied, setCopied] = useState(false);
  const inviteId = useId();

  const isCaptain = team.captainId === currentUserId;
  const busy = pendingAction !== null;
  const openSlots = Math.max(0, MAX_TEAM_SIZE - team.members.length);
  const origin = useOrigin();
  const inviteUrl = origin ? `${origin}/invite/${team.inviteSlug}` : '';

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      void trigger('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the input is selectable as a fallback.
    }
  };

  return (
    <Card variant="team">
      <CardHeader variant="team">
        <div className="account-team-heading">
          <div>
            <p className="account-eyebrow">Your squadron</p>
            <CardTitle variant="team">{team.name}</CardTitle>
          </div>
          <span className="account-team-count">
            <strong>{String(team.members.length).padStart(2, '0')}</strong> /{' '}
            {String(MAX_TEAM_SIZE).padStart(2, '0')}
          </span>
        </div>
        <div className="account-team-subheading">
          <span className="account-team-badge">
            <i aria-hidden="true" />
            Team registered
          </span>
        </div>
      </CardHeader>
      <CardContent variant="team">
        {!registrationOpen && <Notice>Registration is closed, so team changes are locked.</Notice>}

        {/* Members, then the slots still open */}
        <ul className="account-members">
          {team.members.map((member, index) => (
            <Item key={member.id} variant="member">
              <span className="account-member-slot" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="account-member-avatar" aria-hidden="true">
                {member.fullName.trim().charAt(0).toLocaleUpperCase()}
              </span>
              <span className="account-member-name">
                {member.fullName}
                <span className="account-member-role">
                  {member.isCaptain && <Crown size={12} aria-hidden="true" />}
                  {member.isCaptain ? 'Captain' : 'Member'}
                </span>
              </span>
              {registrationOpen && isCaptain && !member.isCaptain && (
                <ConfirmButton
                  variant="ghost"
                  label="Remove"
                  confirmLabel="Sure?"
                  loading={pendingAction === member.id}
                  disabled={busy}
                  onConfirm={() => onKick(member.id)}
                />
              )}
            </Item>
          ))}
          {Array.from({ length: openSlots }, (_, i) => (
            <Item key={`open-${i}`} variant="empty-member">
              <span className="account-member-slot" aria-hidden="true">
                {String(team.members.length + i + 1).padStart(2, '0')}
              </span>
              <span className="account-member-avatar" aria-hidden="true">
                <Plus size={18} />
              </span>
              Open slot
            </Item>
          ))}
        </ul>

        {registrationOpen && (
          <>
            {/* Invite link */}
            <div className="account-invite">
              <label htmlFor={inviteId}>Invite link</label>
              <div className="account-invite-input">
                <Input
                  id={inviteId}
                  readOnly
                  value={inviteUrl}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button variant="secondary" onClick={copyInvite} className="shrink-0">
                  {copied ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <Copy size={16} aria-hidden="true" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-whd-text-muted">Share this link with your teammates.</p>
            </div>
          </>
        )}
      </CardContent>
      {registrationOpen && (
        <CardFooter variant="team">
          <div className="account-team-danger">
            {isCaptain ? (
              <ConfirmButton
                size="md"
                label="Dissolve team"
                confirmLabel="Sure?"
                loading={pendingAction === 'dissolve'}
                loadingLabel="Loading…"
                disabled={busy}
                onConfirm={onDissolve}
              />
            ) : (
              <ConfirmButton
                size="md"
                label="Leave team"
                confirmLabel="Sure?"
                loading={pendingAction === 'leave'}
                loadingLabel="Loading…"
                disabled={busy}
                onConfirm={onLeave}
              />
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
