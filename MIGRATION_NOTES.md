# NUOPEN → WHD visual migration

## Full landing localization and consistent white navbar actions (2026-11-05)

This supersedes the earlier English-only landing and pilot-reel decisions. The latest user instructions require the whole page to change language except proper names, both account actions to be white, landing-order controls on both pages, and more room for long RU/KK text.

- Added 177 English/Russian/Kazakh landing messages through the existing i18next instance. English source text remains the message ID and English value. Every implemented landing section, FAQ/rules data, dates, times/countdown units and states, numbers, side/music/menu controls, intro, registration states, alt/accessibility labels and metadata now use the selected locale. Names such as NU Open, ChatGPT, EPAM, Codeforces, ACM@NU and official institutions/artists/track titles remain intact; original URLs, contacts, figures and canonical EVENT data are unchanged.
- Language selection is always available in the landing header, including narrow screens, and persists through reloads and the existing WHD login/account flow. Removed the old forced English document/page presentation language. Header/control locale still uses the existing cookie-backed SSR and per-router i18n instance; account validation translations remain unchanged.
- Landing My team/Register/My profile and account Back to the story use matching white buttons with identical typography, padding, footprint and Force-coloured glow. Both headers use the same order: Force/music tools, languages, then the white action. Narrow headers use the same two rows, stable button sizing and positions; language/action controls no longer move into a different order or hide in the landing menu. Landing-only section navigation and its menu remain functional, including Escape/focus restoration.
- Localized split columns are wider. Rules use seven text columns, partner copy eight, FAQ copy seven; their visual/secondary columns adapt alongside them. Final-call copy has more width, tiny translated Force cards stack, longer buttons/episode copy can wrap, and RU/KK personal-data headings have a wider column plus a phone scale. Headings wrap at spaces instead of splitting Cyrillic words into letters; no translation was shortened or hidden.
- Removed the numeric/letter pilot-name reels. The real name is plain text with a short 500ms opacity reveal, immediately static for reduced motion. Original source prize reels, Force/story/music and 3D actors/assets remain.

Validation: clean `vp check`; fresh production builds succeed; 43 server tests pass; final default two-worker/zero-retry E2E result: 43/60 browser cases pass; 17 timed out (see the final log). Diagnostic recheck with one worker: 17 passed. Separate layout audit: 3/3 pass, covering 27 EN/RU/KK landing viewports (320–1920px), matching navbar coordinates/styles in both routes at 12 locale/viewport combinations, and 75 account/profile/FAQ/privacy/terms layouts. Tests measure control clipping/overlap and individual Cyrillic word rectangles, not just page overflow. Final heading and white-header screenshots were inspected. The layout-only audit hides unchanged 3D stage hosts in a test stylesheet and uses the supported data-saver preference to avoid software-WebGL exhaustion; the permanent/full suite keeps real 3D/model loading. Runner configuration, existing timeout/retry/worker settings and existing functionality assertions remain unchanged. Development-only diagnostic failures and selector fixes are retained in the output history.

Integrity: all 183 reference source files and all 39 backend/library/API files remain unchanged; canonical EVENT, assets/fonts/audio/models, actor implementations, landing server route, package/lock/framework/build/runner config are unchanged. Message keys/placeholders match across all locales and protected names are checked. Only view/translation/metadata code changed. No dependencies, routes, tables, remote migrations, commit, push or deployment were added.

Files: added `src/i18n/landing/{en,ru,kk}.json`, `src/components/landing/nuopen/content/use-landing-text.ts`, `src/styles/navigation.css`, `tests/e2e/landing-localization.spec.ts`. Modified existing landing display components, presentation date/number helpers, account shell/header/profile-heading styling, pilot name, login/dashboard display dates, i18n resources, root view/metadata, affected account/metadata tests and the requested notes/handoff. Exact list: `output/navbar-localization/changed-files.json`.

Artifacts: `output/navbar-localization/` contains final check/build/server/E2E and layout audit logs, source/catalogue preservation reports, responsive/word/coordinate records and screenshots. Existing source CSS optimizer/sourcemap/Three size advisories remain; live providers, production and physical devices were not exercised.

## Force colours, translated controls and pilot readout (2026-11-05)

- The shared language switcher's selected text, selected background and keyboard focus now use the live Force accent. Dark side uses red, Light side blue; the original background and other source palette roles remain.
- Shared WHD buttons now cap themselves at the available width and wrap long labels. The existing dissolve/leave control has horizontal padding in idle, confirmation and loading states. Account navigation can wrap, the roster heading/count can use separate rows, long form-button text can shrink, and RU/KK welcome headings scale down on narrow phones. No translation was shortened or hidden and no control was removed.
- Added `dashboard/PilotName.tsx`: the first-name greeting rolls through staggered readout reels, like the existing prize-pool effect, before locking onto the real name. Each grapheme keeps its final natural width; Cyrillic, Kazakh and combining characters are retained. Screen readers receive the real name once. CSS handles the effect without a dependency or recurring JS work; reduced motion immediately shows the final letters, including when the preference changes while the effect runs.
- All 39 backend/library/API files, every route, the restored source landing/assets, package/lock/build/runner config and all 183 reference source files remain unchanged by this polish. Original confirmation, sign-out, registration, validation, team/CV/contest and role/deadline behavior are preserved.

Files: modified `src/styles/{components,design-system,account,account-dashboard}.css`, `src/components/dashboard/DashboardLayout.tsx`, `tests/e2e/account-shell.spec.ts` and the requested notes/handoff; added `src/components/dashboard/PilotName.tsx`. Full manifest and preservation results are in `output/force-label-polish/{changed-files,integrity}.json`.

Verification: `vp check` clean; production build succeeds; 43/43 server tests; 8/8 focused desktop/mobile account cases; default two-worker, zero-retry E2E run 53/54, with one unchanged landing FAQ scroll/click timeout. Two separate layout audits pass across 78 EN/RU/KK viewport/route combinations: populated team/personal pages at 320–1440px, login and organiser/check-in pages. Button text is measured inside the control as well as against viewport bounds; the permanent regressions also check idle/armed translated actions, red/blue selection and live reduced-motion behavior. Final RU desktop/phone captures were visually reviewed.

Both full runs had 53/54 passing: the unchanged desktop landing FAQ test timed out during scroll/click, including a rerun without a separate browser audit running alongside it. The same case passes in isolation with its existing 30-second budget (27.1s), as recorded in `isolated-faq.log`. The parallel-suite timeout remains unresolved and is not counted as a pass. The first log/trace are preserved under `output/force-label-polish/initial-*`; no source landing code, browser timeout, worker/retry setting or existing assertion was changed. Existing build sourcemap/Three size advisories remain. Tests use isolated local services; no production or live-provider checks, commit, push or deployment were performed.

## NUOPEN dashboard, account tabs and branding (2026-11-05)

### Current result

- Participant pages now have NUOPEN's compact account header: NU Open/VII branding, the existing shared Dark/Light and music controls, a visible back-to-landing link and the retained RU/KK/EN language switcher. Removed the old WHD logo, email and sign-out from the participant header, and moved help links into the footer. The two-line phone layout keeps Back to the story available; at 400px and below the decorative VII is hidden so the original wordmark stays on one line.
- Added source-style numbered account navigation with exactly two route-backed tabs: My team (`/dashboard`) and Personal data (`/onboarding`). These are existing routes; browser history, keyboard navigation and direct links work normally. No NUOPEN `/profile` route or backend was introduced.
- Dashboard/team presentation follows the actual reference: coloured first-name greeting, event summary, separate create/join HUD panels, source roster/count/badge treatment and a flight-readiness checklist/mission sidebar. WHD's exact-three-member eligibility, captain permissions, invite slugs, create/join/kick/leave/disband, AI controls, contest credentials and closed-registration behavior remain unchanged. No unsupported source rename/transfer/code-rotation action was added.
- Personal data uses the existing profile form and save flow, with a verified read-only email display and source heading/help composition. Every WHD IIN/guardian/education/consent/document field and validation remains. Existing CV upload/delete/status controls now live here, only after a participant profile exists; existing server guards and the PDF size/type/Drive flow remain. Read-only CV status remains available after closure.
- Participant sign-out now appears only in the Personal data body, including first-time or closed-registration personal views. It uses the existing WHD auth client and confirmation behavior, with pending/error feedback. Team/invitation pages link to Personal data instead of exposing header sign-out. Existing organiser sign-out remains available in its own role-specific header.
- Replaced remaining app-facing WHD event/organiser names in account/admin headers, login copy, page titles, legal/FAQ names, translations, manifest and auth display names. Browser/install icons and the social-preview image now use NU Open artwork generated from the already copied, licensed Archivo/Jost font outlines. Internal WHD component names, existing service/document URLs, deployment domain and business rules remain unchanged.
- NUOPEN remains untouched. The restored original landing module and its copied fonts/models/audio/photo remain byte-for-byte unchanged by this account task. No dependencies, tables, routes, build configuration, runner limits, remote migrations or deployments were added.

### Verification

- `vp check`: pass, formatting/lint/types clean, all six shadcn rules retained.
- `vp test`: 43/43 tests in six files pass.
- Default `vp run test:e2e`: fresh production build and all 50 desktop/mobile browser cases pass, with the existing two workers, zero retries and timeout budgets.
- Extended source/responsive/branding audit: 4/4 cases pass. Covers participant team/personal views in EN/RU/KK at 320, 390, 680, 768, 900, 1440 and 1920px, organiser headers at narrow/wide widths and public login/FAQ/legal branding. No page overflow, clipped controls, undersized buttons or header overlaps. Source comparisons cover header geometry, account navigation, welcome typography, dashboard grid and readiness padding. Fresh empty/populated-team and personal-data captures were visually inspected.
- New permanent regressions verify two active-route tabs, profile save persistence, read-only email, CV placement, profile-only sign-out, first-time profile restrictions, Force controls, back-to-landing navigation and session clearing. Existing CV, team, consent, guardian, deadline, metadata, admin/check-in and contest/export scenarios remain green.
- Initial test-only selector errors were corrected. A legacy combined landing copy/resize/photo scenario hit the parallel whole-test limit; it is now two focused cases with every content, layout and image assertion retained. The mail-failure case now observes the existing native hydration readiness before Playwright fills the form (Playwright fill can bypass inert). No application landing behavior, assertions, retry, worker or timeout setting was relaxed.
- Integrity checks: all 183 reference source files unchanged; 36/39 WHD backend/library/API files unchanged, with the remaining three limited to event-name strings in auth display names and the existing AI prompt. Dashboard server handlers, profile save handler and existing form state/validation are unchanged. Profile GET adds only session email/CV presence for presentation. Package/lock/framework/build/test configuration remain unchanged.

Changed files and preservation checks: `output/dashboard-personal-tabs/changed-files.json` and `integrity.json`. Added `src/components/AccountSignOut.tsx`, `src/styles/account-dashboard.css`, `tests/e2e/account-shell.spec.ts`. Modified existing account/header/dashboard/profile components and routes, brand strings/assets/locales, affected browser tests, these notes and `prompt.md`. Other migrations/unrelated working-tree changes are preserved.

Artifacts: `output/dashboard-personal-tabs/{check.log,server-tests.log,build.log,e2e.log,visual.log,integrity.json,changed-files.json,*-responsive.json,*-brand-headers.json,screenshots/,before/}`. Earlier interrupted/failed diagnosis logs are historical; use the final full-suite and visual logs above.

A final CSS-only correction places organiser header controls on a separate row at 400px and below; the subsequent production rebuild and all four extended audit cases pass. Existing non-blocking sourcemap/Three.js size advisories remain. Only isolated local Workers/D1/auth, external boundary stubs and Chromium desktop/mobile emulation were exercised. Live external services, production and physical devices were not tested; nothing was committed, pushed or deployed.

## Landing scope correction — original NUOPEN page restored (2026-11-05)

This supersedes the earlier decision to retain WHD landing copy and exclude the source Force/story/audio experience. The user's clarified instruction is to keep the NUOPEN landing page and connect WHD's existing backend. The target remains WHD; NUOPEN is untouched. Earlier numbered-stage reports below are historical and do not describe the current `/` page.

### Delivered

- `/` now renders NUOPEN's actual implemented landing composition and original English copy: header, NU OPEN wordmark, hero, episode crawl, Force choice, hyperspace, briefing, previous editions/photo, reward, flight plan, rules, allies, FAQ, final call, footer and opening intro.
- Both original Force controls are retained: header/mobile menu and full side-choice cards. Red/blue blade/accent colours, Imperial/Jedi copy, Vader/Anakin models, soundtrack selection, mute and saved preferences work together. Original scene actors, scrolling, reveals, warp, reading-progress blade, navigation transition and intro are retained.
- WHD's existing server loader/funnel, passwordless OTP, sessions, optional OAuth, profile/guardian/consent validation, team/invite permissions, deadlines, CV/AI, organiser/check-in, reports and all other routes remain WHD-owned. No NUOPEN backend, API, database, account forms, validation or authentication was imported.
- Registration links adapt the existing WHD NextStep/registration status: `/login`, `/onboarding` and `/dashboard`, with the existing registration closure behavior. Source `/register` and `/profile` application routes were not introduced. Page text/dates/prizes/rules are copied from NUOPEN as requested; these presentation values do not reconfigure WHD backend eligibility, team size or registration deadline.
- Source CSS is scoped to the landing. Its exact arbitrary utility values are expressed as named presentation utilities, retaining Tailwind responsive/pseudo/state variants in their original order. No shadcn rule was disabled. Next links/images/navigation use existing WHD/TanStack/native equivalents; the Next framework/build configuration was not imported.
- The landing stays English as in NUOPEN. `data-app-locale` keeps WHD's saved RU/KK/EN account locale separate from document presentation language, preventing the English landing from overwriting a visitor's locale cookie. The original landing restoration left translations unchanged; subsequent account/branding updates are described above. Existing mobile-menu Escape focus restoration is retained.
- All six original models, four audio files and the NU Open 2024 photo are available under `/nuopen/`; all 11 files match source bytes. Previously copied fonts/licenses remain. The existing credits text asset now includes the three additional model attributions; the source footer label is retained and points there, without inventing a new route.
- Added only Lenis 1.3.27, matching NUOPEN's installed version, for its original smooth-scroll/jump behavior. Existing Three/GSAP dependencies are reused. Framework/build/deployment config and backend secrets are unchanged.

### Files

Modified: `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/styles.css`, `src/i18n/index.ts`, `package.json`, `pnpm-lock.yaml`, `public/nuopen/models/CREDITS.txt`, `tests/e2e/landing.spec.ts`, `tests/e2e/metadata.spec.ts`, this notes file and `prompt.md`.

Added: `src/components/landing/nuopen/` (the implemented source landing's components/styles, display content and visual helpers plus framework/presentation adapters); `public/nuopen/models/{saber,anakin,vader}.glb`; `public/nuopen/audio/{imperial-march,main-theme}.m4a`; `public/nuopen/audio/{blaster,saber-swing}.mp3`; `public/nuopen/images/nuopen-24.jpg`.

The old WHD landing component files remain available but are no longer composed by `/`; no WHD-only application route was removed. The original WHD gallery and translated landing copy are intentionally absent from the replacement page because the clarified request is to retain NUOPEN's landing. WHD account/legal/FAQ translations and functionality remain available.

### Verification and limits

- `vp check`: pass; all formatting/lint/types clean, all six shadcn rules retained.
- `vp test`: 43 tests / 6 files pass.
- `vp run test:e2e`: fresh production build plus all 44 desktop/mobile cases pass with the default two workers, zero retries and existing timeouts.
- Separate serial real-WebGL audit: 4/4 cases pass. Verified and skipped the actual first-visit intro, rendered hero/lightsaber/death-star models, switched original Vader/Anakin rules figures, verified the rendered lightsaber shader turns red on the Dark side, checked the original image and captured normal-mode sections plus complete reduced-motion pages on both devices.
- Browser regressions verify original copy/FAQ data, actual 1/2/3-column hero breakpoints, no page overflow, mobile Escape focus, both Force controls, palette/rules synchronization, saved Force/music preferences, audio delivery and NUOPEN CTA → real local WHD OTP → profile → team flow. Existing admin/CV/contest/consent/deadline/localization cases remain green.
- Direct copy audit: the complete original EVENT data object is identical, and all 67 literal text nodes across the 14 source sections are unchanged.
- Integrity: all 183 reference `src` files checked unchanged, all 39 WHD backend/library/API files unchanged, existing landing server/funnel code unchanged, all WHD translations unchanged, all 11 source visual assets match reference bytes.
- Initial checks found and corrected responsive variant ordering and the English landing overwriting the saved account locale. Initial test runs also found an incorrect FAQ test locator and an overloaded combined control/persistence/screenshot scenario; those were corrected without raising timeouts/retries or changing worker settings. Screenshots/model checks now live in the separate visual audit; all source content is checked against the original data/text.
- Existing sourcemap/chunk-size build advisories remain. Only local isolated Workers/D1/auth with external-service boundary stubs and Chromium desktop/mobile emulation were used. Live mail/Drive/OAuth/AI, production services and physical devices were not exercised. No deployment, remote migration, commit or push was performed.

Artifacts: `output/nuopen-landing-restoration/` contains `integrity.json`, `content-integrity.json`, source/backend fingerprints, `copied-source-files.json`, `utility-adapters.json`, `check.log`, `server-tests.log`, `e2e.log`, `original-motion.log`, historical diagnostic logs, original file snapshots and `scenes/{desktop,mobile}/` captures. These latest results supersede the previous Stage 6 landing coverage and parallel-run limitation.

## Scope and approval gates

- Target: WHD-work, this repository (`whd-2026`).
- Visual reference: sibling `nu-open-26`; reference files must never be modified.
- WHD owns all functionality, authentication, validation, API requests, database interactions, routes, translations and integrations.
- NUOPEN owns the reference appearance for actually implemented, corresponding screens and components.
- WHD-only functionality stays available and receives consistent styling in later stages.
- Work one stage at a time. Stop after each numbered stage and wait for explicit approval.
- Maximum fidelity; no creative redesign, simplifying the reference, speculative features, architecture replacement or unnecessary refactoring.
- No production deployment, remote migrations or pushes are part of this work.

## Stage status

| Stage | Scope                                           | Status   |
| ----- | ----------------------------------------------- | -------- |
| 1     | Inventory, baseline, migration notes            | Complete |
| 2     | Shared design foundation                        | Complete |
| 3     | Shared shells and corresponding landing visuals | Complete |
| 4     | Registration and participant screens            | Complete |
| 5     | Organiser and remaining WHD surfaces            | Complete |
| 6     | Final coverage and regression review            | Complete |

## Stage 1 — baseline (2026-11-04)

### Completed

- Confirmed WHD started with a clean working tree on main.
- Re-enumerated route entry modules and component/helper files from the filesystem.
- Recorded both repositories' route/component inventory, Git state and SHA-256 source fingerprints in ignored `output/migration-baseline/source-inventory.json`.
- Confirmed WHD dependencies are not installed. The shell initially provides Node 26.9.0; WHD pins Node 24.21.0, pnpm 12.11.2 and Vite+ 1.2.0.
- Installed WHD's frozen lockfile with pinned Node 24.21.0, pnpm 12.11.2 and Vite+ 1.2.0. Registry connection resets required a temporary command-line public mirror override; repository configuration, package.json and pnpm-lock.yaml were unchanged. Tool identities are in ignored output/migration-baseline/toolchain.json.
- Ran the production build, formatting/lint/type checks, all 43 server tests and all 36 existing desktop/mobile browser cases successfully.
- Captured 52 full-page screenshots: 26 at 1440×900 and 26 at 390×844. Every discovered WHD page is covered, with additional OTP, new/edit profile, empty/populated team, invitation, missing-page, closed-registration, admin, check-in and finalized-contest states. Landing, login, profile and dashboard captures include RU/KK/EN variants.
- The capture fixture uses WHD's source-defined registration deadline (2026-11-12T23:59:59+05:00), then explicitly closes registration for closed/finalized states. Its eligible-team fixture is seeded before other participants so the shared seed helper does not create a four-member team.
- Inspected representative desktop and mobile captures and recorded layout metrics. All captures have zero document-level horizontal overflow and no incomplete/broken images.
- Verified source fingerprints after checks: all 211 pre-existing WHD files and 219 NUOPEN files match the initial inventory. Only this notes file is a new tracked-source candidate; baseline tooling/reports/screenshots and installed/build artifacts are ignored.

### Discovered routes — current snapshot, not a required page structure

WHD page routes: /, /login, /onboarding, /dashboard, /invite/$slug, /faq, /privacy, /terms, /admin, /checkin.
WHD infrastructure: root document/error/not-found handling; pathless protected/admin layouts; /api/auth/$, /api/cv and /api/report.
NUOPEN page routes: /, /register, /profile, /dashboard, /invite/[code], /credits, /admin.
NUOPEN infrastructure: root/account layouts, account loading and not-found handling; /api/auth/[...all], /api/account and /api/admin.
The filesystem scan found 70 WHD and 61 NUOPEN source files under components, excluding tests. Counts include component helpers; they are not a count of user-visible screens.

### Presentation mapping

| NUOPEN reference                                     | WHD surface                                                 | Preservation boundary                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Landing header/hero/footer                           | Navbar, Hero, ClosingCTA, Footer                            | Retain WHD name, facts, language switcher, destinations and deadline behavior            |
| Briefing and content panels                          | InfoCards and corresponding About content                   | Retain challenge information and all WHD event facts                                     |
| Schedule                                             | Timeline and Schedule                                       | Retain WHD dates, programme and venues                                                   |
| Reward and allies                                    | Prize portion of Benefits and nested Partners               | Retain additional benefits and sponsor assets                                            |
| History/photo framing                                | Relevant Gallery framing                                    | Retain all photographs, viewer, keyboard navigation and focus restoration                |
| Registration shell, form and verification appearance | Login EmailForm/OtpForm and optional GoogleButton           | WHD remains passwordless; do not add password registration/recovery                      |
| Profile page                                         | OnboardingForm, including editing                           | Retain IIN, guardian contact, education, consent, document acknowledgment and validation |
| Dashboard/team/create/join/invite appearance         | DashboardLayout, TeamCard, NoTeamCard, invitation page      | Retain slugs, team eligibility, permissions, mutations and closure rules                 |
| Existing admin UI                                    | Corresponding admin metrics, tabs, filters and tables       | Retain WHD schemas, fields, attendance, finalisation and exports                         |
| Inline FAQ                                           | Landing FAQ and standalone FAQ page                         | Retain all existing content and the standalone route                                     |
| Not-found appearance                                 | Existing root not-found component                           | Retain WHD navigation and error behavior                                                 |
| No matching screen                                   | Legal pages, dedicated check-in and other WHD-only surfaces | Apply design tokens without inventing workflows                                          |

### Implemented reference versus planned features

NUOPEN currently has an /admin route rendering src/components/admin/dashboard.tsx with an existing stylesheet and real controls. Only its implemented presentation is a reference; no future admin features are implied.
Sign-in, signup, verification and recovery are states inside NUOPEN's /register, not separate page routes. Team actions are states within /dashboard.
NUOPEN-only actions such as rename/transfer/rotate, recovery flows or admin review statuses are not new WHD requirements.
No WHD route is to be created solely because an unmatched NUOPEN route exists. Model attribution will be handled when the asset selection is approved.

### Functionality to preserve

- TanStack Start/Router, React, Vite+ and Cloudflare build/deployment configuration.
- D1/Drizzle schemas and migrations; existing server functions and API handlers.
- Delivered six-digit sign-in OTPs, five-minute expiry, resend/errors, sessions, sign-out and optional Google OAuth.
- Existing RU/KK/EN localization and font coverage.
- Profile fields and versioned consent/document acknowledgment, guardian-contact and other validation.
- Exactly three eligible team members, invitations, captain permissions, removal, leaving, dissolution, registration deadlines and finalized-roster rules.
- Optional PDF CV upload/replacement/deletion with its 5 MB limit, Google Apps Script mail/Drive integration, reporting, and Workers AI rate limits.
- Admin/check-in authorization, attendance, confirmation, team finalisation, table numbers, Codeforces/proctoring credentials and CSV exports.
- Base UI labels, validation errors, focus management, dialogs, disabled/loading states and keyboard interactions.

### Validation and artifacts

| Check                        | Result                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| vp check                     | Pass: formatting, lint and types; no warnings or errors                     |
| vp test                      | Pass: 43 tests across 6 files                                               |
| vp run build                 | Pass: client and Worker production bundles                                  |
| vp run test:e2e              | Pass: 36 existing desktop/mobile cases; includes another production build   |
| Disposable baseline captures | Pass: 2 device cases, 52 screenshots, all 10 discovered page routes covered |
| Source integrity             | Pass: no pre-existing WHD or NUOPEN source changes                          |

The built WHD application ran through its existing isolated Workers/D1 harness with synthetic participants and a local mail/Drive stub. Checks cover OTP errors/replay/session/sign-out, profile editing, guardian contact and validation, consent and document versions, team joins/capacity/permissions, CV upload/deletion, registration closure, admin attendance/confirmation/export, contest finalisation/credentials and multilingual metadata/navigation. The existing landing tests also check widths from 320px to 1920px, gallery keyboard navigation and focus restoration.

Artifacts under ignored output/migration-baseline/:

- source-inventory.json and source-integrity.json: inventory and preservation fingerprints.
- toolchain.json and baseline-summary.json: pinned tools, results, coverage and known issues.
- check.log, build.log, server-tests.log, browser-tests.log, captures.log: command output.
- desktop-captures.json and mobile-captures.json: screenshot paths, routes, locale, dimensions, missing-image and overlap metrics.
- screenshots/{desktop,mobile}/{en,ru,kk}/: 52 page/state baseline PNGs.
- capture.spec.ts and playwright.config.ts: disposable capture tooling using WHD's existing test harness; checked-in tests and build configuration were not edited.
- report/ and results/: capture report and test artifacts. The original browser suite's report remains under output/playwright/.

### Baseline issues and verification limits

- Existing mobile organiser-header issue: at 390px, the logo overlaps Refresh by approximately 31px on admin/check-in. This is recorded for the later approved styling stage; Stage 1 makes no layout correction.
- Existing non-blocking production warning: vite:css-post reports SOURCEMAP_BROKEN. Builds and browser tests succeed. No build configuration was changed to suppress it.
- Real Google OAuth, Apps Script mail/Drive delivery and Workers AI were not called; tests stub external-service boundaries and use local D1/test-only secrets. Production services and data were not used.
- NUOPEN was inspected and fingerprinted read-only; no reference dev server or build was started.

### Application changes

None. Stage 1 is documentation, baseline capture and local tooling only.

## Stage 2 — shared design foundation (2026-11-04)

### Completed

- Applied the reference's actual space/ink/line/core/holo/blue/red token values, type roles, easing and shared spacing tokens. Existing WHD semantic and legacy token names now alias those values, so component APIs and naming remain intact.
- Matched NUOPEN's default light-side blue accent visually. No side selection, preference persistence or other NUOPEN application logic was imported.
- Self-hosted 29 unmodified WOFF2 subsets (505,048 bytes total) from the already generated NUOPEN font assets: Jost, IBM Plex Sans, IBM Plex Mono, Archivo and News Cycle. Retained Latin/extended Latin/Cyrillic subsets; bundled the five corresponding upstream OFL license files from https://github.com/google/fonts/tree/main/ofl. Assets are loaded by CSS only when used.
- Retained existing WHD font dependencies and Kazakh fallbacks for legacy artwork/type and missing glyphs. Chromium's actual rendered-font audit confirms RU/KK/EN text, including ӘҒҚҢҰҺӨҮІ and ₸, uses bundled fonts in sans/display/mono roles with no system fallback.
- Applied square, hairline HUD panel framing; source-style fields; mono labels; the source's glowing white primary buttons and outlined secondary buttons; focus, selection, tabs and OTP presentation. WHD's Base UI components, variants, sizes, input attributes, validation wiring and minimum 44px targets are preserved.
- Adapted the existing container-relative heading sizes to keep WHD's longer event name inside its containers in uppercase Jost. The existing responsive heading/CTA/timeline checks pass across 320–1920px in RU/KK/EN.
- Updated browser theme color to the reference's #03040a.
- No JavaScript dependencies, package/lock files, framework, build/deployment configuration, backend, schema, API handlers, routes, translation strings or business logic changed. NUOPEN remained read-only.

### Files modified and added

Modified:

- src/styles.css — reference-to-WHD token aliases, shared font roles, base text/background and selection/report highlight colors.
- src/components/ui/button-variants.ts — existing variants mapped to component-owned foundation styles; props and behavior unchanged.
- src/routes/__root.tsx — browser theme-color metadata only.

Added:

- src/styles/design-system.css — reference foundation and narrowly scoped bridges to existing shared WHD controls, headings and panels. Existing page layouts are retained for their approved later stages.
- src/styles/fonts.css — self-hosted reference font-face declarations.
- public/fonts/nuopen/ — 29 font subsets and five upstream OFL license files.

Updated this requested MIGRATION_NOTES.md (still an untracked new file from Stage 1). Disposable verification tools, logs, audit results and screenshots are ignored under output/migration-stage2/.

### Validation

| Check                                      | Result                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| vp check                                   | Pass: 169 files formatted; 141 files linted/type-checked, no warnings/errors                                              |
| vp test                                    | Pass: 43 tests across 6 files                                                                                             |
| vp run build                               | Pass: client and Worker production bundles                                                                                |
| Existing browser suite against final build | 34/36 passed in the full run; both remaining cases passed on isolated rerun with one worker                               |
| Reference foundation audit                 | Pass: desktop and mobile, 2 cases                                                                                         |
| Refreshed route/state captures             | Pass: desktop and mobile, 2 cases; 52 screenshots, all 10 discovered page routes                                          |
| Responsive/image metrics                   | Zero document-level overflow and zero incomplete images in all captures                                                   |
| Source integrity                           | NUOPEN: all 219 inventoried files unchanged; WHD: only the three modified files above differ among 211 pre-existing files |

The reference audit reads NUOPEN's actual globals.css in an isolated browser frame. WHD's shared primary button matches its core/text colors, 2px radius, 13px/700 mono type, uppercase tracking and all three glow layers. It also checks rendered fonts, visible focus, input target sizes at 320/390/768/1440px and reduced-motion transitions. Representative desktop/mobile login, profile, dashboard and admin captures were visually inspected.

Existing tests and the isolated local Workers/D1 capture harness verify OTP/session and sign-out, profile editing, consent and document versions, guardian validation, preservation of unsaved fields across language changes, team creation/join/permissions, CV operations, registration closure, admin attendance/confirmation/exports, contest finalisation/credentials, gallery keyboard handling, focus restoration and metadata/localization. No real mail/Drive/OAuth/AI services or production data were exercised.

Artifacts: check.log, server-tests.log, build.log, browser-tests.log, browser-rerun.log, foundation.log, captures.log, font-assets.json, source-integrity.json, {desktop,mobile}-foundation.json, {desktop,mobile}-captures.json, review.png and screenshots/{desktop,mobile}/{en,ru,kk}/.

### Remaining issues and boundaries

- Two full-suite cases intermittently reached login's empty-email validation instead of OTP while browser suites/audits ran concurrently. Both passed unchanged in isolation. This is consistent with an early hydration/input timing issue; the precise cause was not established. Preserve the observation for final regression review; no auth code or existing tests were changed to hide it.
- The baseline mobile organiser logo/Refresh overlap remains for the organiser styling stage.
- The pre-existing non-blocking vite:css-post SOURCEMAP_BROKEN build warning remains.
- Full page-level fidelity is pending Stages 3–5. Legacy page artwork, backgrounds, some headings/control details and layouts are intentionally still present; this stage establishes their shared foundation.
- External service checks remain limited to local boundary stubs. The local-only development flag does not supply offline AI inference.
- Stage 2 is complete. Stage 3 requires explicit approval.

## Stage 3 — shared shells and corresponding landing visuals (2026-11-04)

### Implementation

- Applied the actual NUOPEN header, hero/title treatment, starfield, briefing target/readout, route/timeline, agenda, prize reels, photo framing, FAQ split, trench closing scene and footer rhythm to the corresponding existing WHD surfaces.
- Preserved WHD's content, event facts, eligibility description, translated dates, all eight agenda entries/venues, all six gallery photos and dialog interactions, sponsor logos, social/legal/contact destinations and registration-funnel CTAs. WHD's longer event name uses two outlined lines in the hero/footer and existing single-line constraints in the About/footer tagline.
- Shared AuthHeader/AccountShell now use reference typography/geometry, stars and decorative flybys. Existing help, language, identity and two-click sign-out controls retain their handlers. Detailed registration/profile/team panel migration remains Stage 4.
- Copied only visual renderers, animation/math helpers, an SVG ACM mark and three unchanged model assets. Rendering and component imports were adapted to TanStack/Vite; no Next runtime, NUOPEN server/API/auth/business logic or event data was copied.
- Runtime dependencies added at the exact installed reference versions: three 0.186.1 and gsap 3.15.0. Added @types/three 0.186.0 for types. No other runtime libraries or framework/build configuration changes. WHD's native scrolling remains intact; Lenis is unnecessary for the corresponding visuals.
- Models: destroyer.glb (1,256,860 bytes), deathstar.glb (625,512 bytes), tie.glb (216,384 bytes), 2,098,756 bytes total. CREDITS.txt records the existing source author/license/model links, accessible from the existing footer. No new credits route was created.
- Model stages are lazy-loaded, start near the viewport, pause when offscreen and release far-away GPU contexts. Reduced-motion mode keeps the reference's static poses and redraws only for model load/resize/visibility, avoiding a continuous render loop. The mobile closing shot keeps NUOPEN's original hidden-TIE behavior.
- Existing landing screenshot cases request reduced motion and wait for viewport/container-unit layout to settle after resizing; all original content, clipping, CTA and keyboard assertions are retained. Normal motion and live deadline expiry are checked separately in ignored verification tooling.
- NUOPEN-only story/side-selection/audio/intro controls have no corresponding WHD workflow in the approved mapping and were not added. No new page or business feature was created.

### Files modified and added

Modified in this stage:

- src/styles.css
- src/styles/landing.css
- src/components/AuthHeader.tsx
- src/components/AccountShell.tsx
- src/routes/index.tsx
- src/components/ui/stats-3.tsx
- src/components/ui/stats-2.tsx
- src/components/ui/cta-4.tsx
- src/components/ui/footer-2.tsx
- src/components/landing/Hero.tsx
- src/components/landing/Navbar.tsx
- src/components/landing/Schedule.tsx
- src/components/landing/Footer.tsx
- src/components/landing/Timeline.tsx
- src/components/landing/ClosingCTA.tsx
- src/components/landing/InfoCards.tsx
- src/components/landing/FAQ.tsx
- src/components/landing/Benefits.tsx
- package.json
- pnpm-lock.yaml
- tests/e2e/landing.spec.ts

Added source:

- src/styles/shell.css
- src/styles/landing-reference.css
- src/components/landing/PrizeAmount.tsx
- src/components/landing/Scene.tsx
- src/components/landing/visuals/Starfield.tsx
- src/components/landing/visuals/use-stage.ts
- src/components/landing/visuals/deathstar-shot.ts
- src/components/landing/visuals/tie.ts
- src/components/landing/visuals/AcmMark.tsx
- src/components/landing/visuals/scenes.tsx
- src/components/landing/visuals/reveal.ts
- src/components/landing/visuals/use-gsap.ts
- src/components/landing/visuals/scene-path.ts
- src/components/landing/visuals/tie-flight.ts
- src/components/landing/visuals/star-math.ts
- src/components/landing/visuals/AccountAtmosphere.tsx
- src/components/landing/visuals/cluster.ts
- src/components/landing/visuals/load-model.ts
- src/components/landing/visuals/gsap.ts
- src/components/landing/visuals/budget.ts
- src/components/landing/visuals/deathstar.ts
- src/components/landing/visuals/fit.ts
- src/components/landing/visuals/destroyer.ts
- src/components/landing/visuals/deathstar-briefing.ts
- src/components/landing/visuals/transit.ts

Added assets:

- public/nuopen/models/destroyer.glb
- public/nuopen/models/deathstar.glb
- public/nuopen/models/tie.glb
- public/nuopen/models/CREDITS.txt

Updated this requested MIGRATION_NOTES.md. Previous Stage 2 changes remain in the working tree and are not counted as new Stage 3 work.

### Validation and preserved functionality

| Check                                 | Final result                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| vp check                              | Pass: 194 formatted files; 164 linted/type-checked files, no warnings/errors                                                     |
| vp test                               | Pass: 43 tests across 6 files                                                                                                    |
| vp run build                          | Pass: client and Worker production bundles                                                                                       |
| vp run test:e2e                       | Pass: fresh production build and all 36 existing browser cases using the standard two-worker configuration                       |
| Targeted landing/gallery suite        | Pass: all 8 desktop/mobile cases, RU/KK/EN, 320–1920px                                                                           |
| Normal-motion/cutoff checks           | Pass: 4 desktop/mobile cases; actual models render, live countdown changes CTAs without reload, mobile menu Escape returns focus |
| Narrow/wide header and wordmark check | Pass: all 15 combinations (RU/KK/EN × 320/390/768/1440/1920px), no clipping or overlapping header controls                       |
| Final route/state captures            | Pass: 2 device cases; 52 screenshots across all 10 discovered page routes                                                        |
| Capture metrics                       | Zero document-level horizontal overflow and zero incomplete images                                                               |
| Reference/source integrity            | All 219 NUOPEN files unchanged; all 39 existing WHD database/library/API files unchanged                                         |
| Existing decision/handler integrity   | Landing funnel, hero/closing CTA decision blocks and shared-header sign-out handler match their pre-migration code byte-for-byte |

The final standard command completed with 36/36 cases passing in 3.1 minutes. Verification exercises OTP sign-in/error/session/sign-out, profile edits and guardian validation, consent/document versions, team creation/join/permissions, CV operations, deadline enforcement, admin/check-in attendance and confirmation, CSV/contest exports and credentials, language switching, metadata, gallery keyboard navigation and focus restoration. Real external integrations remain stubbed at their boundaries; local D1 and test-only secrets are used.

Visual review covered final desktop/mobile landing, shared login/dashboard/profile shells, all landing sections, static prize amount, source-backed Death Star/TIE scenes, and normal-motion model loading. Scene screenshots are captured while the corresponding scene is visible; full-page captures can show an empty far-away stage because the reference renderer releases offscreen WebGL contexts.

Artifacts under ignored output/migration-stage3/: check.log, server-tests.log, build.log, e2e-final.log, landing-tests.log, visual-tests.log, responsive-tests.log, captures.log, changed-files.json, model-assets.json, source-integrity.json, preserved-handlers.json, responsive-header.json, {desktop,mobile}-captures.json, review.png, scene-screenshots/{desktop,mobile}/ and screenshots/{desktop,mobile}/{en,ru,kk}/. Temporary geometry/visual/capture tooling is ignored; existing production configuration is unchanged.

### Known boundaries

- The reference Three.js renderers add a lazy visual chunk (~652.8 kB minified / 166.4 kB gzip), which triggers Vite's >500 kB chunk advisory. Build configuration is preserved rather than increasing the warning threshold.
- The prior non-blocking sourcemap warning remains. The unused intro-only nested keyframe was excluded from the scoped stylesheet, resolving its CSS optimizer warning.
- Detailed registration/profile/team visuals remain Stage 4; organiser/admin/check-in and remaining WHD surfaces remain Stage 5. Existing mobile organiser-header overlap is outside Stage 3.
- Real Google OAuth, mail/Drive and Workers AI integrations are not contacted by local verification.

Stage 3 is complete. Stage 4 was subsequently approved and is documented below.

## Stage 4 — registration and participant screens (2026-11-04)

### Completed and design decisions

- The user explicitly approved Stage 4 in the current conversation. Implemented this stage only; Stage 5 remains unapproved.
- Mapped the actual NUOPEN registration/sign-in/verification, profile, dashboard/team, create/join and invitation implementations to WHD's existing components. Replaced legacy pink account artwork, surfaces and page geometry with the reference typography, hairline HUD panels, targeting SVG, numbered roster, readiness sidebar and responsive layouts.
- Login uses the source's registration story/form split and original SVG radar/orbit animation. The copy remains WHD's translated text and event details. The three steps describe WHD's existing email/profile/team flow. The radar and steps are hidden at the reference's mobile breakpoint.
- WHD remains passwordless. Kept the existing input-otp component, six-digit validation, paste cleanup, five-minute OTP lifetime, cooldown, resend, change-email, errors, loading and optional Google sign-in. Styled the six slots as one continuous verification field to match NUOPEN's implemented verification appearance. No password, account recovery, NUOPEN authentication client or server code was imported.
- Profile editing/new onboarding use the reference heading/form columns and two-column field grid, collapsing on mobile. Every WHD field, conditional guardian field, education select, policy/document versions, links and accessible error association remains intact. The source's 18px check mark sits inside WHD's existing 44px interactive target.
- Participant dashboards use the reference heading, crew roster and sidebar structure. All WHD status/event values remain visible, now in the readiness sidebar. Create/join stay in their existing component with separate reference panels. Numbered member rows, square avatars, invite/copy and departure styling preserve existing permissions and inline two-click confirmations.
- Invitation states use the actual reference symbol/panel, team-name and member-count/fact presentation, adapted to WHD's year, slug invitations, translated messages and existing public team summary. Anonymous/onboarding redirects and join/status decisions are untouched. Closed onboarding uses the same consistent panel without legacy star artwork.
- WHD-only CV/PDF, AI suggestion/cancel/cooldown and finalized contest/credential controls remain available, using the migrated visual language. No new business capability, route or NUOPEN-only rename/transfer/rotate/recovery feature was added.
- Added only named presentation variants to the existing Card, AuthCard and Field APIs. Reused AccountShell for onboarding/invitations with an optional sign-out presentation prop; previous callers retain their defaults. Page CSS now follows the shared foundation so mobile/source-specific styling wins correctly. No framework, build configuration, dependencies, translations, backend or database changes.
- Kept the reference SVG shapes unchanged; omitted NUOPEN's decorative English story captions rather than copying its event identity into WHD. Radar/member/entry animations and reduced-motion behavior follow the reference. No new image, font or model assets are needed.

### Files modified and added in Stage 4

Modified application files:

- src/styles.css — account stylesheet order.
- src/styles/account.css — corresponding reference page layouts, controls, roster, invitations, WHD-only adaptations and responsive/motion rules.
- src/components/AccountShell.tsx — optional sign-out presentation prop for the existing participant wrappers.
- src/components/login/LoginVisual.tsx — reference registration story and decorative targeting display, retaining WHD copy.
- src/components/onboarding/OnboardingForm.tsx — presentation class and named consent variants only.
- src/components/dashboard/DashboardLayout.tsx — reference heading/sidebar placement; removes legacy mascot.
- src/components/dashboard/NoTeamCard.tsx — removes legacy header icons; form logic remains unchanged.
- src/components/dashboard/TeamCard.tsx — visual roster slot numbers only.
- src/components/ui/auth-card.tsx — named profile/invitation layouts and invitation detail slot.
- src/components/ui/card.tsx — named profile/invitation presentation variants.
- src/components/ui/field.tsx — named consent presentation variant, default preserved.
- src/routes/onboarding.tsx — AccountShell and profile/closed presentation only; server/submit logic unchanged.
- src/routes/invite.$slug.tsx — AccountShell and source-style presentation of the existing team summary only.

Modified verification:

- tests/e2e/account.spec.ts — scopes existing policy-link locators to the consent form because the migrated shared footer also contains those destinations. All original assertions remain; no authentication helper, timeout or application behavior was changed to pass tests.

Added source:

- src/components/login/MissionArt.tsx — visual-only source SVG radar, adapted to WHD.

Documentation updated: this MIGRATION_NOTES.md and the requested prompt.md handoff. All disposable audits and screenshots remain ignored under output/migration-stage4/.

### Validation and functionality verified

| Check                                            | Final result                                                                                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vp check                                         | Pass: formatting/lint/types, no warnings or errors                                                                                                                                                                  |
| vp test                                          | Pass: 43 server tests / 6 files                                                                                                                                                                                     |
| vp run build                                     | Pass: production client and Worker bundles                                                                                                                                                                          |
| Standard vp run test:e2e                         | Pass: fresh build + all 36 browser cases with the normal two-worker configuration                                                                                                                                   |
| Additional final visual/interaction verification | Pass: 8 desktop/mobile cases                                                                                                                                                                                        |
| Responsive audit                                 | 126 checks: login/profile/team × RU/KK/EN × 320/390/680/768/900/1440/1920px × two device contexts; zero document overflow, clipped controls or undersized buttons                                                   |
| Direct NUOPEN stylesheet comparison              | 42 language/viewport comparisons, matching implemented heading sizes/line height/tracking, panel padding, field size/padding/radius and radar visibility/spacing                                                    |
| Normal/reduced motion and paste                  | Radar rotates normally, becomes static under reduced motion; atmosphere hidden; formatted OTP paste verifies at 320px; consent targets remain 44px with 18px visual marks                                           |
| Refreshed route/state captures                   | 52 screenshots / all 10 discovered WHD page routes, zero overflow or incomplete images                                                                                                                              |
| Source integrity                                 | All 219 inventoried NUOPEN files unchanged; all 39 WHD database/library/API files unchanged                                                                                                                         |
| Operation integrity                              | Existing profile validation/save/redirect blocks, team create/join/AI/action blocks, invitation resolution/join handlers and entire auth/CV/contest clients/dashboard route verified unchanged against original WHD |

The standard suite checks registration/session/profile editing, guardian/phone validation, consent/document versions, unsaved values while changing language, creating/joining teams, CV upload/deletion, deadline restrictions, organiser attendance/confirmation/CSV, finalization/credentials, gallery and metadata/localization. Additional browser checks cover invalid/incomplete OTP, change-email, formatted-code paste, actual clipboard copy, valid/already-joined invitations, member-versus-captain permissions, leaving, kicking, dissolving and signing out. Visual review covered desktop/mobile registration, OTP, profile, no-team/team, invitation and contest panels, plus RU/KK at 320px.

An earlier full run passed 34/36: both failures were the policy-link selector ambiguity corrected above. A subsequent full run passed 35/36 and reproduced the pre-existing early-hydration test timing issue once (the helper filled before the client retained the input; the page showed Email is required). The final standard run passed all 36 unchanged after that observation. No retry/timeout increase or auth implementation change was used to conceal it. The intermittent pre-existing observation remains documented for Stage 6.

Local production Workers, real isolated D1/auth and boundary stubs are used. Real Google OAuth, Apps Script mail/Drive and Workers AI inference were not contacted; no production verification is claimed.

Artifacts under output/migration-stage4/: start-hashes.json, changed-files.json, source-integrity.json, preserved-handlers.json, check.log, server-tests.log, build.log, e2e.log (initial), e2e-final.log (timing observation), e2e-final-clean.log (final standard run), visual-final.log, capture-final.log, {desktop,mobile}-responsive.json, {desktop,mobile}-motion.json, {desktop,mobile}-captures.json, screenshots/{desktop,mobile}/{en,ru,kk}/, responsive-screenshots/, *-otp-320.png and *-invite-valid.png. Disposable Playwright configs/specs are kept beside those reports.

### Remaining issues and stage boundary

- Stage 4 is complete; stop and wait for explicit Stage 5 approval.
- The existing mobile organiser logo/Refresh overlap and detailed organiser/admin/check-in/other WHD-only surfaces remain Stage 5. NUOPEN's actual working-tree admin UI is the design reference.
- Existing non-blocking sourcemap and lazy Three.js chunk-size advisories remain; no build thresholds/configuration were altered.
- The known intermittent early-hydration test-input observation remains for final regression review; the final standard suite is clean.
- External service verification remains limited to the local boundary stubs.

## Stage 5 — organiser and remaining WHD surfaces (2026-11-04)

### Completed and design decisions

- The user explicitly approved Stage 5. Implemented only Stage 5; Stage 6 remains unapproved.
- Inspected NUOPEN's actual working-tree admin/dashboard implementation and admin.css, its account shell/dialog styling, implemented 404 page and credits typography. Used existing route/component inventories and current files; no identical page structure was assumed and no planned/missing NUOPEN page was created.
- Admin/report and check-in use the reference's large display heading, four/two HUD summary cards, label/value/detail typography, bordered registry, underline tabs, toolbar, hairline table rows, mono column headings and colours. WHD's real counts, strings, table columns, filters and statuses remain the content source.
- Rebuilt only AdminHeader's presentation: reference textual WHD/year branding, shared header rhythm, separate underline navigation row and responsive action layout. The baseline logo/Refresh overlap is resolved. Refresh, cooldown, language, sign-out, dashboard/report/check-in links and active navigation remain available at all tested sizes.
- Kept WHD's existing TanStack tables and Base UI tabs/toggles/checkboxes/dialogs. Search, filtering, sorting, column visibility, scroll-to-row links, eligibility, optimistic updates and cache/refetch behavior are unchanged. Wide tables scroll within a keyboard-focusable region; the page itself does not overflow. WHD's additional columns/controls remain visible rather than being removed to resemble NUOPEN's smaller dataset.
- NUOPEN's review-status drawer, waitlist/rejection workflow, pagination, clickable summary-card filters and auto-refresh logic have no corresponding WHD implementation and were not imported. No NUOPEN backend/API/access rules or data were copied. WHD's organiser-only 404 guard remains intact, even though the reference has a different restricted-access view.
- Source-sized 18px checkbox marks retain the existing 44px interactive targets. Confirmation surfaces use NUOPEN's square dialog/palette/type while preserving Base UI's initial Cancel focus, Escape/backdrop behavior, focus restoration and existing callbacks.
- Legal pages retain every original heading, paragraph, policy date, contact/link and language behavior. Their existing LegalPage/LegalSection components now use the migrated account shell and the reference's editorial/credits type, borders and spacing. No new legal content or translations were invented.
- Reproduced NUOPEN's actual 404 composition, outlined ghost numeral and mobile hiding rule around WHD's translated messages and home action. The existing root error page uses the same design system while preserving retry/reset, home action and development-only raw error details. Production errors remain generic.
- The full FAQ keeps its complete existing question set, links and accordion behavior and gains the shared starfield and responsive footer/link treatment. Its corresponding section styling was already migrated in Stage 3.
- No framework, build/deployment configuration, dependencies, fonts/images/models, routes, translations, legal documents, database files or API/library logic changed. Earlier stages' uncommitted work and the read-only reference are preserved.

### Files modified and added in Stage 5

Modified application files:

- src/components/admin/AdminHeader.tsx — reference header/nav geometry and responsive controls; original refresh/sign-out props preserved.
- src/components/admin/table.tsx — reference summary-card ordering/type and column-toolbar layout class; table/event implementations retained.
- src/components/ui/card.tsx — named admin-stat presentation variant.
- src/components/ui/button-variants.ts — component-owned destructive-button marker for dialog styling; existing variant behavior preserved.
- src/routes/_admin.tsx — scoped admin-page wrapper class only.
- src/routes/_admin/admin.tsx — presentation containers for heading/stats/registry/search/controls/table scroll region only.
- src/routes/_admin/checkin.tsx — corresponding presentation containers only.
- src/components/LegalPage.tsx — shared reference shell and editorial classes; existing props/content/links preserved.
- src/routes/__root.tsx — 404/root-error presentation only; all route metadata/configuration/providers unchanged.
- src/routes/faq.tsx — decorative shared starfield only.
- src/styles.css — imports the two stage-specific stylesheets.

Added:

- src/styles/admin.css — source-backed admin/header/stat/registry/table/dialog styling, WHD-only control adaptations and responsive/reduced-motion rules.
- src/styles/public-pages.css — source-backed 404 and consistent WHD legal/error/FAQ presentation.

Updated this requested MIGRATION_NOTES.md and prompt.md handoff. No checked-in tests were modified in Stage 5. Disposable verification tooling remains ignored under output/migration-stage5/.

### Validation and preserved functionality

| Check                                  | Final result                                                                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vp check                               | Pass: 198 files formatted; 165 linted/type-checked, no warnings/errors                                                                                                                          |
| vp test                                | Pass: 43 tests / 6 files                                                                                                                                                                        |
| Production build                       | Pass: client and Worker bundles                                                                                                                                                                 |
| Standard vp run test:e2e               | Pass: fresh build + all 36 existing cases, normal two-worker configuration                                                                                                                      |
| Additional final browser verification  | Pass: 8 desktop/mobile cases: responsive/style audit, organiser actions, simulated root failure, and refreshed route captures                                                                   |
| Responsive/public-page audit           | 252 checks: 6 affected public/organiser views × RU/KK/EN × 320/390/680/700/768/1440/1920px × two device contexts                                                                                |
| Organiser-header regression            | All 84 admin/check-in language/viewport/device combinations have zero overlapping controls                                                                                                      |
| Direct reference stylesheet comparison | 42 comparisons pass for actual NUOPEN heading/card/tab/table and 404 properties                                                                                                                 |
| Final route/state captures             | 52 screenshots / all 10 discovered page routes, zero horizontal page overflow or broken images                                                                                                  |
| Source integrity                       | All 219 inventoried NUOPEN files and all 39 existing WHD database/library/API files unchanged                                                                                                   |
| Operation/configuration integrity      | Both organiser routes' complete code before final JSX, admin guard/context/sign-out and root metadata/configuration/providers match the Stage 5 starting sources; inline event props also match |

The existing full suite exercises registration/OTP/session, profile/guardian/consent/documents, unsaved language changes, teams/invites, CV operations, deadlines, organiser attendance/confirmation/CSV, team finalization/proctoring credentials, participant contest access, gallery and localization/metadata. Additional Stage 5 checks exercise search, ascending/descending sort, eligibility filters, one/all column visibility, participant↔team row links, confirmation persistence, attendance/team-ready filtering, undo Cancel/Escape/focus restoration, manual refresh/cooldown, sign-out and anonymous organiser 404 denial.

A separate browser context deliberately fails a local client request to exercise the real root error boundary: the generic message and retry control render, raw error text stays hidden in production and the home action works. No error, fault hook or extra endpoint was added to the application.

The responsive checks reject document overflow, clipped controls outside intentional table scroll regions, buttons shorter than 44px, overlapping header controls and legacy fallback/organiser artwork. The source comparison reads NUOPEN styles read-only in an isolated browser frame. Visual review covers desktop/mobile admin/check-in, confirmation dialog, legal pages, full FAQ, 404 and root error, including narrow RU/KK views. Local Workers, isolated real D1/auth and boundary stubs are used; live OAuth/mail/Drive/AI are not contacted.

Artifacts under ignored output/migration-stage5/: start-hashes.json, before/ presentation snapshots, changed-files.json, source-integrity.json, preserved-handlers.json, inline-event-integrity.json, check.log, server-tests.log, build.log, e2e-final.log, visual-final.log, responsive.log, {desktop,mobile}-responsive.json, {desktop,mobile}-captures.json, screenshots/{desktop,mobile}/{en,ru,kk}/, responsive-screenshots/, *-attendance-dialog.png and *-root-error.png. Configs/specs for the disposable audits are kept beside the reports.

### Remaining issues and stage boundary

- Stage 5 is complete. Stop and wait for explicit Stage 6 approval.
- The former mobile organiser-header overlap is resolved; no new visual/functional blocker was found in this stage.
- Existing non-blocking vite:css-post sourcemap and lazy Three.js chunk-size advisories remain. No build thresholds/configuration were changed to suppress them.
- The historical intermittent early-hydration test-input observation from earlier stages remains documented for Stage 6; Stage 5's final standard suite passes cleanly.
- Live external service delivery/inference is unverified; local boundary stubs are used. No production deployment, remote migration or push was performed.

## Stage 6 — final coverage and regression review (2026-11-04)

### Completed and coverage

- The user explicitly approved Stage 6. Reviewed all six stages without changing NUOPEN or migrating its backend/business rules.
- Re-enumerated actual WHD UI/layout/API modules and NUOPEN page/layout/API/loading/not-found modules. The original 10 WHD page routes, API entries and route declarations are preserved; no matching page structure was assumed. output/migration-stage6/current-routes.json and coverage-map.json document the current inventory and mapping/functional exceptions.
- Corresponding implemented landing, sign-in/verification, profile, team/create/join/invitation and admin surfaces have source-backed visuals. The actual NUOPEN 404 is represented by the existing WHD fallback. WHD-only check-in, full FAQ, legal/error surfaces, extra participant fields, CV/AI/contest controls and organiser capabilities remain available in the migrated design system.
- NUOPEN-only password/recovery/story/side/audio/review/dossier/pagination workflows remain excluded where WHD has no corresponding feature. Model attribution remains accessible from the existing footer; no new credits route or planned page was invented.
- Verified all 29 copied font subsets and three model files remain byte-for-byte reference copies, with bundled font/model attribution intact. All 219 inventoried NUOPEN files and all 39 original WHD database/library/API files remain unchanged.
- Audited dependency/configuration boundaries: only the previously approved three/gsap/@types/three dependencies were added, at the recorded reference versions. Original dependencies, scripts, engine/package-manager pins and framework/build/deployment configuration remain unchanged. The sole Playwright configuration change disables continuous diagnostic screenshot capture while retaining DOM/network traces and failure screenshots; assertions, timeouts, retries and two-worker concurrency remain unchanged. Event facts, translations, legal documents, registration deadline and auth/CV/contest/route handler source remain WHD-owned.

### Issues found and fixed

1. **Live reduced-motion changes.** The source-derived sky, WebGL actor and GSAP effects originally checked the preference only when mounting. Browser instrumentation reproduced continuous canvas draws after Reduce Motion was enabled. The visual helpers now subscribe to preference changes, stop/revert previous animation state and rebuild only nearby model actors for their new motion mode. Static source poses remain visible; disabling Reduce Motion resumes animation. The sky also pauses when the document is hidden. Listeners, animation frames, observers and GPU resources are cleaned up through the existing lifecycles. No business state or rendering appearance in each normal/static mode was redesigned.
2. **Input before hydration.** Delaying local client scripts reproduced the historical failure on both device contexts: an email typed into SSR markup was lost and submission reported Email is required. AuthCard now keeps its existing content inert/aria-busy until React can retain input and handle submission, and restores the existing autofocus target without stealing an already focused control. Normal client-side navigation and mounted form state remain unchanged. All email/OTP/Google handlers, validation and API calls are untouched.

Added permanent browser regressions for native pre-hydration focus/input rejection, autofocus/OTP delivery afterward and live account sky/radar preference changes. Playwright's fill API can bypass native inert focus restrictions, so the existing login test helper now waits for the real UI-ready attribute before filling. No assertions were removed and no checked-in timeout, retry, worker or build setting was increased or altered. Diagnostic trace screenshots were disabled after traces showed GPU stalls during repeated ReadPixels capture; DOM/network tracing and failure screenshots remain available. The existing metadata language-switch scenario was split into one test per route, preserving its full assertion body and the same 30-second budget; this yields 42 device cases rather than 40.

### Files modified and added in Stage 6

Modified application files:

- src/components/landing/visuals/Starfield.tsx — live preference/visibility handling and frame/listener cleanup.
- src/components/landing/visuals/use-gsap.ts — revert/recreate visual contexts when motion preferences change.
- src/components/landing/visuals/use-stage.ts — rebuild nearby visual stages on preference changes, retaining existing actors/poses/disposal.
- src/components/ui/auth-card.tsx — shared SSR interaction readiness and autofocus restoration only; component API/handlers remain unchanged.

Modified verification:

- tests/e2e/account.spec.ts — adds the delayed-script/native input/autofocus/OTP regression; earlier assertions retained.
- tests/e2e/fixtures.ts — login helper waits for actual hydrated/inert readiness; auth flow and all original assertions retained.
- tests/e2e/metadata.spec.ts — splits the long language-switch scenario per existing route; all assertions retained, with unchanged timeouts.
- playwright.config.ts — disables continuous trace screenshots to avoid GPU readback stalls; keeps DOM/network traces, failure screenshots and all assertions/timeouts/retries/workers.

Added:

- tests/e2e/motion.spec.ts — persistent lightweight live reduced-motion regression on both devices. Full WebGL/context/mode tests run in the separate ignored visual audit to avoid competing with the standard suite's software rendering.

Updated this requested MIGRATION_NOTES.md and prompt.md. No dependencies, build configuration, styles, images/fonts/models, routes, translations, legal content, database, API or library files were changed in Stage 6. Disposable diagnosis/coverage/audits remain ignored under output/migration-stage6/.

### Final verification

| Check                                  | Result                                                                                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vp check                               | Pass: 199 files formatted; 166 linted/type-checked, no warnings/errors                                                                                                                                        |
| vp test                                | Pass: 43 tests / 6 files                                                                                                                                                                                      |
| Fresh production build                 | Pass: client and Worker bundles                                                                                                                                                                               |
| All checked-in browser cases, isolated | Pass: 42/42 with vp exec playwright test --workers=1 against the fresh production build; existing timeouts/retries/assertions unchanged                                                                       |
| Default two-worker command             | 38/42 pass; four mobile landing/metadata whole-test timeouts. No clean default concurrent run is claimed                                                                                                      |
| Extended isolated browser audit        | Pass: 22/22 desktop/mobile cases, including source-style/responsive audits, participant/organiser flows, OTP paste, actual models, live cutoff, live WebGL motion, safe error and no-WebGL fallback           |
| Responsive coverage                    | 378 participant/public/organiser checks across RU/KK/EN and 320–1920px in desktop/mobile contexts; zero page overflow, clipped controls outside intended table regions, undersized buttons or header overlaps |
| Direct source style comparisons        | 84 comparison groups / 1,414 properties pass for corresponding account/admin/404 styles                                                                                                                       |
| Final route/state captures             | 52 screenshots / all 10 discovered WHD page routes, zero overflow or broken images                                                                                                                            |
| Asset/source integrity                 | 32 copied visual assets match reference bytes; all 219 inventoried NUOPEN files and 39 original WHD backend/library/API files unchanged                                                                       |
| Functional/content/config integrity    | Original auth/OTP/OAuth/CV/contest clients, handlers, router/config, translations and legal source match original WHD; only the previously recorded visual dependencies differ                                |

Visually inspected fresh desktop sign-in/admin and mobile admin/team captures; source typography, panel framing, focus indicators and responsive stacking remain intact.

The complete browser suite exercises registration/session, profile/guardian/phone validation, consent/document versions, unsaved input across languages, team/invite permissions/actions, CV operations, deadline enforcement, attendance/confirmation/focus, finalization and both exports/contest credentials, metadata/localization and gallery behavior. Extended checks verify source model delivery/context rendering, normal/static motion and resumption, WebGL-unavailable fallback through OTP send, clipboard/invite actions, search/sort/columns/status filtering, anonymous admin 404 and safe production error messaging. Native hydration tests keep scripts delayed, prove the real input cannot focus/accept keyboard input while inert, then verify autofocus and OTP service delivery once interactive.

An initial new WebGL test counted environment setup and sampled before the asynchronous model's required one-off static redraw; it was corrected to observe default-framebuffer model painting before asserting no continuous draws. GPU-heavy checks run serially in the extended audit. Earlier diagnostic runs passed 37/40 concurrently, 39/40 serially before metadata separation, and 41/42 serially afterward. A failed DOM-only layout check showed GPU stalls due to ReadPixels and screenshot recording consuming its assertion budget. Disabling continuous trace screenshots preserves DOM/network debugging and failure screenshots while avoiding those readbacks. The final default two-worker command still passes only 38/42, with three mobile landing and one mobile metadata whole-test timeouts. The final single-worker suite passes all 42 cases. Trace overhead and concurrent renderer load are supported contributors, but a sole cause is not established and the default-run limitation remains open. No assertions, timeouts, retries, checked-in worker count or app build settings were relaxed.

Only local Workers, isolated real D1/auth, Chromium desktop/mobile emulation and external-service boundary stubs were used. Real Google OAuth, Apps Script mail/Drive, Workers AI inference, production services and physical mobile/browser engines were not exercised. No production deployment, remote migration, push or commit was performed.

Artifacts: output/migration-stage6/ contains current-routes.json, coverage-map.json, asset-integrity.json, source-integrity.json, preserved-functionality.json, changed-files.json, summary.json, audit-summary.json, before/ source snapshots, check.log, server-tests.log, build.log, e2e-final.log (38/42 default two-worker run), e2e-serial-final.log (42/42 single-worker run), e2e-concurrent.log and e2e-serial-before-trace-fix.log (earlier diagnostic runs), visual-final.log (22/22), motion-before.log, hydration-before.log, *-hydration-before.json, hydration-after.log, responsive/capture reports, screenshots/{desktop,mobile}/{en,ru,kk}/, responsive-screenshots/, scene-screenshots/, fallback/error/dialog/OTP captures and disposable audit configs/specs. Earlier stage artifacts remain available for unchanged foundation/font/landing comparisons.

### Remaining limits and completion boundary

- All six approved migration stages are complete, with the concurrent-run timeout limitation recorded above; the full serial suite and extended serial visual audit pass. No further numbered stage is pending.
- Existing non-blocking vite:css-post sourcemap and lazy Three.js chunk-size advisories remain. Build thresholds/configuration were not changed to hide them.
- Live external service delivery/inference and production deployment remain unverified/unperformed. Existing WHD integrations/configuration are preserved.
- The working tree contains the complete uncommitted migration and original unrelated changes. Preserve both repositories. Any deployment, remote migration, commit/push or new feature requires a separate user instruction.

## Design decisions for later stages

- Reuse existing WHD component names/structure, semantic variants and Base UI behavior.
- Reproduce actual NUOPEN styles rather than relying on descriptions that differ from the current code.
- Match reference fonts while retaining validated Russian/Kazakh fallback coverage.
- Add only visual dependencies and assets needed by selected source-backed components; copy no backend, authentication or business logic.
- Preserve WHD-only controls and states when matching a partial reference.

## Remaining work

- All six approved migration stages are complete. Review the final results and limitations below; no further implementation/deployment is authorized by stage completion.
- The mobile organiser-header overlap, live motion-preference handling and account input loss before hydration are resolved. All 42 browser cases pass serially. The final default two-worker run has four mobile landing/metadata timeout failures; reducing trace overhead did not eliminate this local rendering limitation. External service delivery/inference remains unverified. No production deployment, remote migration, push or commit was performed.
- Use these notes and ignored baseline/Stage 2/Stage 3 artifacts as the starting point; re-inspect only relevant or subsequently changed files.

## Local startup troubleshooting (after Stage 1)

- Normal `vp dev` attempted a remote preview session for the Workers AI binding and failed with Cloudflare API authentication code 10000 after login. Login alone does not establish access to the configured Cloudflare account.
- The installed Cloudflare Vite plugin supports `CLOUDFLARE_VITE_FORCE_LOCAL=true`; verified this starts WHD without the failing remote preview session. No application, Wrangler, Vite, dependency or production configuration changes were needed.
- From the WHD repository, use the already installed pinned toolchain:

```sh
export PATH="$(node -p 'require("./output/migration-baseline/toolchain.json").toolBin'):$PWD/node_modules/.bin:$PATH"
CLOUDFLARE_VITE_FORCE_LOCAL=true vp dev
```

- Verified on the actual local dev server: `/`, `/login` and `/faq` return HTML with HTTP 200; `/api/auth/get-session` returns HTTP 200 and `null` for an unauthenticated request. No remote services were exercised. Existing `.dev.vars` was preserved.
- This launch option is for local UI/auth/database development. It does not provide offline AI inference; AI name generation still needs remote access. The plugin can still print its generic AI remote-usage warning at startup.
- This startup workaround remains available after Stage 2; it changes no production configuration.
