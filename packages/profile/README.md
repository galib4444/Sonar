# packages/profile

Everything that decides what goes on a resume. `apps/web` and `apps/extension`
consume this; `apps/scanner` does not.

## Setup

```bash
cp packages/profile/master-profile.example.json packages/profile/master-profile.json
```

Then replace every value with your own. `master-profile.json` is gitignored,
so your real contact details and work history never get committed. The
example is fictional.

## Files

| File | Role |
|---|---|
| `master-profile.example.json` | Fictional sample showing the schema. Copy it to start. |
| `master-profile.json` | *(yours, gitignored)* Structured transcription of your master resume, hand-built and hand-edited. The machine-readable source of truth. |
| `master-profile.ts` | Types, `selectProfile()`, `relevantOpenItems()`. Projects the JSON down to the `UserProfile` shape the apps expect. |
| `export-extension-profile.ts` | Writes `apps/extension/extension-profile.json` (gitignored) for the extension's profile import. |

## How the schema works

- Every bullet has an `id`, a `verified` flag, and `themes`
  (`engineering`, `ai`, `client`, `training`, `data`, `ops`, `marketing`,
  `leadership`, `it`, `product`).
- `verification: 'strict'` drops unverified bullets, certifications, and
  skills. An unverified *entry* (say, a job title you haven't confirmed) is
  flagged, never dropped: deleting a real job over its title is the wrong
  trade.
- `themes` rank bullets for a given role. They never filter an entry out.
- `blocked: true` keeps a project off every resume, even when asked for.
- `open_items` lists anything unconfirmed. `relevantOpenItems()` reports the
  ones that touch what is actually on the page.
- Projects can carry a `codename` next to their descriptive `name`. The
  resume shows `name`; the codename is for GitHub and interviews.

## Never regenerate `master-profile.json` by parsing a PDF

Not with `pdf-parse`, not through `/api/parse-resume`, not with an AI rewrite.
Extraction-then-rewrite is how stale facts come back: job titles get
inflated, headcounts drift, and technologies get attributed to the wrong
project. Edit the JSON by hand.

## Export for the extension

```bash
# from the repo root, Node 22.6+ (runs TypeScript natively)
node packages/profile/export-extension-profile.ts
```

It reads an optional answer bank from `../application-answers.md` (outside
the repo) and writes `apps/extension/extension-profile.json`, which you then
load from the extension's onboarding page.
