# NU Open 2026 · Episode VII: The Code Awakens

Landing page for NU Open 2026, the 7th ICPC-style programming contest by ACM@NU
(Nazarbayev University, Astana, 7 November 2026). Star Wars theme; landing only.
Registration is a separate flow, linked from `EVENT.registerHref`.

## Run

```bash
npm install
npm run dev        # http://localhost:3300
npm run build && npm start   # production, same port
```

Tests: `npx vitest run <file>` for unit and component tests, `npx playwright test e2e/landing.spec.ts`
for the end-to-end flow (needs the server on :3300).

## Where things are

| What | Where |
|---|---|
| Every fact, date, number and FAQ answer | `src/content/event.ts` |
| Concept, design tokens, fonts, motion rules | `docs/brief.md` |
| Colour tokens and shared classes | `src/app/globals.css` |
| Page order | `src/components/landing.tsx` |
| One file per section | `src/components/sections/` |
| 3D actors (Star Destroyer flyover and jump, saber, Vader and Anakin, Death Star, TIE fighter) | `src/components/three/` |
| Starfield and hyperspace jump | `src/components/space/`, `src/lib/warp.ts` |
| Optimised models and the photo | `public/models/`, `public/images/` |

## To confirm before launch

These are placeholders in `src/content/event.ts`:

- **Key dates**: registration opens 23 Oct, closes 3 Nov, confirmation 5 Nov.
- **Agenda**: last year's running order (check-in 09:00, contest 11:00–16:00, closing 17:00).
- **`registerHref`**: `/register`, a page that does not exist yet. Until it does, the link lands on the themed 404 (`src/app/not-found.tsx`).

Also:

- **Site URL**: social previews resolve against `SITE_URL` (default `https://nuopen.nuacm.kz`, last year's domain).
  Set it in the server's environment if the domain changes.
- **Partner logos** are typeset wordmarks. Swap in SVG logos in `sections/allies.tsx` when you have them.
- **ACM chapter badge** in the footer is a redrawn SVG (`ui/acm-mark.tsx`). Check it against the official badge.
- **Music and effects** (`public/audio/`): the Imperial March on the dark side, the Main Theme on the light side.
  Clicking the TIE fighter fires `blaster.mp3`, clicking the lightsaber plays `saber-swing.mp3`. Muting silences all.
- **Replacing a model or track**: browsers keep `public/models/` and `public/audio/` for a day (`next.config.ts`),
  so give a changed file a new name (`saber-2.glb`) and update its path, or returning visitors keep the old one.
- **3D model licences**: the Death Star (CC BY-NC-ND) and Vader (CC BY-NC-SA) are non-commercial.
  That fits a free student event; credits are on `/credits`, linked from the footer, as the licences require.
  Anakin and the TIE fighter are CC BY 4.0: credit plus a note that they were changed, both on `/credits`.
  The Star Destroyer is under Sketchfab's Standard licence, which limits redistributing the file itself;
  a public site serves the `.glb`, so check that licence before launch.
