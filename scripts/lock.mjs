// One headless browser at a time across parallel agents: the laptop overheats with several SwiftShader browsers.
import { mkdirSync, rmSync, statSync } from "node:fs";

const LOCK = new URL("../shots/.browser-lock", import.meta.url);
const STALE_MS = 180_000;

export async function holdBrowserLock() {
  mkdirSync(new URL("../shots/", import.meta.url), { recursive: true });
  for (;;) {
    try {
      mkdirSync(LOCK);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        if (Date.now() - statSync(LOCK).mtimeMs > STALE_MS) rmSync(LOCK, { recursive: true, force: true });
      } catch {
        // Another process released it between the checks.
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  const release = () => rmSync(LOCK, { recursive: true, force: true });
  process.on("exit", release);
  process.on("SIGINT", () => process.exit(130));
}
