export type Side = "dark" | "light";
export type SideState = { readonly side: Side; readonly music: boolean };

export const SIDE_KEY = "nuopen:side";
export const MUSIC_KEY = "nuopen:music";

// Runs inline in <head> so the saved side is painted before React hydrates.
export const SIDE_SCRIPT = `try{var s=localStorage.getItem("${SIDE_KEY}");if(s==="light"||s==="dark")document.documentElement.dataset.side=s}catch(e){}`;

const INITIAL: SideState = { side: "dark", music: true };

let state: SideState = INITIAL;
const listeners = new Set<() => void>();

function set(next: SideState) {
  if (next.side === state.side && next.music === state.music) return;
  state = next;
  listeners.forEach((l) => l());
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the choice still holds for this visit.
  }
}

function recall(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function paint(side: Side) {
  if (typeof document !== "undefined") document.documentElement.dataset.side = side;
}

export const sideStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  hydrate() {
    const saved = recall(SIDE_KEY);
    const music = recall(MUSIC_KEY);
    const side = saved === "light" || saved === "dark" ? saved : state.side;
    paint(side);
    set({ side, music: music === "off" ? false : state.music });
  },
  choose(side: Side) {
    remember(SIDE_KEY, side);
    paint(side);
    set({ ...state, side });
  },
  toggleMusic() {
    remember(MUSIC_KEY, state.music ? "off" : "on");
    set({ ...state, music: !state.music });
  },
  /** A pause the page makes (a missing file), for this visit only. */
  setMusic(music: boolean) {
    set({ ...state, music });
  },
  reset() {
    state = INITIAL;
    listeners.clear();
  },
};
