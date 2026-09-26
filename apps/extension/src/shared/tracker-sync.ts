/**
 * Tracker sync — pushes tracked applications to the Sonar Google Sheets
 * webhook (the same Apps Script endpoint apps/scanner/push-to-sheets.mjs
 * uses), so the extension's Kanban tracker and the scanner pipeline land in
 * one place.
 *
 * Sync is manual (button in Settings), one-way, and de-duplicated by
 * application id/url. It never touches the application forms themselves —
 * fill-only stays fill-only.
 */

import browser from './browser-compat';
import type { JobApplication } from './types';
import { getAllApplications } from './storage';

export interface TrackerSyncConfig {
  webhookUrl: string;
  /** Normalized ids (id or url) already pushed, to avoid duplicate rows. */
  syncedIds: string[];
  lastSyncedAt: number;
}

const STORAGE_KEY = 'trackerSyncConfig';

export async function getTrackerSyncConfig(): Promise<TrackerSyncConfig> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as Partial<TrackerSyncConfig> | undefined;
    return { webhookUrl: '', syncedIds: [], lastSyncedAt: 0, ...stored };
  } catch {
    return { webhookUrl: '', syncedIds: [], lastSyncedAt: 0 };
  }
}

export async function saveTrackerSyncConfig(config: TrackerSyncConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: config });
}

function appKey(app: JobApplication): string {
  return app.id || app.url;
}

/** Map extension status values onto the sheet's status column vocabulary. */
const STATUS_MAP: Record<JobApplication['status'], string> = {
  detected: 'To Apply',
  submitted: 'Applied',
  interviewing: 'Interviewing',
  rejected: 'Rejected',
  accepted: 'Offer',
  withdrawn: 'Withdrawn',
};

function guessSource(url: string): string {
  if (url.includes('greenhouse.io')) return 'Greenhouse';
  if (url.includes('ashbyhq.com')) return 'Ashby';
  if (url.includes('lever.co')) return 'Lever';
  if (url.includes('bamboohr.com')) return 'BambooHR';
  if (url.includes('breezy.hr')) return 'Breezy';
  if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) return 'Workday';
  return 'Extension';
}

function toSheetRow(app: JobApplication) {
  return {
    company: app.company,
    role: app.jobTitle,
    track: '',
    location: '',
    salary: '',
    source: guessSource(app.url),
    url: app.url,
    resumeVersion: '',
    dateApplied: app.status === 'detected' ? '' : new Date(app.timestamp).toISOString().slice(0, 10),
    status: STATUS_MAP[app.status] ?? app.status,
    nextAction: '',
    nextActionDate: '',
    contact: '',
    notes: app.notes ?? '',
  };
}

export interface SyncResult {
  ok: boolean;
  pushed: number;
  skipped: number;
  error?: string;
}

/**
 * Push all not-yet-synced tracked applications to the webhook.
 * `getAllApplications()` already excludes 'detected' — only real applications
 * are pushed.
 */
export async function syncApplicationsToSheets(): Promise<SyncResult> {
  const config = await getTrackerSyncConfig();
  if (!config.webhookUrl) {
    return { ok: false, pushed: 0, skipped: 0, error: 'No webhook URL configured' };
  }

  const applications = await getAllApplications();
  const synced = new Set(config.syncedIds);
  const pending = applications.filter((app) => !synced.has(appKey(app)));

  if (pending.length === 0) {
    return { ok: true, pushed: 0, skipped: applications.length };
  }

  try {
    // Apps Script webhooks answer POSTs with a 302 to script.googleusercontent.com;
    // browser fetch follows it transparently.
    const resp = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: pending.map(toSheetRow) }),
    });
    if (!resp.ok) {
      return { ok: false, pushed: 0, skipped: 0, error: `Webhook returned HTTP ${resp.status}` };
    }
  } catch (err) {
    return {
      ok: false,
      pushed: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : 'Webhook request failed',
    };
  }

  config.syncedIds = [...synced, ...pending.map(appKey)];
  config.lastSyncedAt = Date.now();
  await saveTrackerSyncConfig(config);

  return { ok: true, pushed: pending.length, skipped: applications.length - pending.length };
}
