// Screenshot helper. node scripts/shot.mjs <name> <width> <height> "<steps>" [url]
// steps (comma-separated): wN wait ms · sY scroll to px or "%" · #id scroll element into view · p screenshot · full full-page · skip skip the intro · light switch to the light side
// Writes shots/<name>-<n>.png and prints horizontal overflow and console errors.
import { chromium } from "@playwright/test";

import { holdBrowserLock } from "./lock.mjs";

await holdBrowserLock();

const [name, w, h, plan, url = "http://localhost:3300/"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
const steps = plan.split(",");
if (steps.includes("skip") || !url.endsWith(":3300/")) await ctx.addInitScript(() => sessionStorage.setItem("nuopen:intro-seen", "1"));
if (steps.includes("light")) await ctx.addInitScript(() => localStorage.setItem("nuopen:side", "light"));
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => m.type() === "error" && logs.push("error: " + m.text()));
page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await page.goto(url, { waitUntil: "domcontentloaded" });
let n = 0;
for (const st of steps) {
  if (st === "skip" || st === "light") continue;
  if (st[0] === "w") await page.waitForTimeout(+st.slice(1));
  else if (st[0] === "s") {
    await page.evaluate((y) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo(0, y.endsWith("%") ? (max * parseFloat(y)) / 100 : +y);
    }, st.slice(1));
    await page.waitForTimeout(900);
  } else if (st[0] === "#") {
    await page.evaluate((id) => document.querySelector(id)?.scrollIntoView(), st);
    await page.waitForTimeout(1200);
  } else if (st === "p") await page.screenshot({ path: `shots/${name}-${n++}.png` });
  else if (st === "full") await page.screenshot({ path: `shots/${name}-full.png`, fullPage: true });
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(`${name}: ${n} shots, horizontal overflow ${overflow}px`);
if (logs.length) console.log(logs.slice(0, 10).join("\n"));
await browser.close();
