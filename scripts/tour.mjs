// Tours the landing section by section like a visitor and saves one viewport shot per stop.
// node scripts/tour.mjs <prefix> <width> <height> [light]
import { chromium } from "@playwright/test";

import { holdBrowserLock } from "./lock.mjs";

await holdBrowserLock();

const [prefix, w, h, light] = process.argv.slice(2);
const STOPS = ["top", "crawl:0.45", "side", "briefing", "record", "record:0.6", "bounty", "schedule", "schedule:0.55", "rules", "rules:0.6", "allies", "faq", "register", "footer"];
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => sessionStorage.setItem("nuopen:intro-seen", "1"));
if (light) await ctx.addInitScript(() => localStorage.setItem("nuopen:side", "light"));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto("http://localhost:3300/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
let i = 0;
for (const stop of STOPS) {
  const [id, frac = "0"] = stop.split(":");
  await page.evaluate(([id, frac]) => {
    const el = id === "footer" ? document.querySelector("footer") : document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    const target = top + (el.offsetHeight - innerHeight) * Number(frac);
    // Walk there so scroll-triggered reveals fire on the way.
    const from = scrollY;
    for (let k = 1; k <= 8; k++) window.scrollTo(0, from + ((target - from) * k) / 8);
  }, [id, frac]);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `shots/review/${prefix}-${String(i++).padStart(2, "0")}-${id}.png` });
}
console.log(`${prefix}: ${i} stops`, errors.length ? `\nerrors:\n${errors.slice(0, 8).join("\n")}` : "no console errors");
await browser.close();
