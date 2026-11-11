import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useAdminTable, type AdminColumnDef } from '@/components/admin/use-admin-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { ColumnToggleBar, AdminDataTable, StatCard } from '@/components/admin/table';
import { MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '@/lib/event';
import { getSession } from '@/lib/auth.server';
import { sessionIsAdmin } from '@/lib/admin.server';
import { compareTeamNumbers, formatTeamNumber } from '@/lib/contest';
import {
  getCheckinData,
  setAttendance,
  type CheckinData,
  type CheckinTeam,
} from '@/lib/checkin.server';
import { useAdminRefresh } from '@/lib/use-admin-refresh';

async function assertAdmin() {
  const session = await getSession(getRequest());
  if (!sessionIsAdmin(session)) throw new Error('Forbidden');
}

const loadCheckin = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin();
  return getCheckinData();
});

const setAttendanceFn = createServerFn({ method: 'POST' })
  .validator(z.object({ participantId: z.string().min(1), attended: z.boolean() }))
  .handler(async ({ data }) => {
    await assertAdmin();
    return setAttendance(data.participantId, data.attended);
  });

const checkinQueryKey = ['checkin-data'] as const;

/** Never stale on its own: this tab's toggles update the cache directly; Refresh pulls others'. */
const checkinQueryOptions = queryOptions({
  queryKey: checkinQueryKey,
  queryFn: () => loadCheckin(),
  staleTime: Infinity,
  refetchOnWindowFocus: false,
});

export const Route = createFileRoute('/_admin/checkin')({
  loader: ({ context }) => context.queryClient.ensureQueryData(checkinQueryOptions),
  component: CheckinPage,
});

type Tab = 'participants' | 'teams';
type AttendanceFilter = 'all' | 'attended' | 'not-attended';
/** ready: the whole roster is present; partial: some; no-show: none. */
type TeamStatus = 'ready' | 'partial' | 'no-show';

const participantId = (row: CheckinData['participants'][number]) => row.id;
const teamId = (row: CheckinTeam) => row.id;

const attendedCount = (team: CheckinTeam) => team.members.filter((m) => m.attended).length;

/** Staff type a table number as 7 or 07; only the whole number matches. */
const isTableNumber = (number: number | null, needle: string) =>
  number !== null && (needle === String(number) || needle === formatTeamNumber(number));

function TableNumber({ number }: { number: number | null }) {
  return number === null ? (
    <span className="text-muted-foreground">Not provided</span>
  ) : (
    formatTeamNumber(number)
  );
}

function teamStatus(team: CheckinTeam): TeamStatus {
  const present = attendedCount(team);
  if (present === team.members.length) return 'ready';
  return present > 0 ? 'partial' : 'no-show';
}

/** Apply one attendance change to the cached data, in both lists. */
function withAttendance(data: CheckinData | undefined, id: string, attended: boolean) {
  if (!data) return data;
  return {
    participants: data.participants.map((p) => (p.id === id ? { ...p, attended } : p)),
    teams: data.teams.map((team) => ({
      ...team,
      members: team.members.map((m) => (m.id === id ? { ...m, attended } : m)),
    })),
  };
}

/** Checking in is one click; un-checking asks first, since it is usually a mis-tap. */
function AttendanceCheckbox({
  checked,
  disabled,
  name,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  name: string;
  onChange: (attended: boolean) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => (next ? onChange(true) : setConfirmOpen(true))}
        aria-label={checked ? `Mark ${name} as not checked in` : `Mark ${name} as checked in`}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Undo check-in?"
        description={`${name} will be marked as not checked in.`}
        confirmLabel="Undo check-in"
        cancelLabel="Cancel"
        onConfirm={() => onChange(false)}
      />
    </>
  );
}

const AttendanceActionsContext = createContext<{
  pendingIds: ReadonlySet<string>;
  setAttended: (id: string, attended: boolean) => void;
} | null>(null);

function AttendanceCell({
  row,
}: {
  row: { id: string; original: CheckinData['participants'][number] };
}) {
  const actions = useContext(AttendanceActionsContext);
  if (!actions) throw new Error('Attendance cells require their action provider.');
  return (
    <AttendanceCheckbox
      checked={row.original.attended}
      disabled={actions.pendingIds.has(row.id)}
      name={row.original.fullName}
      onChange={(attended) => actions.setAttended(row.id, attended)}
    />
  );
}

function CheckinPage() {
  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useSuspenseQuery(checkinQueryOptions);
  const { participants, teams } = data;
  useAdminRefresh(refetch, isFetching);

  const [tab, setTab] = useState<Tab>('participants');
  const [participantQuery, setParticipantQuery] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [participantFilter, setParticipantFilter] = useState<AttendanceFilter>('all');
  const [teamFilter, setTeamFilter] = useState<'all' | TeamStatus>('all');
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  const presentCount = participants.filter((p) => p.attended).length;
  const statusCounts = useMemo(() => {
    const counts: Record<TeamStatus, number> = { ready: 0, partial: 0, 'no-show': 0 };
    for (const team of teams) counts[teamStatus(team)] += 1;
    return counts;
  }, [teams]);

  const participantsInFilter = useMemo(
    () =>
      participantFilter === 'all'
        ? participants
        : participants.filter((p) => p.attended === (participantFilter === 'attended')),
    [participants, participantFilter],
  );
  const teamsInFilter = useMemo(
    () => (teamFilter === 'all' ? teams : teams.filter((team) => teamStatus(team) === teamFilter)),
    [teams, teamFilter],
  );

  const participantMatches = useMemo(() => {
    const needle = participantQuery.trim().toLowerCase();
    const filtered = !needle
      ? participantsInFilter
      : participantsInFilter.filter(
          (p) =>
            isTableNumber(p.teamNumber, needle) ||
            // IIN and phone too: the check-in desk often asks for one of them.
            [p.fullName, p.iin, p.phone, p.teamName, p.placeOfStudy, p.educationLevel].some((f) =>
              f.toLowerCase().includes(needle),
            ),
        );
    return filtered;
  }, [participantsInFilter, participantQuery]);

  const teamMatches = useMemo(() => {
    const needle = teamQuery.trim().toLowerCase();
    const filtered = !needle
      ? teamsInFilter
      : teamsInFilter.filter(
          (team) =>
            isTableNumber(team.number, needle) ||
            [team.name, team.captainName, ...team.members.map((m) => m.fullName)].some((f) =>
              f.toLowerCase().includes(needle),
            ),
        );
    return filtered;
  }, [teamsInFilter, teamQuery]);

  const setPending = (id: string, pending: boolean) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  // Optimistic: tick the box immediately, roll back if the server refuses.
  const { mutate } = useMutation({
    mutationFn: (vars: { participantId: string; attended: boolean }) =>
      setAttendanceFn({ data: vars }),
    onMutate: async ({ participantId, attended }) => {
      setPending(participantId, true);
      setError(null);
      await queryClient.cancelQueries({ queryKey: checkinQueryKey });
      const previous = queryClient.getQueryData<CheckinData>(checkinQueryKey);
      queryClient.setQueryData<CheckinData>(checkinQueryKey, (d) =>
        withAttendance(d, participantId, attended),
      );
      return {
        previousAttended: previous?.participants.find((p) => p.id === participantId)?.attended,
      };
    },
    onError: (err, { participantId }, context) => {
      if (context?.previousAttended !== undefined) {
        const previousAttended = context.previousAttended;
        queryClient.setQueryData<CheckinData>(checkinQueryKey, (d) =>
          withAttendance(d, participantId, previousAttended),
        );
      }
      setError(err instanceof Error ? err.message : 'Could not update attendance. Try again.');
    },
    onSuccess: (row) => {
      queryClient.setQueryData<CheckinData>(checkinQueryKey, (d) =>
        withAttendance(d, row.id, row.attended),
      );
    },
    onSettled: (_row, _err, vars) => setPending(vars.participantId, false),
  });

  const setAttended = useCallback(
    (participantId: string, attended: boolean) => mutate({ participantId, attended }),
    [mutate],
  );
  const attendanceActions = useMemo(() => ({ pendingIds, setAttended }), [pendingIds, setAttended]);

  const participantCols = useMemo<AdminColumnDef<CheckinData['participants'][number]>[]>(
    () => [
      {
        id: 'attendance',
        accessorFn: (p) => p.attended,
        enableSorting: false,
        enableHiding: false,
        meta: { label: 'Checked in' },
        cell: AttendanceCell,
      },
      {
        id: 'fullName',
        accessorFn: (p) => p.fullName,
        meta: { label: 'Name' },
        cell: ({ row }) => row.original.fullName,
      },
      {
        id: 'teamNumber',
        accessorFn: (p) => p.teamNumber,
        meta: { label: 'Table', tone: 'numeric' },
        sortFn: (a, b) => compareTeamNumbers(a.original.teamNumber, b.original.teamNumber),
        cell: ({ row }) => <TableNumber number={row.original.teamNumber} />,
      },
      {
        id: 'teamName',
        accessorFn: (p) => p.teamName,
        meta: { label: 'Team', tone: 'muted' },
        cell: ({ row }) => row.original.teamName,
      },
      {
        id: 'placeOfStudy',
        accessorFn: (p) => p.placeOfStudy,
        meta: { label: 'Place of study', tone: 'muted' },
        cell: ({ row }) => row.original.placeOfStudy,
      },
      {
        id: 'educationLevel',
        accessorFn: (p) => p.educationLevel,
        meta: { label: 'Level', tone: 'muted' },
        cell: ({ row }) => row.original.educationLevel,
      },
    ],
    [],
  );
  const teamCols = useMemo<AdminColumnDef<CheckinTeam>[]>(
    () => [
      {
        id: 'number',
        accessorFn: (team) => team.number,
        meta: { label: 'Table', tone: 'numeric' },
        sortFn: (a, b) => compareTeamNumbers(a.original.number, b.original.number),
        cell: ({ row }) => <TableNumber number={row.original.number} />,
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
        meta: { label: 'Captain', tone: 'muted' },
        cell: ({ row }) => row.original.captainName,
      },
      {
        id: 'members',
        enableSorting: false,
        meta: { label: 'Members' },
        cell: ({ row }) =>
          row.original.members.map((member, index) => (
            <span
              key={member.id}
              className={member.attended ? 'text-whd-pink-bright' : 'text-muted-foreground'}
            >
              {member.fullName}
              {index < row.original.members.length - 1 && ', '}
            </span>
          )),
      },
      {
        id: 'attended',
        accessorFn: attendedCount,
        meta: { label: 'Checked in', tone: 'numeric' },
        sortFn: (a, b) =>
          attendedCount(a.original) - attendedCount(b.original) ||
          a.original.members.length - b.original.members.length,
        cell: ({ row }) => `${attendedCount(row.original)}/${row.original.members.length}`,
      },
    ],
    [],
  );
  const participantTable = useAdminTable(
    participantMatches,
    participantCols,
    'fullName',
    participantId,
  );
  // Once the teams are finalized, staff look them up by table number.
  const teamTable = useAdminTable(
    teamMatches,
    teamCols,
    teams.some((team) => team.number !== null) ? 'number' : 'name',
    teamId,
  );

  const isParticipants = tab === 'participants';
  const shown = isParticipants
    ? participantTable.getRowModel().rows.length
    : teamTable.getRowModel().rows.length;
  const inFilter = isParticipants ? participantsInFilter.length : teamsInFilter.length;

  return (
    <main className="admin-main">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <div className="admin-heading">
          <div>
            <h1 className="admin-title">Check-in</h1>
            <p className="mt-2 text-sm text-whd-text-muted">
              {`Only teams with ${MIN_TEAM_SIZE} to ${MAX_TEAM_SIZE} members are listed.`}
            </p>
          </div>
        </div>

        <div className="admin-stats admin-checkin-stats">
          <StatCard
            label="Eligible participants"
            value={participants.length}
            breakdown={`${presentCount} in / ${participants.length - presentCount} not yet`}
          />
          <StatCard
            label="Eligible teams"
            value={teams.length}
            breakdown={`${statusCounts.ready} ready / ${statusCounts.partial} partial / ${statusCounts['no-show']} no-show`}
          />
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
              value={isParticipants ? participantQuery : teamQuery}
              onChange={(e) =>
                isParticipants ? setParticipantQuery(e.target.value) : setTeamQuery(e.target.value)
              }
              aria-label={
                isParticipants ? 'Search name, email, team…' : 'Search team, captain, member…'
              }
              placeholder={
                isParticipants
                  ? 'Search by name, IIN, phone or team…'
                  : 'Search team, captain, member…'
              }
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="admin-controls">
            {isParticipants ? (
              <>
                <ColumnToggleBar table={participantTable} />
                <Segmented
                  label="Filter"
                  value={participantFilter}
                  onChange={setParticipantFilter}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'attended', label: 'Checked in' },
                    { value: 'not-attended', label: 'Not checked in' },
                  ]}
                />
              </>
            ) : (
              <>
                <ColumnToggleBar table={teamTable} />
                <Segmented
                  label="Filter"
                  value={teamFilter}
                  onChange={setTeamFilter}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'ready', label: 'Ready' },
                    { value: 'partial', label: 'Partial' },
                    { value: 'no-show', label: 'No-show' },
                  ]}
                />
              </>
            )}
          </div>

          <p className="admin-count">{`${shown} of ${inFilter}`}</p>

          <div className="admin-table-wrap" role="region" aria-label="Columns" tabIndex={0}>
            <TabsContent value="participants">
              <AttendanceActionsContext value={attendanceActions}>
                <AdminDataTable table={participantTable} variant="checkin" />
              </AttendanceActionsContext>
            </TabsContent>
            <TabsContent value="teams">
              <AdminDataTable table={teamTable} variant="checkin" />
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
