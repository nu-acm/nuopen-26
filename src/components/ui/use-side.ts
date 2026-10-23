"use client";

import { useEffect, useSyncExternalStore } from "react";

import { sideStore, type SideState } from "@/lib/side";

const SERVER: SideState = { side: "light", music: true };

export function useSide<T>(select: (s: SideState) => T): T {
  return useSyncExternalStore(
    sideStore.subscribe,
    () => select(sideStore.get()),
    () => select(SERVER),
  );
}

/** Loads the saved side and music choice once, after hydration. */
export function SideSync() {
  useEffect(() => sideStore.hydrate(), []);
  return null;
}
