"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

import { INTRO_DONE, INTRO_TITLE } from "@/lib/intro";
import { sideStore, type Side } from "@/lib/side";

import { useSide } from "./use-side";

// shortcut: the film scores are Lucasfilm's and kept out of git (public/audio is ignored); ship licensed tracks before going public.
export const TRACKS: Record<Side, string> = { dark: "/audio/imperial-march.m4a", light: "/audio/main-theme.m4a" };
const VOLUME = 0.22;
const FADE_S = 1.2;
const CUE_FADE_S = 0.15;
// Silence before each score's first note, measured with ffmpeg silencedetect at -40 dB (23 Oct 2026).
export const FIRST_NOTE: Record<Side, number> = { dark: 0.19, light: 0.67 };
// Browsers refuse sound until the first click, tap or key press; pointerdown unlocks a mouse but not a finger.
const GESTURES = ["pointerup", "keydown"] as const;

// iOS ignores HTMLMediaElement.volume (always 1), so the level lives on a Web Audio gain node instead.
type Track = { audio: HTMLAudioElement; gain: GainNode; level: number };

let context: AudioContext | undefined;

function audioContext() {
  if (!context) {
    const ctx = (context = new AudioContext());
    // iOS suspends Web Audio again after a call or a lock; any later tap brings it back.
    GESTURES.forEach((e) => addEventListener(e, () => ctx.state !== "running" && void ctx.resume()));
  }
  return context;
}

function createTrack(side: Side): Track {
  const ctx = audioContext();
  const audio = Object.assign(new Audio(TRACKS[side]), { loop: true, onerror: () => sideStore.setMusic(false) });
  const gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
  return { audio, gain, level: 0 };
}

function fade(track: Track, level: number, duration: number, onComplete?: () => void) {
  gsap.to(track, { level, duration, overwrite: true, onUpdate: () => void (track.gain.gain.value = track.level), onComplete });
}

function fadeOut(track: Track) {
  fade(track, 0, FADE_S, () => track.audio.pause());
}

function fadeIn(track: Track, duration = FADE_S * 2): Promise<void> {
  void context?.resume();
  if (track.audio.error) track.audio.load();
  if (track.audio.paused) track.level = track.gain.gain.value = 0;
  fade(track, VOLUME, duration);
  return track.audio.play();
}

/** Background score: the Imperial March on the dark side, the Main Theme on the light side. */
export function Soundtrack() {
  const side = useSide((s) => s.side);
  const on = useSide((s) => s.music);
  const tracks = useRef<Partial<Record<Side, Track>>>({});

  useEffect(() => {
    if (!on || !sideStore.get().music || sideStore.get().side !== side) return;
    let track: Track;
    try {
      track = tracks.current[side] ??= createTrack(side);
    } catch (error) {
      console.warn("Music disabled: Web Audio is unavailable", error);
      sideStore.setMusic(false);
      return;
    }
    let live = true;
    const stopWaiting = () => GESTURES.forEach((e) => removeEventListener(e, retry));
    const wait = () => live && GESTURES.forEach((e) => addEventListener(e, retry));
    const start = () => void fadeIn(track).catch(wait);
    const retry = () => {
      stopWaiting();
      start();
    };
    const cue = () => {
      track.audio.currentTime = FIRST_NOTE[side];
      fadeIn(track, CUE_FADE_S).catch(wait);
    };
    if (document.documentElement.dataset.intro === "1") {
      addEventListener(INTRO_TITLE, cue, { once: true });
      addEventListener(INTRO_DONE, start, { once: true });
    } else start();
    return () => {
      live = false;
      stopWaiting();
      removeEventListener(INTRO_TITLE, cue);
      removeEventListener(INTRO_DONE, start);
      fadeOut(track);
    };
  }, [on, side]);

  useEffect(() => () => Object.values(tracks.current).forEach((t) => t?.audio.pause()), []);
  return null;
}
