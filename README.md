# NU Open 2026

The NU Open event site and registration app: a Star Wars-inspired landing page, email sign-in, participant profiles, team management, and organiser tools. The interface supports English, Russian, and Kazakh.

Built with TanStack Start, React, Cloudflare Workers and D1, Drizzle, and Better Auth. The landing design comes from NU Open; registration and account functionality come from WHD.

## Run locally

Requirements: Node 24.21.0 (see `.node-version`) and [Vite+](https://viteplus.dev/) (`vp`). The lockfile uses pnpm 12.11.2.

```sh
git clone --branch feat/whd-app-migration https://github.com/nu-acm/nu-open-26.git
cd nu-open-26
vp install --frozen-lockfile
cp .dev.vars.example .dev.vars
```

Open `.dev.vars` and set `BETTER_AUTH_SECRET` to a new random value of at least 32 characters. Generate one with `openssl rand -base64 32`. Keep `BETTER_AUTH_URL=http://localhost:3000` for local development.

```sh
vp run db:migrate:local
vp dev
```

Open http://localhost:3000. The local D1 database is separate from Cloudflare's remote database. Without the Google Apps Script webhook, email OTP codes appear in the server terminal; CV uploads require the webhook. Never commit `.dev.vars` or share its contents.

Workers AI needs a remote Cloudflare connection even during local development. If `vp dev` reports `RemoteSessionAuthenticationError`, run `vp exec wrangler whoami` and confirm the signed-in account has Workers AI access; if needed, run `vp exec wrangler logout` and `vp exec wrangler login`. A successful login alone does not guarantee the selected account has the required permissions. The team-name AI feature uses that account; avoid connecting development bindings to someone else's resources.

## Hosting on your Cloudflare account

This is a **Cloudflare Workers** app with a D1 database, not a static site. The configuration in this repository identifies the personal Cloudflare account and the new empty `nuopen26` database created for this project. It does not point to WHD's Cloudflare account, D1 database, or domain. The new database has no tables until the deployment workflow applies the migrations.

### 1. Check your account and address

```sh
vp exec wrangler whoami
```

Confirm it shows your own account. If not, use `vp exec wrangler logout` and `vp exec wrangler login`. In the Cloudflare dashboard, open **Workers & Pages** and find or create **Your subdomain**. Your site's address will be:

```text
https://nuopen26.ghbit.workers.dev
```

`vars.BETTER_AUTH_URL` in `wrangler.jsonc` is set to your address. This must be the exact public origin with no trailing slash. The Worker name in `wrangler.jsonc` determines the `nuopen26` part; if you change it, update the URL too. The first deployment will make this address public.

Before continuing, check `account_id` and `d1_databases` in `wrangler.jsonc` against your own Cloudflare account. If you create another D1 database, replace both `database_name` and `database_id`; keep the binding `DB` and `migrations_dir: "drizzle"`. Never point this project at WHD's database. [Cloudflare D1 setup](https://developers.cloudflare.com/d1/get-started/) and [workers.dev addresses](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) explain these settings.

### 2. Set up email codes and CV storage

The production registration flow needs the Google Apps Script service in `gas/Code.gs`:

1. Create your own project at [Google Apps Script](https://script.google.com/) and paste in `gas/Code.gs`.
2. In **Project Settings → Script Properties**, add `GAS_SECRET` with a new long random value. Keep it private.
3. Run `testSendToMe` in the editor and grant the requested Gmail and Drive permissions to the Google account that will send mail and own uploaded CVs.
4. Select **Deploy → New deployment → Web app**, execute as yourself, and set access to **Anyone**. Save the `/exec` URL. The endpoint checks `GAS_SECRET`; do not share that secret.
5. The script creates a private CV folder in that account's Drive unless you set the `CV_FOLDER_ID` script property. Share it only with authorised organisers. The current script and email template still carry WHD branding.

Without a working webhook, OTPs are logged instead of emailed and CV uploads fail. Do not launch registration until delivery works. Uploaded CVs must be PDFs up to 5 MB. The Google account's Apps Script and mail quotas apply.

### 3. Add Worker secrets

Use the same account and Worker name in `wrangler.jsonc`. These commands prompt for values rather than putting them in shell history. If Wrangler offers to create the new Worker while adding its first secret, confirm only after checking its account and name.

```sh
vp exec wrangler secret put BETTER_AUTH_SECRET
vp exec wrangler secret put GAS_URL
vp exec wrangler secret put GAS_SECRET
vp exec wrangler secret put ADMIN_EMAILS
```

- `BETTER_AUTH_SECRET`: a new random secret of at least 32 characters; use a different value from local development.
- `GAS_URL`: your deployed Apps Script `/exec` URL.
- `GAS_SECRET`: the same secret stored in the Apps Script project.
- `ADMIN_EMAILS`: comma-separated emails allowed to access `/admin` and `/checkin`, including `zhas.permegali@gmail.com`.

Wrangler's `secret put` creates a new Worker version and deploys it immediately on an existing Worker. Keep secrets out of Git, screenshots, and messages. `BETTER_AUTH_URL` is a non-secret `vars` setting in `wrangler.jsonc`, not a Worker secret. See [Cloudflare's secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/).

Google sign-in is optional. To enable it, create your own Google OAuth credentials, register `https://YOUR-ORIGIN/api/auth/callback/google` with Google, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `secrets.required` in `wrangler.jsonc`, and set both with `wrangler secret put`. Substitute your actual origin. Leave them out to keep Google sign-in disabled.

### 4. Deploy using GitHub Actions

The deployment workflow is **manual**, so a push does not migrate a database or deploy a site. GitHub only offers `workflow_dispatch` workflows that exist on the repository’s default branch; this migration branch does not change the organization’s default branch. Use the prepared personal `ZhassulanP/nuopen26` repository for the first deployment, or arrange to add this workflow to the organization’s default branch when the team is ready. Once the URL, D1 binding and Worker secrets are ready:

1. Create a Cloudflare API token with access to **your account's** Workers Scripts and D1, and add it to this GitHub repository under **Settings → Secrets and variables → Actions** as `CLOUDFLARE_API_TOKEN`. Never use an organisation production token.
2. Commit and push your updated `wrangler.jsonc` to this repository's default branch.
3. In GitHub, open **Actions → Deploy → Run workflow**, choose the intended branch, and run it. The workflow applies pending migrations to the D1 database named by the selected branch's config, builds, and deploys. Review that config before every run.
4. Open your `workers.dev` address. Test a real email OTP, profile, team flow, and admin access. Cloudflare Workers logs and the Actions run are useful for diagnosing failures.

The workflow migrates the database before deploying code. Review migrations that drop, rename or rebuild tables, since the previous app version may temporarily use the new schema. A manual deployment is an explicit action and can affect live users. [Cloudflare migration reference](https://developers.cloudflare.com/d1/reference/migrations/).

The app retains the WHD contest/proctoring integration and defaults in its application code; do not enable contest access until you configure and verify your own service. `REGISTRATION_DEADLINE` is optional; blank falls back to the event deadline in the code. Set an appropriate ISO 8601 value in `wrangler.jsonc` if your event uses a different deadline.

## Project layout

- `src/components/landing/nuopen/`: landing sections, visual assets, and presentation helpers.
- `src/i18n/landing/` and `src/i18n/locales/`: landing and account translations in EN/RU/KK.
- `src/routes/`: pages, authentication, admin, and API routes.
- `src/lib/` and `src/db/`: application logic, integrations, and schema.
- `drizzle/`: D1 migrations. Keep existing migration history intact.
- `gas/Code.gs`: optional Google Apps Script mail and CV service.
- `MIGRATION_NOTES.md`: design migration history and verification.

## Checks

```sh
vp check
vp test
vp exec playwright install chromium
vp run test:e2e
```

Server tests use local D1 and test secrets. Browser tests run against the built Worker and stub external mail/Drive services. Test output is kept under ignored `output/`. The browser suite can hit timeouts under heavy software WebGL load; rerun affected tests individually to diagnose rather than assuming they passed.
