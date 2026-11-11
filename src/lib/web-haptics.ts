import type { WebHapticsOptions } from 'web-haptics';

/** Shared options for `useWebHaptics`, so every screen buzzes the same way. */
export const webHapticsOptions: WebHapticsOptions = {
  debug: false, // Set to true to log haptic events on devices without vibration.
  showSwitch: false, // true renders the library's on/off toggle
};
