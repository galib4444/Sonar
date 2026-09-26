/**
 * Reads pending job postings back out of the Sonar Google Sheet — the
 * read side of the same Apps Script webhook `tracker-sync.ts` already
 * pushes tracked applications to (`sheets-webhook.gs`, deployed by hand into
 * the user's own Google account). This is not the extension "querying a job
 * board": the sheet only ever contains what `apps/scanner` already put
 * there. See the privacy-lock note in job-search-service.ts — that stub
 * stays inert; this module is a different data path entirely.
 *
 * Best-effort like bridge-client.ts: no webhook configured, or the request
 * fails, and every call here just returns an empty/false result. Never
 * throws, never surfaces an error banner on its own — but every failure is
 * logged via shared/log.ts, so it lands in Settings' "Copy Debug Log" even
 * when nobody had DevTools open when it happened.
 */

import { getTrackerSyncConfig } from './tracker-sync';
import { error as logError } from './log';

export interface SheetJob {
  tab: string;
  row: number;
  company: string;
  role: string;
  track: string;
  location: string;
  salary: string;
  source: string;
  url: string;
  resumeVersion: string;
  dateApplied: string;
  status: string;
  nextAction: string;
  nextActionDate: string;
  contact: string;
  notes: string;
  /** From the scanner's discovered posting date — blank if the scanner didn't have one. */
  postedDate: string;
  /** When this row was appended to the sheet — always set, the honest fallback when postedDate is blank. */
  dateAdded: string;
}

export type SheetFetchStatus =
  | 'ok'
  | 'not_configured'
  | 'unreachable'
  /** Webhook answered but has no `?action=list` handler — old .gs, needs redeploy. */
  | 'needs_redeploy';

export interface SheetFetchResult {
  jobs: SheetJob[];
  status: SheetFetchStatus;
}

/** Fetch every row from both sheet tabs. `timeoutMs` defaults to 8s — pass a shorter budget from UI that can't block (e.g. the popup). */
export async function fetchSheetJobs(timeoutMs = 8000): Promise<SheetFetchResult> {
  const config = await getTrackerSyncConfig();
  if (!config.webhookUrl) return { jobs: [], status: 'not_configured' };

  try {
    const url = `${config.webhookUrl.replace(/\/$/, '')}?action=list`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!resp.ok) {
      logError(`[sheets-jobs] list fetch: HTTP ${resp.status} ${resp.statusText}`);
      return { jobs: [], status: 'unreachable' };
    }
    const data = await resp.json();
    if (!data?.ok) {
      logError('[sheets-jobs] list fetch: response body had ok:false', data);
      return { jobs: [], status: 'unreachable' };
    }
    if (!Array.isArray(data.jobs)) return { jobs: [], status: 'needs_redeploy' };
    return { jobs: data.jobs as SheetJob[], status: 'ok' };
  } catch (err) {
    logError('[sheets-jobs] list fetch threw:', err instanceof Error ? err.message : err);
    return { jobs: [], status: 'unreachable' };
  }
}

/** Rows still open to apply to — the extension's "next action" queue. */
export async function fetchPendingSheetJobs(timeoutMs?: number): Promise<SheetFetchResult> {
  const result = await fetchSheetJobs(timeoutMs);
  return { ...result, jobs: result.jobs.filter((j) => (j.status || 'To Apply') === 'To Apply') };
}

export interface SheetUpdateResult {
  ok: boolean;
  updated: boolean;
  error?: string;
}

/**
 * Updates the Status (and optionally Date Applied) cell of the row matching
 * this URL, in place — never appends a new row. Used by "Mark Applied" /
 * "Skip" in the extension's Pipeline view.
 */
export async function markSheetJobStatus(
  url: string,
  status: string,
  dateApplied?: string,
): Promise<SheetUpdateResult> {
  const config = await getTrackerSyncConfig();
  if (!config.webhookUrl) {
    return { ok: false, updated: false, error: 'No webhook URL configured' };
  }

  try {
    const resp = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updateUrl: url, updateStatus: status, updateDateApplied: dateApplied }),
    });
    if (!resp.ok) {
      logError(`[sheets-jobs] update fetch: HTTP ${resp.status} ${resp.statusText}`);
      return { ok: false, updated: false, error: `Webhook returned HTTP ${resp.status}` };
    }
    const data = await resp.json();
    return { ok: !!data?.ok, updated: !!data?.updated };
  } catch (err) {
    logError('[sheets-jobs] update fetch threw:', err instanceof Error ? err.message : err);
    return { ok: false, updated: false, error: err instanceof Error ? err.message : 'Webhook request failed' };
  }
}
