import { useCallback, useEffect, useState } from 'react';
import { useAdminHeaderControls } from '@/lib/admin-header-context';

/** Throttle manual refreshes: each one reads every participant row from D1. */
const COOLDOWN_MS = 30 * 1000;
const COOLDOWN_ON_FAIL_MS = 10 * 1000;

/** Puts a "Refresh" button with a cooldown into the admin header for this page. */
export function useAdminRefresh(refetch: () => Promise<{ isError: boolean }>, isFetching: boolean) {
  const { setHeaderControls, resetHeaderControls } = useAdminHeaderControls();
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (cooldownUntil === 0) return;
    const tick = () => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setSeconds(Math.max(0, left));
      if (left <= 0) setCooldownUntil(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const onRefresh = useCallback(async () => {
    if (seconds > 0 || isFetching) return;
    const result = await refetch();
    setCooldownUntil(Date.now() + (result.isError ? COOLDOWN_ON_FAIL_MS : COOLDOWN_MS));
  }, [isFetching, refetch, seconds]);

  useEffect(() => {
    setHeaderControls({ onRefresh, isRefreshing: isFetching, refreshCooldownSeconds: seconds });
  }, [onRefresh, isFetching, seconds, setHeaderControls]);

  useEffect(() => resetHeaderControls, [resetHeaderControls]);
}
