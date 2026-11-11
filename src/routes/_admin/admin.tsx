import { useCallback, useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useAdminTable, type AdminColumnDef } from '@/components/admin/use-admin-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { Button, LinkButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { ColumnToggleBar, AdminDataTable, StatCard } from '@/components/admin/table';
import { getSession } from '@/lib/auth.server';
import { sessionIsAdmin } from '@/lib/admin.server';
import { compareTeamNumbers, formatTeamNumber } from '@/lib/contest';
import { finalizeTeams, getProctoringCsv, setTeamUnconfirmed } from '@/lib/contest.server';
import { isRegistrationOpen } from '@/lib/registration.server';
import {
  getReportData,
  participantsToCsv,
  type ReportParticipant,
  type ReportTeam,
} from '@/lib/report.server';
import { useAdminRefresh } from '@/lib/use-admin-refresh';

// Re-checked in every server function: the layout guard protects navigation,
// this protects the data itself.
async function assertAdmin() {
  const session = await getSession(getRequest());
  if (!sessionIsAdmin(session)) throw new Error('Forbidden');
}

const loadReport = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin();
  return { ...(await getReportData()), registrationOpen: isRegistrationOpen() };
});

const downloadCsv = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin();
  const { participants } = await getReportData();
  return participantsToCsv(participants);
});

const setTeamUnconfirmedFn = createServerFn({ method: 'POST' })
  .validator(z.object({ inviteSlug: z.string().min(1), unconfirmed: z.boolean() }))
  .handler(async ({ data }) => {
    await assertAdmin();
    return setTeamUnconfirmed(data.inviteSlug, data.unconfirmed);
  });

const finalizeTeamsFn = createServerFn({ method: 'POST' }).handler(async () => {
  await assertAdmin();
  return finalizeTeams();
});

/** Holds every team's password: a POST, so nothing along the way caches it. */
const downloadProctoringCsv = createServerFn({ method: 'POST' }).handler(async () => {
  await assertAdmin();
  return getProctoringCsv();
});

function downloadFile(text: string, prefix: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Cached for 5 minutes; organisers pull fresh data with the header's Refresh. */
const reportQueryOptions = queryOptions({
  queryKey: ['admin-report'],
  queryFn: () => loadReport(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute('/_admin/admin')({
  loader: ({ context }) => context.queryClient.ensureQueryData(reportQueryOptions),
  component: AdminPage,
});

type Tab = 'participants' | 'teams';
type Eligibility = 'all' | 'eligible' | 'not-eligible';

const participantId = (row: ReportParticipant) => row.id;
const teamId = (row: ReportTeam) => row.inviteSlug;

const matches = (needle: string, ...fields: (string | null)[]) =>
  fields.some((f) => f?.toLowerCase().includes(needle));

type Notice = { type: 'success' | 'error'; message: string };

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'short',
  timeZone: 'Asia/Almaty',
});

function formatDate(iso: string) {
  const date = new Date(iso);
  return isNaN(date.getTime()) ? 'Not provided' : dateFormatter.format(date);
}

function AdminPage() {
  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useSuspenseQuery(reportQueryOptions);
  const { participants, teams, stats, registrationOpen } = data;
  useAdminRefresh(refetch, isFetching);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [pendingSlugs, setPendingSlugs] = useState<ReadonlySet<string>>(() => new Set());

  const setUnconfirmed = useCallback(
    async (inviteSlug: string, unconfirmed: boolean) => {
      const setPending = (pending: boolean) =>
        setPendingSlugs((prev) => {
          const next = new Set(prev);
          if (pending) next.add(inviteSlug);
          else next.delete(inviteSlug);
          return next;
        });
      setPending(true);
      setNotice(null);
      // Tick the box at once; the refetch brings the counts and rolls back a refusal.
      queryClient.setQueryData(
        reportQueryOptions.queryKey,
        (d) =>
          d && {
            ...d,
            teams: d.teams.map((team) =>
              team.inviteSlug === inviteSlug ? { ...team, unconfirmed } : team,
            ),
          },
      );
      try {
        await setTeamUnconfirmedFn({ data: { inviteSlug, unconfirmed } });
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not update the team. Try again.',
        });
      } finally {
        await refetch();
        setPending(false);
      }
    },
    [queryClient, refetch],
  );

  const finalize = async () => {
    setFinalizing(true);
    setNotice(null);
    try {
      const { assigned, badNames } = await finalizeTeamsFn();
      setNotice(
        badNames.length
          ? {
              type: 'error',
              message: `Rename these teams first, without | or line breaks: ${badNames.join(', ')}`,
            }
          : assigned
            ? { type: 'success', message: `Teams numbered: ${assigned}.` }
            : { type: 'success', message: 'Every eligible, confirmed team already has a number.' },
      );
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not finalize the teams. Try again.',
      });
    } finally {
      await refetch();
      setFinalizing(false);
    }
  };

  const [tab, setTab] = useState<Tab>('participants');
  const [participantQuery, setParticipantQuery] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [participantFilter, setParticipantFilter] = useState<Eligibility>('all');
  const [teamFilter, setTeamFilter] = useState<Eligibility>('all');
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const goToTeam = useCallback((slug: string) => {
    setTeamFilter('all');
    setTeamQuery('');
    setTab('teams');
    setScrollTarget(`team-${slug}`);
  }, []);
  const goToParticipant = useCallback((id: string) => {
    setParticipantFilter('all');
    setParticipantQuery('');
    setTab('participants');
    setScrollTarget(`participant-${id}`);
  }, []);

  const eligibleParticipants = participants.filter((p) => p.teamEligible).length;

  const participantsInFilter = useMemo(
    () =>
      participantFilter === 'all'
        ? participants
        : participants.filter((p) => p.teamEligible === (participantFilter === 'eligible')),
    [participants, participantFilter],
  );
  const teamsInFilter = useMemo(
    () =>
      teamFilter === 'all'
        ? teams
        : teams.filter((team) => team.eligible === (teamFilter === 'eligible')),
    [teams, teamFilter],
  );

  const participantMatches = useMemo(() => {
    const needle = participantQuery.trim().toLowerCase();
    const filtered = !needle
      ? participantsInFilter
      : participantsInFilter.filter((p) =>
          matches(
            needle,
            p.fullName,
            p.email,
            p.iin,
            p.phone,
            p.parentPhone,
            p.city,
            p.placeOfStudy,
            p.educationLevel,
            p.teamName,
          ),
        );
    return filtered;
  }, [participantsInFilter, participantQuery]);

  const teamMatches = useMemo(() => {
    const needle = teamQuery.trim().toLowerCase();
    const filtered = !needle
      ? teamsInFilter
      : teamsInFilter.filter((team) =>
          matches(
            needle,
            team.name,
            team.captainName,
            team.inviteSlug,
            ...team.members.map((m) => m.fullName),
          ),
        );
    return filtered;
  }, [teamsInFilter, teamQuery]);

  const participantCols = useMemo<AdminColumnDef<ReportParticipant>[]>(
    () => [
      {
        id: 'fullName',
        accessorFn: (p) => p.fullName,
        meta: { label: 'Name' },
        cell: ({ row }) => row.original.fullName,
      },
      {
        id: 'email',
        accessorFn: (p) => p.email,
        meta: { label: 'Email' },
        cell: ({ row }) => row.original.email,
      },
      {
        id: 'iin',
        accessorFn: (p) => p.iin,
        meta: { label: 'IIN', tone: 'numeric' },
        cell: ({ row }) => row.original.iin,
      },
      {
        id: 'phone',
        accessorFn: (p) => p.phone,
        meta: { label: 'Phone' },
        cell: ({ row }) => row.original.phone,
      },
      {
        id: 'parentPhone',
        accessorFn: (p) => p.parentPhone,
        meta: { label: 'Parent phone' },
        cell: ({ row }) =>
          row.original.parentPhone ?? <span className="text-muted-foreground">Not provided</span>,
      },
      {
        id: 'city',
        accessorFn: (p) => p.city,
        meta: { label: 'City' },
        cell: ({ row }) => row.original.city,
      },
      {
        id: 'placeOfStudy',
        accessorFn: (p) => p.placeOfStudy,
        meta: { label: 'Place of study' },
        cell: ({ row }) => row.original.placeOfStudy,
      },
      {
        id: 'educationLevel',
        accessorFn: (p) => p.educationLevel,
        meta: { label: 'Level' },
        cell: ({ row }) => row.original.educationLevel,
      },
      {
        id: 'cvUrl',
        accessorFn: (p) => p.cvUrl,
        meta: { label: 'CV' },
        cell: ({ row }) =>
          row.original.cvUrl ? (
            <LinkButton
              href={row.original.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="table-link"
              size="none"
            >
              Open
            </LinkButton>
          ) : (
            <span className="text-muted-foreground">Not uploaded</span>
          ),
      },
      {
        id: 'teamName',
        accessorFn: (p) => p.teamName,
        meta: { label: 'Team' },
        cell: ({ row }) => {
          const { teamName, teamSlug } = row.original;
          return teamName && teamSlug ? (
            <Button variant="table-link" size="none" onClick={() => goToTeam(teamSlug)}>
              {teamName}
            </Button>
          ) : (
            <span className="text-muted-foreground">No team yet</span>
          );
        },
      },
      {
        id: 'attended',
        accessorFn: (p) => p.attended,
        meta: { label: 'Checked in' },
        sortFn: (a, b) => Number(a.original.attended) - Number(b.original.attended),
        cell: ({ row }) => (row.original.attended ? '✓' : ''),
      },
      {
        id: 'createdAt',
        accessorFn: (p) => p.createdAt,
        meta: { label: 'Registered', tone: 'muted' },
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [goToTeam],
  );
  const teamCols = useMemo<AdminColumnDef<ReportTeam>[]>(
    () => [
      {
        id: 'number',
        accessorFn: (team) => team.number,
        meta: { label: 'Table', tone: 'numeric' },
        sortFn: (a, b) => compareTeamNumbers(a.original.number, b.original.number),
        cell: ({ row }) =>
          row.original.number === null ? (
            <span className="text-muted-foreground">Not provided</span>
          ) : (
            formatTeamNumber(row.original.number)
          ),
      },
      {
        id: 'name',
        accessorFn: (team) => team.name,
        meta: { label: 'Team' },
        cell: ({ row }) => row.original.name,
      },
      {
        id: 'captainName',
        accessorFn: (team) => team.captainName,
        meta: { label: 'Captain' },
        cell: ({ row }) => row.original.captainName,
      },
      {
        id: 'memberCount',
        accessorFn: (team) => team.memberCount,
        meta: { label: 'Size' },
        sortFn: (a, b) => a.original.memberCount - b.original.memberCount,
        cell: ({ row }) => row.original.memberCount,
      },
      {
        id: 'eligible',
        accessorFn: (team) => team.eligible,
        meta: { label: 'Eligible' },
        sortFn: (a, b) => Number(a.original.eligible) - Number(b.original.eligible),
        cell: ({ row }) => (
          <span
            className={row.original.eligible ? 'text-whd-pink-bright' : 'text-muted-foreground'}
          >
            {row.original.eligible ? '✓' : 'No'}
          </span>
        ),
      },
      {
        // Unticked for teams that didn't confirm participation; final once a team has a number.
        id: 'confirmed',
        accessorFn: (team) => !team.unconfirmed,
        meta: { label: 'Confirmed' },
        sortFn: (a, b) => Number(a.original.unconfirmed) - Number(b.original.unconfirmed),
        cell: ({ row }) => {
          const { eligible, unconfirmed, number, inviteSlug, name } = row.original;
          if (!eligible) return <span className="text-muted-foreground">Not applicable</span>;
          return (
            <Checkbox
              checked={!unconfirmed}
              disabled={number !== null || pendingSlugs.has(inviteSlug)}
              onCheckedChange={(checked) => void setUnconfirmed(inviteSlug, !checked)}
              aria-label={
                unconfirmed ? `Mark ${name} as confirmed` : `Mark ${name} as not confirmed`
              }
            />
          );
        },
      },
      {
        id: 'members',
        enableSorting: false,
        meta: { label: 'Members' },
        cell: ({ row }) =>
          row.original.members.map((member, index) => (
            <span key={member.id}>
              <Button variant="table-link" size="none" onClick={() => goToParticipant(member.id)}>
                {member.fullName}
              </Button>
              {index < row.original.members.length - 1 && ', '}
            </span>
          )),
      },
      {
        id: 'inviteSlug',
        accessorFn: (team) => team.inviteSlug,
        meta: { label: 'Invite code', tone: 'slug' },
        cell: ({ row }) => row.original.inviteSlug,
      },
      {
        id: 'createdAt',
        accessorFn: (team) => team.createdAt,
        meta: { label: 'Registered', tone: 'muted' },
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [goToParticipant, pendingSlugs, setUnconfirmed],
  );
  const participantTable = useAdminTable(
    participantMatches,
    participantCols,
    'fullName',
    participantId,
  );
  const teamTable = useAdminTable(teamMatches, teamCols, 'name', teamId);

  // After switching tabs, wait for the target row to render, then scroll to and flash it.
  useEffect(() => {
    if (!scrollTarget) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const el = document.getElementById(scrollTarget);
        setScrollTarget(null);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('admin-highlight');
        timeout = setTimeout(() => el.classList.remove('admin-highlight'), 2000);
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(timeout);
    };
  }, [scrollTarget, tab]);

  const exportCsv = async () => downloadFile(await downloadCsv(), 'whd-participants');
  const exportProctoring = async () =>
    downloadFile(await downloadProctoringCsv(), 'whd-proctoring-teams');

  const eligibilityOptions = [
    { value: 'all', label: 'All' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'not-eligible', label: 'Not eligible' },
  ] as const;

  const isParticipants = tab === 'participants';
  const shown = isParticipants
    ? participantTable.getRowModel().rows.length
    : teamTable.getRowModel().rows.length;
  const inFilter = isParticipants ? participantsInFilter.length : teamsInFilter.length;
  const query = isParticipants ? participantQuery : teamQuery;

  return (
    <main className="admin-main">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <div className="admin-heading">
          <div>
            <h1 className="admin-title">Admin</h1>
            <p className="mt-2 text-sm text-whd-text-muted">
              {registrationOpen
                ? 'Registration is still open. Finalize the teams once it closes.'
                : `Numbered: ${stats.numberedTeams} · awaiting a number: ${stats.awaitingNumber}`}
            </p>
          </div>
          <div className="admin-heading-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFinalizeOpen(true)}
              disabled={registrationOpen || stats.awaitingNumber === 0 || finalizing}
            >
              Finalize teams
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportProctoring}
              disabled={stats.numberedTeams === 0 || stats.awaitingNumber > 0}
            >
              Export for proctoring
            </Button>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </div>
        <ConfirmDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          title="Finalize teams?"
          description={`Eligible, confirmed teams without a number (${stats.awaitingNumber}) get table numbers and Codeforces passwords, in random order. Numbers can never be changed or taken back, and these teams can no longer change their members.`}
          confirmLabel="Finalize"
          cancelLabel="Cancel"
          onConfirm={() => void finalize()}
        />
        {notice && (
          <p
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={
              notice.type === 'error'
                ? 'mb-6 text-sm text-destructive'
                : 'mb-6 text-sm text-whd-pink-soft'
            }
          >
            {notice.message}
          </p>
        )}

        <div className="admin-stats">
          <StatCard
            label="Participants"
            value={stats.participants}
            breakdown={`${eligibleParticipants} eligible / ${stats.participants - eligibleParticipants} not`}
          />
          <StatCard
            label="Teams"
            value={stats.teams}
            breakdown={`${stats.eligibleTeams} eligible / ${stats.teams - stats.eligibleTeams} not`}
          />
          <StatCard label="Without a team" value={stats.teamless} />
          <StatCard label="Checked in" value={stats.attended} />
        </div>

        <section className="admin-registry">
          <div className="admin-registry-header">
            <TabsList>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
          </div>
          <div className="admin-toolbar">
            <Input
              value={query}
              onChange={(e) =>
                isParticipants ? setParticipantQuery(e.target.value) : setTeamQuery(e.target.value)
              }
              aria-label={
                isParticipants ? 'Search name, email, team…' : 'Search team, captain, member…'
              }
              placeholder={
                isParticipants ? 'Search name, email, team…' : 'Search team, captain, member…'
              }
            />
          </div>

          <div className="admin-controls">
            {isParticipants ? (
              <>
                <ColumnToggleBar table={participantTable} />
                <Segmented
                  label="Filter"
                  options={eligibilityOptions}
                  value={participantFilter}
                  onChange={setParticipantFilter}
                />
              </>
            ) : (
              <>
                <ColumnToggleBar table={teamTable} />
                <Segmented
                  label="Filter"
                  options={eligibilityOptions}
                  value={teamFilter}
                  onChange={setTeamFilter}
                />
              </>
            )}
          </div>

          <p className="admin-count">{`${shown} of ${inFilter}`}</p>

          <div className="admin-table-wrap" role="region" aria-label="Columns" tabIndex={0}>
            <TabsContent value="participants">
              <AdminDataTable
                table={participantTable}
                variant="participants"
                rowPrefix="participant"
              />
            </TabsContent>
            <TabsContent value="teams">
              <AdminDataTable table={teamTable} variant="teams" rowPrefix="team" />
            </TabsContent>
          </div>

          {shown === 0 && (
            <Empty>
              <EmptyDescription>Nothing to show</EmptyDescription>
            </Empty>
          )}
        </section>
      </Tabs>
    </main>
  );
}
