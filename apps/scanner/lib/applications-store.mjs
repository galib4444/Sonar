/**
 * Shared append/dedup logic for data/applications.md.
 *
 * Used by both import-applications.mjs (manual import of an extension data
 * export) and apps/bridge/server.mjs (the extension's automatic push). Kept
 * in one place so the two callers can't drift into double-appending or
 * disagreeing on the dedup key.
 */

import fs from 'fs';

const HEADER = '# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|------|---------|------|-------|--------|-----|--------|-------|\n';

const STATUS_LABEL = {
  submitted: 'Applied',
  interviewing: 'Interviewing',
  rejected: 'Rejected',
  accepted: 'Offer',
  withdrawn: 'Withdrawn',
};

const esc = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();

/**
 * Append `apps` (each `{ company, jobTitle, status, timestamp, notes?, url? }`,
 * status one of the JobApplication statuses from the extension) to the
 * markdown tracker at `trackerPath`, skipping rows already present.
 * Dedup key: Company + Role (case-insensitive), matching the existing rows'
 * table columns exactly so a manual import and a bridge push agree.
 *
 * Returns { added, skipped, total }.
 */
export function appendApplications(trackerPath, apps) {
  const candidates = (apps ?? []).filter((a) => a && a.status !== 'detected');
  if (candidates.length === 0) return { added: 0, skipped: 0, total: 0 };

  let tracker = fs.existsSync(trackerPath) ? fs.readFileSync(trackerPath, 'utf8') : HEADER;

  const existingRows = tracker
    .split('\n')
    .filter((l) => l.startsWith('|') && !l.startsWith('| #') && !l.startsWith('|--') && !l.startsWith('|-'));
  const seen = new Set(
    existingRows.map((l) => {
      const cells = l.split('|').map((c) => c.trim());
      return `${cells[3]}::${cells[4]}`.toLowerCase(); // Company::Role
    })
  );
  let nextNum = existingRows.length + 1;

  let added = 0;
  const newLines = [];
  for (const app of [...candidates].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))) {
    const dedupeKey = `${esc(app.company)}::${esc(app.jobTitle)}`.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const date = new Date(app.timestamp ?? Date.now()).toISOString().slice(0, 10);
    const status = STATUS_LABEL[app.status] ?? app.status ?? '';
    const notes = [esc(app.notes), app.url ? `[link](${app.url})` : ''].filter(Boolean).join(' — ');
    newLines.push(`| ${nextNum} | ${date} | ${esc(app.company)} | ${esc(app.jobTitle)} | — | ${status} | — | — | ${notes} |`);
    nextNum++;
    added++;
  }

  if (added > 0) {
    if (!tracker.endsWith('\n')) tracker += '\n';
    fs.writeFileSync(trackerPath, tracker + newLines.join('\n') + '\n');
  }

  return { added, skipped: candidates.length - added, total: candidates.length };
}
