# apps/bridge

A local-only bridge between the Bekar Apply extension and this repo's files.
No dependencies — pure Node built-ins.

```bash
cd apps/bridge
npm start          # or: node server.mjs
```

It listens on `http://127.0.0.1:4100` and prints a token on first run
(saved to `.token`, gitignored). Paste that token into the extension's
**Settings → Local Bridge**, turn the toggle on, and:

- **Profile in** — the extension pulls `apps/extension/extension-profile.json`
  on startup and via a "Sync Profile Now" button, so edits to your resume show
  up without a manual file import. Run
  `apps/web/node_modules/.bin/tsx packages/profile/export-extension-profile.ts`
  after editing `master-profile.json` to refresh that file — the bridge serves
  whatever is on disk, it does not regenerate it.
- **Applications out** — every application the extension tracks is appended to
  `apps/scanner/data/applications.md` automatically (same dedup as
  `import-applications.mjs`).
- **Learned answers out** — free-text answers you type into a form the
  extension didn't already have a value for are appended to
  `application-answers.learned.md`, a sibling of `application-answers.md`
  **outside this repo**. Review and merge them yourself; self-ID, salary, and
  other sensitive fields are never sent here.

Nothing here talks to the network beyond `127.0.0.1`. Every route but
`/health` requires the token; a stray webpage cannot use this even while it's
running, because it never sends `Access-Control-Allow-Origin` for anyone
else's cross-origin requests.

Stop it with Ctrl+C when you're done job-hunting for the day — nothing else
depends on it staying up.
