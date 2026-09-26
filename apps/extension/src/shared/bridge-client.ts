/**
 * Client for the local Sonar bridge (apps/bridge/server.mjs).
 *
 * Off by default. Every call here is a no-op unless the user has turned the
 * bridge on and pasted in the token it printed on first run — this is the
 * gate that keeps the CLAUDE.md privacy-lock claim true, the same shape as
 * ai-provider.ts's getActiveGeminiClient() returning null.
 *
 * All three calls are best-effort: a bridge that isn't running (most of the
 * time — it's a script you start manually) must never surface an error to
 * the user or block anything. They just silently no-op.
 */

import browser from './browser-compat';
import type { JobApplication, FieldSchema } from './types';
import { saveUserProfile, type UserProfile } from './profile';
import { saveAnswerBank } from './answer-bank';
import { saveVoiceNotes } from './ai-provider';
import { classifyFieldSync, isSensitiveIdField } from './field-classifier';

export interface BridgeConfig {
  enabled: boolean;
  url: string;
  token: string;
  lastProfileSyncAt?: number;
}

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  enabled: false,
  url: 'http://127.0.0.1:4100',
  token: '',
};

const STORAGE_KEY = 'bridgeConfig';

export async function getBridgeConfig(): Promise<BridgeConfig> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as Partial<BridgeConfig> | undefined;
    return { ...DEFAULT_BRIDGE_CONFIG, ...stored };
  } catch {
    return { ...DEFAULT_BRIDGE_CONFIG };
  }
}

export async function saveBridgeConfig(config: BridgeConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: config });
}

/** True only when the user has turned the bridge on and set both url + token. */
function isConfigured(config: BridgeConfig): boolean {
  return config.enabled && !!config.url && !!config.token;
}

function authHeaders(config: BridgeConfig): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` };
}

export interface BridgeTestResult {
  ok: boolean;
  message: string;
}

/** GET /health. Safe to call even when not configured — used by the Settings "Test" button. */
export async function testBridgeConnection(config: BridgeConfig): Promise<BridgeTestResult> {
  if (!config.url) return { ok: false, message: 'Enter a bridge URL first.' };
  try {
    const resp = await fetch(`${config.url.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(3000) });
    if (!resp.ok) return { ok: false, message: `Bridge responded HTTP ${resp.status}.` };
    const data = await resp.json();
    return {
      ok: true,
      message: data.hasProfile
        ? 'Connected. extension-profile.json found on disk.'
        : 'Connected, but extension-profile.json has not been exported yet.',
    };
  } catch {
    return { ok: false, message: 'Could not reach the bridge. Is `node server.mjs` running in apps/bridge?' };
  }
}

export interface ProfilePullResult {
  ok: boolean;
  message: string;
}

/**
 * GET /profile and apply it — same shape onboarding's importProfileBundle()
 * uses for a manually-picked extension-profile.json. No-ops silently when
 * the bridge isn't configured; call sites don't need to check first.
 */
export async function pullProfileFromBridge(): Promise<ProfilePullResult> {
  const config = await getBridgeConfig();
  if (!isConfigured(config)) return { ok: false, message: 'Local bridge is off.' };

  let bundle: any;
  try {
    const resp = await fetch(`${config.url.replace(/\/$/, '')}/profile`, {
      headers: authHeaders(config),
      signal: AbortSignal.timeout(5000),
    });
    if (resp.status === 401) return { ok: false, message: 'Bridge rejected the token — check Settings.' };
    if (resp.status === 404) return { ok: false, message: 'Bridge has no extension-profile.json yet — run the export script.' };
    if (!resp.ok) return { ok: false, message: `Bridge responded HTTP ${resp.status}.` };
    bundle = await resp.json();
  } catch {
    return { ok: false, message: 'Could not reach the bridge (not running?).' };
  }

  if (bundle?.format !== 'bekar-apply-profile' || !bundle.profile) {
    return { ok: false, message: 'Bridge returned an unrecognized profile shape.' };
  }

  const profile = bundle.profile as UserProfile;
  profile.lastUpdated = Date.now();
  await saveUserProfile(profile);
  if (Array.isArray(bundle.answerBank) && bundle.answerBank.length) {
    await saveAnswerBank(bundle.answerBank);
  }
  if (typeof bundle.voiceNotes === 'string' && bundle.voiceNotes.trim()) {
    await saveVoiceNotes(bundle.voiceNotes);
  }

  config.lastProfileSyncAt = Date.now();
  await saveBridgeConfig(config);
  return { ok: true, message: 'Profile synced from Sonar.' };
}

/**
 * POST /applications with a single tracked application. Fire-and-forget:
 * swallows every error so a missing bridge never affects the fill/track flow.
 */
export async function pushApplicationToBridge(app: JobApplication): Promise<void> {
  const config = await getBridgeConfig();
  if (!isConfigured(config)) return;
  try {
    await fetch(`${config.url.replace(/\/$/, '')}/applications`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({ applications: [app] }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* bridge not running — ignore */
  }
}

// ── What's safe to learn out to disk ────────────────────────────────────────

/**
 * Canonical fields classifyFieldSync() can return that must never leave
 * chrome.storage.local for a plain-text file, regardless of how long the
 * answer is: self-ID, salary, and direct contact/identity fields.
 */
const SENSITIVE_CANONICAL_FIELDS = new Set([
  'gender', 'race_ethnicity', 'veteran_status', 'disability_status',
  'sexual_orientation', 'pronouns', 'salary_expectation', 'ssn',
  'date_of_birth', 'phone', 'email', 'address', 'zip_code',
]);

const MIN_LEARNED_ANSWER_LENGTH = 40;

/**
 * True only for long-form free-text answers worth saving as reusable prose
 * (the kind application-answers.md already holds) — never for short fields,
 * enums, or anything self-ID/salary/contact-shaped. This is the filter
 * between "the extension remembers it" (always, in storage.local) and
 * "the extension writes it to a file on disk" (only this).
 */
export function isLearnableLongFormField(field: FieldSchema, value: string): boolean {
  if (field.tagName !== 'TEXTAREA') return false;
  const trimmed = value.trim();
  if (trimmed.length < MIN_LEARNED_ANSWER_LENGTH) return false;
  // Belt-and-suspenders: SENSITIVE_CANONICAL_FIELDS below keys on the
  // *classified* canonical field, which is undefined whenever classification
  // doesn't recognize the label — check the label itself directly too, so
  // this doesn't rely on the TEXTAREA-only + 40-char-minimum checks above
  // being the only thing standing between an SSN-shaped label and the bridge.
  if (isSensitiveIdField(field.label)) return false;
  const canonical = classifyFieldSync(field.label || '', field.type || field.tagName, field.name || '');
  return !SENSITIVE_CANONICAL_FIELDS.has(canonical);
}

/** POST /answers. Fire-and-forget, same swallow-everything contract as pushApplicationToBridge. */
export async function pushLearnedAnswerToBridge(question: string, answer: string): Promise<void> {
  const config = await getBridgeConfig();
  if (!isConfigured(config)) return;
  try {
    await fetch(`${config.url.replace(/\/$/, '')}/answers`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({ question, answer }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* bridge not running — ignore */
  }
}

/**
 * POST /resume-feedback. Fire-and-forget, same swallow-everything contract as
 * pushLearnedAnswerToBridge — feedback typed into the Resume Tailor chat
 * panel, queued on disk for a later `/resume learn` pass.
 */
export async function pushResumeFeedbackToBridge(entry: {
  message: string;
  timestamp: number;
  jobTitle?: string;
  company?: string;
}): Promise<void> {
  const config = await getBridgeConfig();
  if (!isConfigured(config)) return;
  try {
    await fetch(`${config.url.replace(/\/$/, '')}/resume-feedback`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* bridge not running — ignore */
  }
}
