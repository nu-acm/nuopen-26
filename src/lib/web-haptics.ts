import type { WebHapticsOptions } from 'web-haptics';

/** Shared options for `useWebHaptics`, so every screen buzzes the same way. */
export const webHapticsOptions: WebHapticsOptions = {
  debug: false, // true logs every trigger — handy on desktop, where nothing vibrates
  showSwitch: false, // true renders the library's on/off toggle
};
