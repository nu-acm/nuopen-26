# NU Open 2026 · Landing brief

The contract for everyone building this page. Read it before touching code.

## 1. Concept: "Episode VII: The Code Awakens"

NU Open 2026 is the **7th** annual ICPC-style contest by ACM@NU, so the site is
**Episode VII**. The page plays like the opening of a Star Wars film and ends at
registration.

- **Story.** "A long time ago in a galaxy far, far away…" → the NU OPEN logo
  recedes into the stars → the yellow crawl tells what NU Open is → you choose a
  side → hyperspace (the Star Destroyer jumps) → the mission briefing (the Death Star
  in a targeting reticle) gives the facts → the flight
  plan (schedule) → Vader (or Anakin, on the light side) guards the rules → the archives (FAQ)
  → the trench run, a TIE fighter diving in (final call to register).
- **Mechanic.** *Choose your side.* Light side = saber blue + the Main Theme.
  Dark side = saber red + the Imperial March. The choice re-tints the whole page
  (`html[data-side]`) and switches the music. Default: **light**; a visitor's
  choice is remembered.
- **Spine.** A slow starfield drifts behind every section; it streaks into
  hyperspace only in the jump section. A lightsaber blade along the top is the
  progress bar.

### Voice

Plain English first, a Star Wars wink second. Short sentences. The facts must be
clear even to someone who has never seen the films.

Reference phrases: "Five hours. One problem set." · "Choose your side" ·
"Turn off your targeting computer" · "Stay on target" · "The answers you seek".

Never: fake Yoda grammar in real information, "may the force be with you" on a
button, puns that hide a date or a rule.

## 2. Content

All facts live in `src/content/event.ts`. No dates, numbers or copy in components.
Values marked `// placeholder` there are still to be confirmed by ACM@NU.

## 3. Sections (world name · plain purpose)

| # | id | World name | Purpose | 3D |
|---|---|---|---|---|
| 0 | `intro` | Opening | "A long time ago…", logo recede (first visit per session) | — |
| 1 | `top` | Title card | name, date, place, countdown, Register | Star Destroyer flies over |
| 2 | `crawl` | The crawl | what NU Open is, as the yellow crawl | — |
| 3 | `side` | Choose your side | the theme + music switch | Luke's saber ignites |
| — | — | Jump to lightspeed | the one hyperspace jump, scroll-driven | Star Destroyer, centred |
| 4 | `briefing` | Mission briefing | when, where, who, format, cost | Death Star, real model in a reticle |
| 5 | `record` | Previous episodes | 2,100+ / 800+ / 10+ / 6 editions, last year's photo | — |
| 6 | `bounty` | The reward | prize pool | — |
| 7 | `schedule` | Flight plan | key dates + the day's agenda | — |
| 8 | `rules` | Imperial / Jedi code | the five rules | Vader (dark), Anakin (light) |
| 9 | `allies` | Allies | partners by year + "become a partner" | — |
| 10 | `faq` | The archives | FAQ | — |
| 11 | `register` | Trench run | final call to register | TIE fighter diving in |
| — | footer | — | contacts, a link to the 3D model credits page | — |

## 4. Design system

Tokens are in `src/app/globals.css`. Use them; no new colours without a reason.

| Token | Value | Job |
|---|---|---|
| `--space` | `#03040a` | page background |
| `--space-2` | `#090c15` | raised surfaces |
| `--ink` | `#ece9e1` | main text |
| `--ink-2` | `#b0ada4` | secondary text |
| `--ink-3` | `#8a877f` | labels, captions (≥ 4.5:1 on `--space-2`) |
| `--line` | `rgb(236 233 225 / .12)` | hairlines |
| `--crawl` | `#ffe81f` | the crawl, the logo outline, the prize — **only** |
| `--holo` | `#5cd6ff` | "A long time ago…", the hyperspace caption |
| `--saber` | side-dependent | accent: buttons, focus, active states |
| `--saber-glow` | side-dependent | glow around `--saber` |

`--saber` is `--blade-dark` (`#ff3131`) on the dark side and `--blade-light`
(`#3ea8ff`) on the light side. Never hard-code either; read the token so the side
switch works.

### Fonts (each with one job)

Chosen on 23 Oct after a side-by-side render of six pairings (the first set read as a heavy template).

- **Display**: Jost (a Futura revival), weight 500–600, uppercase, tracking 0.04em.
  Class `.font-display`. Film title-card feel: airy and cinematic, not shouting.
- **Text**: IBM Plex Sans 400–600. Body copy, answers, notes. Default on `body`.
- **Data**: IBM Plex Mono 400–500, for numbers, times, labels, kickers. Class `.font-mono`.
- **Wordmark only**: Archivo Black Expanded outline (`.font-logo`), for the NU OPEN logo.
- **Crawl only**: News Cycle 700, a News Gothic revival like the film's crawl.

### Type scale

| Name | Size | Use |
|---|---|---|
| `title` | `clamp(3.5rem, 13vw, 12rem)` | hero logo only |
| `h2` | `clamp(2.125rem, 4.6vw, 4.5rem)` | section titles |
| `h2-xl` | `clamp(2.5rem, 6.4vw, 6rem)` | the choice, the reward, the final call only |
| `h3` | `clamp(1.25rem, 2vw, 1.75rem)` | card titles |
| `lead` | `clamp(1.125rem, 1.6vw, 1.375rem)` | intro paragraphs |
| `body` | `1.0625rem` | text |
| `label` | `0.75rem` mono, tracking .14em, uppercase | kickers, captions |

### Shapes

- No rounded "SaaS cards". Panels are hairline rectangles (`1px var(--line)`)
  with small corner ticks (`.hud` class) like a targeting display.
- Buttons: `.btn` (saber: solid `--saber`, white text, glow on hover) and
  `.btn-ghost` (hairline). Height 48px, uppercase mono label.
- Section layout: `.section` = `max-width 1240px`, side padding `clamp(16px, 4vw, 48px)`,
  vertical padding `clamp(72px, 10vh, 140px)`.
- Two-column sections use `.split` (12 columns from 1024px): `.split-copy` on 1–5,
  `.split-main` on 7–12, so every split lands on the same x.
- Kickers number themselves (`01 —— Choose your side`) with a CSS counter in `main`.

## 5. Motion

- **One hero moment per section.** Everything else is ambient.
- **Reveal**: text enters with `y: 24 → 0`, `opacity 0 → 1`, 0.8s, `power3.out`,
  stagger 0.06s, once, when its top hits 85% of the viewport. Use `reveal()` in
  `src/components/motion/reveal.ts`.
- **Scroll-linked** pieces (crawl, Destroyer flyover, TIE dive) use
  GSAP ScrollTrigger with `scrub`, never time-based loops tied to scroll.
- **Reduced motion**: every animation must have a static end state. Pinned
  sections still read top to bottom; the crawl becomes a flat block.
- **3D stages** render only while on screen (`useStage`), and fall back to a
  still poster or nothing if WebGL fails. The page must be complete without 3D.

## 6. Hard rules

- Mobile first. Check 390px and 1440px. No sideways scroll, no clipped text.
- No emoji as icons. Inline SVG only.
- Every interactive element is keyboard-reachable with a visible focus ring.
- Contrast: body text ≥ 4.5:1 on `--space`.
- Model credits (licence requirement) live on `/credits`, linked from the footer.

## 7. Code conventions

- Next 16 App Router, React 19, Tailwind 4 utilities + tokens, GSAP + Lenis, three.js.
- One section per file in `src/components/sections/`. Under 200 lines each.
- Pure logic goes in `src/lib/` with a `*.test.ts` beside it (Vitest). Test
  names start with "should".
- Components use `"use client"` only when they need the browser.
