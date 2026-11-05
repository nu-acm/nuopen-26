# NUOPEN landing/account UI + WHD backend handoff

The original NUOPEN landing, copy and Dark/Light Force experience remain connected to WHD. The latest request adds full localization, matching white navbar actions and wider translated text layouts to the migrated landing/account UI. Read the newest MIGRATION_NOTES.md section before older numbered-stage reports.

## Current request completed — full localization, white navbar actions and longer copy

The landing now translates all page/intro/control/accessibility/metadata copy to EN/RU/KK; keep brand/institution/artist/track names, contacts, numeric facts and URLs intact. Original English is the EN reference. This replaces older English-only instructions below. Canonical EVENT and all source assets/actors remain unchanged. The new flat landing namespace lives in `src/i18n/landing/`; `use-landing-text.ts` uses original English message IDs with existing i18next. The saved locale drives the whole document/page and existing account pages.

Both navbar actions are matching white buttons: My team (or the existing registration/profile state) on the landing, Back to the story in the account. Preserve the landing order on both: Force/music → languages → white action. At narrow widths language/action controls stay visible in a shared second row, with matching sizing/coordinates. Do not revert to grey text links, reverse that order or hide only the landing language selector in its menu. Keep the existing source menu/section links and WHD route/auth behavior.

RU/KK text columns were widened (rules/partners/FAQ/final call and personal data), with phone fallbacks for long text. Keep Cyrillic words whole; do not shorten translations or introduce letter-by-letter wrapping. PilotName is plain text with a brief opacity fade; the user rejected the earlier digit/letter reels. Keep reduced-motion support and the real name accessible.

Latest validation: `vp check` clean, builds succeed, 43 server tests, 43/60 browser cases pass; 17 timed out (see the final log). Diagnostic recheck with one worker: 17 passed. There were 3 passing layout audit cases (27 landing viewports, 12 cross-route navbar comparisons, 75 other-page layouts). The isolated layout audit disables unchanged 3D hosts only in test CSS/data-saver mode; the default suite uses real models. Read final logs for native timing/failure limits. All backend/API/database files, reference source, canonical EVENT, copied assets/actors and dependency/build/test configuration are preserved. See MIGRATION_NOTES.md and `output/navbar-localization/` for exact files, screenshots and integrity results.

## Earlier polish — colours, longer translations and pilot-name animation

Language selection/focus follows the Force accent (red Dark, blue Light). Shared WHD buttons wrap within their available width; team destructive controls have padding; account tabs, title/counter, long button text and RU/KK phone greetings adapt to longer copy. `dashboard/PilotName.tsx` provides staggered prize-style letter reels with stable natural glyph widths, a single accessible name and immediate live reduced-motion support. No source landing, backend, route, validation, dependency or runner config changed.

Current verification: clean `vp check`, successful build, 43 server tests, 8 focused account cases, 53/54 default E2E cases (the unchanged desktop landing FAQ scroll/click timeout remains), plus 2 layout audits covering 78 locale/viewport/route combinations. Both full runs encountered the unchanged desktop landing FAQ scroll/click timeout, including the second run without concurrent visual audits. The same case passes alone within its original 30-second budget (27.1s); the parallel-suite timeout remains unresolved. Logs/traces are retained. Timeouts/workers/retries/assertions were not changed. See the newest MIGRATION_NOTES.md section and `output/force-label-polish/` for current files, screenshots and preservation reports. Prior counts below describe earlier stages.

## Account-tab migration — completed before the latest polish

The current participant shell now mirrors NUOPEN's account header and has **My team** (`/dashboard`) and **Personal data** (`/onboarding`) tabs. Back-to-landing is visible on desktop/mobile; Force/music/language controls remain. Email/CV/sign-out belong to Personal data; participant sign-out is absent from team/header views. First-time onboarding does not expose CV until a profile exists; closed profiles retain frozen CV status/sign-out. All WHD profile/team/CV/contest/auth actions remain connected. Organiser sign-out remains role-specific.

Dashboard presentation now uses the source greeting/event summary, roster/counter and separate create/join cards, readiness checklist and mission sidebar. Do not import NUOPEN-only rename/transfer/code-rotation or its backend. Current brand is NU Open across headers/login/metadata/legal/FAQ/manifest/browser/share assets; preserve internal identifiers and existing service/domain URLs.

Key files: `AccountShell.tsx`, `AuthHeader.tsx`, new `AccountSignOut.tsx`, dashboard components, `routes/_protected/dashboard.tsx`, `routes/onboarding.tsx`, `OnboardingForm.tsx`, `ui/auth-card.tsx`, new `styles/account-dashboard.css`, localized account keys, branding assets and new `tests/e2e/account-shell.spec.ts`. See the newest MIGRATION_NOTES.md section and `output/dashboard-personal-tabs/changed-files.json` for all changes.

Account-tab migration checks: formatting/lint/types clean; 43 server tests; all 50 default two-worker E2E cases and 4 extended source/responsive/brand audit cases pass. Existing assertions/timeouts/retries/workers were not relaxed. The old monolithic landing content/viewport case was split into two focused cases, and the mail-failure test now waits for the existing native inert hydration guard before synthetic fill. The actual original landing module/assets were not changed.

Integrity: all 183 NUOPEN source files unchanged; dashboard backend handlers, profile save and form-validation bodies unchanged. Of 39 backend/library/API files, only three brand strings changed (`auth.ts`, `auth.server.ts`, AI prompt); other 36 unchanged. Profile GET only gains session email/CV presence. Package/lock/build/test configuration unchanged; no new dependencies. UI branding/localization labels were updated, not eligibility/consent/deadline/data rules.

Latest artifacts are under `output/dashboard-personal-tabs/`: check/server/build/E2E/visual logs, source/hash/file reports, EN/RU/KK responsive/source-style comparisons and desktop/mobile screenshots. Earlier migration reports below remain useful history; current account/brand verification supersedes their earlier counts/translation-unchanged statements.

## Repositories and boundaries

- Target: `/Users/zhassulanpermegali/ACM/nuopen-26/whd-2026`.
- Read-only source: `/Users/zhassulanpermegali/ACM/nuopen-26/nu-open-26`. Never edit it or run Next dev/build there.
- WHD owns all backend/auth/API/database/validation/business behavior and existing application routes. NUOPEN now supplies the actual landing composition AND original English marketing text/event display data, not only styling.
- Do not restore the old WHD landing copy, remove the Force/story/audio experience or simplify the source page. Display content copied from NUOPEN does not change WHD backend team-size/age/consent/deadline rules.
- Preserve all prior uncommitted work in both repositories. No reset/stash/commit/push/deploy/remote migration was requested. Main pushes deploy/migrate production.
- Read WHD AGENTS.md and .agents/skills/shadcn/SKILL.md. Use vp. Keep Base UI, accessibility, token/component conventions and all six lint rules. Documentation changes are authorized only for requested MIGRATION_NOTES.md/prompt.md.
- This sandbox starts in NUOPEN; target writes/checks required automatically reviewed require_escalated calls. Never write the reference as a workaround.

## Current implementation

- `src/routes/index.tsx` retains the original WHD getLandingState/getFunnelState server logic and renders `src/components/landing/nuopen/components/landing.tsx`.
- `src/components/landing/nuopen/` contains the implemented source landing components/styles, original `content/event.ts`, visual math/helpers and framework adapters. No source server/account/auth/API implementation is present.
- Actual original sections: header, hero, episode crawl, Force choice, hyperspace, briefing, previous editions/photo, reward, flight plan, rules, allies, FAQ, final call, footer and intro. Original GSAP/Three/Lenis behavior is retained. Source Force preference updates red/blue palette, lightsaber, Imperial/Jedi copy, Vader/Anakin figure and music. Header/mobile switch, cards, mute and persistence are present.
- Root document includes source pre-paint side/intro scripts and shared SiteExperience. `data-app-locale`/the one-line i18n bootstrap bridge preserves WHD's saved account language while the source landing is English. Do not remove that separation: without it browser i18n caches the landing's English over RU/KK cookies.
- `components/ui/registration-link.tsx` is a WHD adapter, using existing NextStep and registration closure state. Guest → `/login`; pending profile → `/onboarding`; team state → `/dashboard`. All OTP/session/profile/team mutations use the existing WHD implementation. No new `/register` or `/profile` route was created.
- Next Link/Image/path APIs use TanStack/native equivalents. Source utility values are exact named utilities in `presentation.css`; keep responsive/pseudo/state variants on the call site (e.g. `lg:nu-grid-cols-...`). Moving breakpoint variants inside differently ordered named utilities broke the source 3-column hero and has been corrected/regression-tested.
- Six GLBs, four original audio files and the NU Open 2024 photo live under `public/nuopen/{models,audio,images}`. All 11 match source bytes. Credits text includes all model attribution and is linked from the unchanged source footer label. Original font copies/licenses remain.
- Only new correction dependency: Lenis 1.3.27 (same installed source version). Earlier Three 0.186.1 / GSAP 3.15.0 / @types/three 0.186.0 remain. Framework/build/deployment config unchanged.
- All other WHD pages and functionality remain from earlier stages. Old landing components are retained in the tree, no longer used by `/`. Existing account/admin/check-in/FAQ/legal functionality and RU/KK/EN translations remain. Source password/recovery/backend/business rules were not imported.

## Verification

- vp check passes; 43 server tests / 6 files pass.
- Default vp run test:e2e, including fresh production build: 44/44 pass on desktop/mobile, two workers, zero retries, existing timeout budgets.
- Separate serial actual-WebGL/static visual audit: 4/4 pass, including intro, original models, rendered red saber, Vader/Anakin swap, original photo and full source landing captures on both devices.
- All 183 source src files and 39 WHD backend/library/API files are unchanged. Original landing server/funnel functions and WHD validation translations remain while account/brand labels are updated. All 11 source visual assets match.
- Latest artifacts: output/nuopen-landing-restoration/{integrity.json,check.log,server-tests.log,e2e.log,original-motion.log,copied-source-files.json,utility-adapters.json,before/,scenes/}. The earlier baseline/stage2–6 artifacts are historical; their WHD-copy-only landing and earlier parallel timeout observations are superseded by this correction's current results.

## Tools and local startup

Node 24.21.0, pnpm 12.11.2, Vite+ 1.2.0. Installed toolchain is recorded in output/migration-baseline/toolchain.json. Shell default Node may be unsupported; use the pinned tools without changing project versions.

```sh
cd /Users/zhassulanpermegali/ACM/nuopen-26/whd-2026
export PATH="$(node -p 'require("./output/migration-baseline/toolchain.json").toolBin'):$PWD/node_modules/.bin:$PATH"
CLOUDFLARE_VITE_FORCE_LOCAL=true vp dev
```

Local URL: http://localhost:3000. The Cloudflare flag avoids the known remote AI preview authentication failure; it does not provide offline AI. Preserve .dev.vars and never print secrets, real OTPs or credentials.

```sh
vp check
vp test
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/nuopen-playwright vp run test:e2e
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/nuopen-playwright vp exec playwright test --config output/nuopen-landing-restoration/original-motion.config.ts
```

## Limits / next action

No additional migration stage is pending. Await a new user instruction. Existing non-blocking sourcemap/chunk advisories remain. Live mail/Drive/OAuth/AI, production services and physical devices/other browser engines were not exercised; local isolated D1/auth and boundary stubs only. No deployment, remote migration, commit or push was authorized/performed.
