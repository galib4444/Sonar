/**
 * Captures free-text feedback typed into the Resume Tailor chat panel.
 *
 * Session-scoped in browser.storage.local; when the local bridge is enabled
 * it also pushes each message to disk (see pushResumeFeedbackToBridge in
 * bridge-client.ts) so a later `/resume learn` pass can read it directly as
 * feedback input instead of it having to be retyped from memory.
 *
 * Capture only — no confidence scoring, no automatic rule promotion. Turning
 * feedback into an actual resume-writing rule stays a human-approved step in
 * the `/resume learn` skill, same as a diffed shipped-vs-draft resume.
 */

import browser from './browser-compat';
import { pushResumeFeedbackToBridge } from './bridge-client';

export interface ResumeFeedbackEntry {
  message: string;
  timestamp: number;
  jobTitle?: string;
  company?: string;
}

const STORAGE_KEY = 'resumeFeedbackLog';
const MAX_ENTRIES = 200;

export async function recordResumeFeedback(
  message: string,
  context: { jobTitle?: string; company?: string } = {}
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) return;

  const entry: ResumeFeedbackEntry = {
    message: trimmed,
    timestamp: Date.now(),
    jobTitle: context.jobTitle,
    company: context.company,
  };

  try {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    const log: ResumeFeedbackEntry[] = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    log.push(entry);
    await browser.storage.local.set({
      [STORAGE_KEY]: log.length > MAX_ENTRIES ? log.slice(-MAX_ENTRIES) : log,
    });
  } catch (err) {
    console.warn('[ResumeFeedback] Failed to store feedback:', err);
  }

  pushResumeFeedbackToBridge(entry).catch(() => {});
}

export async function getResumeFeedbackLog(): Promise<ResumeFeedbackEntry[]> {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  } catch {
    return [];
  }
}

export async function clearResumeFeedbackLog(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}
