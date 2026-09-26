# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Sonar is a personal job-search system. It is a monorepo of five
parts that share one purpose: find roles, tailor an honest resume for each,
submit applications, and track what happens.

```
apps/scanner/      daily job scanner → Telegram + Google Sheets  (ESM Node, no build)
apps/web/          Next.js 14 app: resume editor, tailor, tracker, analytics
apps/extension/    "Bekar Apply" — MV3 Chrome extension, ATS form autofill
apps/bridge/       local-only Node server connecting the extension to these files
packages/profile/  resume source of truth + the rules that govern tailoring
```

`apps/web` started as a separate resume web app (`HustlerAI`).
`apps/extension` is a Chrome app that has been security-audited and stripped
to the essentials (its `LICENSE` lives in `apps/extension/`). This repository
is a sanitized snapshot with no history from the private working repo.

**Dependencies are installed per-app, not via workspaces.** There is no root
`package.json`. Run `npm install` inside `apps/scanner`, `apps/web`, or
`apps/extension`.

## The rules come first

`resume-build-rules.md` at the repo root is not documentation, it is a set of
standing constraints. Every rule exists because a mistake was already made.
Read it before touching anything that produces a resume. The ones that bite
hardest:

- **Rule 1** — your master resume (transcribed into
  `packages/profile/master-profile.json`) is the only canonical source. Never pull a fact from a previously tailored resume. If two files
  disagree, say so out loud and ask; never resolve a conflict silently.
- **Rule 4** — render to PDF, convert to images, and *look at them*. A document
  that has not been looked at has not been checked.
- **Rule 5** — state every cut explicitly, with the reason, so it can be reversed.
- **Rule 9** — check the open-items list before delivering. If a bullet depends
  on something unconfirmed, keep the wording generic or flag it. Never state it
  as fact.

`packages/profile/README.md` explains which file is canonical for what.

## packages/profile

`master-profile.json` is the machine-readable transcription of the master PDF.
Every bullet carries an `id`, a `verified` flag, and role `themes`.

**Never regenerate it by parsing the PDF** — not with `pdf-parse`, not through
`/api/parse-resume`, not via an AI rewrite. Extraction-then-rewrite is exactly
how rule 1's stale-file errors return (job titles get inflated, headcounts drift,
and technologies get attributed to the wrong project). Hand-edit
the JSON, then run the checks.

`master-profile.json` is gitignored. Start from
`packages/profile/master-profile.example.json` (fictional).

`master-profile.ts` exposes `selectProfile()`, which projects the JSON down to
the `UserProfile` shape `apps/web` consumes. Two behaviours are deliberate and
easy to "fix" wrongly:

- An unverified **entry** (an unconfirmed job title) is *flagged, never dropped*.
  Deleting a role and its verified bullets over a title is the wrong trade.
  Only unverified bullets, certs, and skills are dropped, and only in
  `verification: 'strict'`.
- `themes` **rank** bullets; they never filter an entry out. An entry vanishing
  because no bullet carried a tag is not a decision anyone made, and rule 5
  requires every cut be stated. Real page-fitting uses `maxBullets`, which
  records each cut in `excluded`.

`export-extension-profile.ts` is the bridge to `apps/extension`: it runs
`selectProfile(..., { verification: 'strict' })` over the master profile, folds
in the answer bank parsed from `application-answers.md`, and writes
`apps/extension/extension-profile.json` (gitignored — it carries real contact
info). Run it with `node packages/profile/export-extension-profile.ts`
(Node 22.6+ runs TypeScript natively).

The repo is `"type": "module"`, so `__dirname` does not exist — resolve data
files via `import.meta.url`.

## apps/scanner

No build step. Zero-token by design: it hits ATS APIs directly
(Greenhouse/Ashby/Lever, detected per company) rather than paying for scraping.

```bash
cd apps/scanner
npm install
node scan.mjs                  # the scan; appends to data/
node push-to-sheets.mjs --since 1
node notify.mjs "message"      # send one Telegram message
node send-digest.mjs 10        # pipeline digest
node telegram-daemon.mjs       # background bot, responds to Telegram commands
```

`portals.yml` is the config: title filters, location filters, and per-company
ATS board URLs (the shipped file is an example). `scan.mjs` supports Greenhouse,
Ashby, and Lever, detected from the URL. `sheets-webhook.gs` routes rows to a
home-region tab by `HOME_KEYWORDS`.

State lives in `data/` as append-only TSV/markdown, committed by CI:
`scan-history.tsv` (dedupe ledger), `pipeline.md` (pending jobs),
`scan-runs.tsv` (per-run filter counts), `portal-health.tsv`,
`agent-inbox.md` (questions queued from Telegram for a human/agent),
`applications.md` (submitted applications, also fed by the extension).

Secrets come from `.env` (gitignored): `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `SHEETS_WEBHOOK_URL`.

## apps/web

Next.js 14 App Router, MongoDB via Mongoose, Gemini for generation, JWT auth.
`apps/web/CLAUDE.md` carries the detailed app-level guidance inherited from the
original repo.

```bash
cd apps/web
npm install
npm run dev          # localhost:3000
npm run typecheck
npm test             # jest
npm test -- path/to/file.test.ts    # single test
npm run test:e2e     # playwright
npm run lint
```

Known state, do not rediscover:

- **`npm run typecheck` reports ~25 errors** and `next build` fails on them.
  `next dev` works. They cluster in `lib/pdf/pdf-generator.ts` +
  `app/api/generate-pdf/route.ts` (the PDF output path) and a repeated
  `action_verbs` type bug across `lib/ai/bullet-rewriter.ts` +
  `lib/utils/knowledge-base.ts`. The editor itself typechecks clean.
- **The Cloudflare deploy path does not work and never did.** `wrangler.toml`
  points at `.open-next/worker.js`, but `@opennextjs/cloudflare` is not
  installed and the `pages:build` script the workflow calls does not exist.
  It is leftover hackathon scaffolding for a prize track. Its workflow is
  `workflow_dispatch`-only for that reason. Vercel is the sane host for this app.
- `app/(routes)/edit/page.tsx` loads its profile from `sessionStorage`, not from
  `packages/profile`. Wiring those together is unfinished work.

## apps/extension

"Bekar Apply" — a Manifest V3 Chrome extension that autofills ATS application
forms from a locally-stored profile. **Fill-only; it never clicks submit.**

```bash
cd apps/extension
npm install
npm run build        # esbuild → dist/  (does NOT typecheck)
npm run dev          # esbuild --watch
npm test             # vitest run
npm run test:watch
npx vitest run src/shared/pdf-extract.test.ts   # single test file
npm run type-check   # tsc --noEmit — see caveat below
npm run lint         # eslint src
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked. After
a rebuild, hit Reload on the card.

Known state, do not rediscover:

- **`npm run type-check` reports ~660 `tsc` errors** (loose `NodeListOf`
  iteration, `FieldSchema`/`UserProfile` shape drift).
  The shipped build uses esbuild, which does not typecheck, so `npm run build`
  passes regardless. Do not try to zero these out.
- **`npm test` has 4 pre-existing failures** in `src/popup/popup.test.ts`
  (DOM-structure assertions), 292 passing.
- `dist/` is gitignored and regenerated by `npm run build`.

Architecture:

- **No `content_scripts` block in `public/manifest.json`.** `background.ts`
  injects `content.js` programmatically via `chrome.scripting`, gated by
  `src/shared/ats-domains.ts` `isJobURL()` (an ATS-host allowlist) plus
  `activeTab` when the user clicks the toolbar icon. `host_permissions` is the
  hard ceiling on where the script can run.
- **All state is in `chrome.storage.local`.** No `storage.sync`, no backend, no
  account. Export/wipe live in the Data Explorer and Settings pages.
- **AI provider abstraction** — `src/shared/ai-provider.ts`. Ollama
  (`localhost:11434`) is the default and always-allowed. Gemini is opt-in:
  `provider` + API key in storage, `getActiveGeminiClient()` returns `null`
  unless both are set. `generativelanguage.googleapis.com` and the Google
  Sheets webhook hosts are `optional_host_permissions` — Chrome prompts before
  first use, and both are off by default.
- **Privacy-lock posture — deliberate, do not "restore":** the extension never
  queries job boards. `src/shared/job-search-service.ts` is an inert stub
  (Adzuna/Remotive/Arbeitnow code and their host permissions were removed);
  discovery is `apps/scanner`'s job. There is no `nativeMessaging` permission
  and no bundled installer.
- **Cross-frame autofill** — `src/content.ts` coordinates parent/iframe via
  `window.postMessage` with explicit target origins (never `'*'`) and an
  ATS-origin guard on the receiver.
- **Profile import** — the onboarding page reads `extension-profile.json` (see
  packages/profile) through a file picker into `chrome.storage.local`. No
  network. `src/shared/bridge-client.ts` (see apps/bridge) is the automatic
  alternative to this manual picker.
- **Tracker sync** — `src/shared/tracker-sync.ts` does a manual, one-way push of
  tracked applications to the scanner's `SHEETS_WEBHOOK_URL` (same Apps Script
  endpoint as `apps/scanner/push-to-sheets.mjs`), de-duplicated by id/url. This
  runs alongside, not instead of, the bridge's own applications push.
- **Sheets pipeline read** — `src/shared/sheets-jobs.ts` reads the same webhook
  back (`?action=list`) and powers the Jobs page's **Pipeline** tab (default
  tab, replacing the old inert "Job Discovery" landing view) plus a popup
  nudge showing how many "To Apply" rows are pending. "Mark Applied"/"Skip"
  there call the webhook's `updateUrl` action to edit that row's Status cell
  in place (never appends) and, on Mark Applied, also record a local
  `JobApplication` so it shows in the Kanban tracker. This is not the
  privacy-lock stub being restored (`job-search-service.ts`'s `searchJobs()`
  is still inert, still never queries a job board) — it only ever reads rows
  `apps/scanner` already put in the user's own sheet. Requires the updated
  `apps/scanner/sheets-webhook.gs` (adds `doGet?action=list` and the
  `updateUrl` branch of `doPost`) redeployed by hand in the user's Google
  account — pushing this repo's copy of the `.gs` file does nothing to the
  live Apps Script project.

## apps/bridge

A local-only Node HTTP server (no dependencies) that connects the extension to
this repo's files. Off by default on both ends — a script you start yourself,
and a toggle in the extension's Settings that's unchecked until you turn it on.

```bash
cd apps/bridge
npm start   # node server.mjs — binds 127.0.0.1:4100, prints a token on first run
```

- `GET /profile` serves `apps/extension/extension-profile.json` **as-is off
  disk** — it does not regenerate it. Re-run `export-extension-profile.ts`
  after editing `master-profile.json` to refresh what the bridge serves.
- `POST /applications` appends to `apps/scanner/data/applications.md` via
  `apps/scanner/lib/applications-store.mjs`'s `appendApplications()` — the same
  function `import-applications.mjs` uses, so the two paths can't double-append
  or disagree on the Company+Role dedup key.
- `POST /answers` appends long-form free-text answers the extension's learning
  system captured (`isLearnableLongFormField()` in `bridge-client.ts` — filters
  out self-ID, salary, and contact fields, and short/enum answers) to
  `application-answers.learned.md`, a **sibling of `application-answers.md`,
  outside this repo** — never written into the repo, review-and-merge by hand.
- Every route but `/health` requires a bearer token (`.token`, gitignored,
  generated on first run) checked with `crypto.timingSafeEqual`. No permissive
  CORS headers are ever sent, so a webpage's cross-origin request can't use it
  even while it's running.
- The extension side is `apps/extension/src/shared/bridge-client.ts`: every
  exported call no-ops silently when the bridge is off or unreachable — same
  contract as `ai-provider.ts`'s `getActiveGeminiClient()` returning `null`.
  `http://127.0.0.1:4100/*` sits in the manifest's always-on `host_permissions`
  (like Ollama, not `optional_host_permissions` — it's localhost, not egress).

## CI

Workflows live at the repo root and each sets a `working-directory`, because
every step used to assume the scanner sat at the repo root:

- `daily-scan.yml` — cron 12:00 UTC, `working-directory: apps/scanner`. Commits
  updated data files back to the repo.
- `test-telegram.yml` — manual; the cheap way to verify Telegram secrets.
- `cloudflare-deploy.yml` — manual only, and currently non-functional (above).

## Conventions

Branches are `V1`, `V2`, `V3`, … Work on a new V-branch rather than committing
to `main`; this applies to extension work too. Never commit `.env`; the
scanner's holds live Telegram and Sheets credentials. Never commit
`packages/profile/master-profile.json` or anything under `apps/scanner/data/`
that holds real application history to a public repo.
