#!/usr/bin/env node
/**
 * import-applications.mjs — append the extension's tracked applications to
 * data/applications.md so the whole pipeline is visible in one place.
 *
 * Source: the full-storage JSON the extension downloads from
 * Settings → Data Management → "Download My Data" (bekar-data-YYYY-MM-DD.json).
 * Applications live under its dailySummary_YYYY-MM-DD keys.
 *
 * This is the manual path. apps/bridge/server.mjs does the same append
 * (via lib/applications-store.mjs) automatically whenever the extension's
 * local bridge is turned on.
 *
 * Usage:
 *   node import-applications.mjs ~/Downloads/bekar-data-2026-09-03.json
 *
 * Rows already present in applications.md (matched by Company + Role) are
 * skipped, so re-running with a newer export is safe.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { appendApplications } from './lib/applications-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trackerPath = path.join(__dirname, 'data', 'applications.md');

const exportPath = process.argv[2];
if (!exportPath) {
  console.error('Usage: node import-applications.mjs <bekar-data-*.json>');
  process.exit(1);
}
if (!fs.existsSync(exportPath)) {
  console.error(`File not found: ${exportPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

// Collect applications from all dailySummary_* keys.
const apps = [];
for (const [key, value] of Object.entries(data)) {
  if (!key.startsWith('dailySummary_')) continue;
  for (const app of value?.applications ?? []) {
    apps.push(app);
  }
}

if (apps.length === 0) {
  console.log('No tracked applications found in the export.');
  process.exit(0);
}

const { added, skipped, total } = appendApplications(trackerPath, apps);
if (added === 0) {
  console.log(`All ${total} applications already in applications.md.`);
} else {
  console.log(`Appended ${added} application${added === 1 ? '' : 's'} to data/applications.md (${skipped} already present).`);
}
