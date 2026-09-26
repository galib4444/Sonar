/**
 * Logging utilities with rate limiting for error messages.
 *
 * Every log/info/warn/error call is also appended to a capped ring buffer in
 * chrome.storage.local (key BEKAR_DEBUG_LOG_KEY) so bugs that happen while
 * nobody has DevTools open can still be diagnosed afterward — see
 * initGlobalErrorCapture() for the uncaught-error/rejection hooks, and
 * settings.ts's "Copy Debug Log" button for how it gets read back out.
 * This is local-only: it never leaves the device except when the user
 * explicitly copies it themselves.
 */

const DEBUG = false; // Set to true for verbose console output (persistence is unaffected)
const ERROR_RATE_LIMIT_MS = 5000; // Max one error per 5 seconds to console

let lastErrorTime = 0;
let errorCount = 0;

function shouldLogError(): boolean {
  const now = Date.now();
  if (now - lastErrorTime > ERROR_RATE_LIMIT_MS) {
    lastErrorTime = now;
    errorCount = 0;
    return true;
  }
  errorCount++;
  return errorCount <= 1; // Allow first error in window
}

// ── Persistent ring buffer ──────────────────────────────────────────────────

export const BEKAR_DEBUG_LOG_KEY = 'bekar_debug_log';
const MAX_LOG_ENTRIES = 400;
const MAX_ARG_LENGTH = 4000; // field-list dumps (13-19 fields with long CSS selectors) need real room

export interface DebugLogEntry {
  ts: number;
  level: 'log' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

/** Best-effort context tag: which extension surface this call came from. */
function currentSource(): string {
  try {
    if (typeof window === 'undefined') return 'background';
    const loc = (globalThis as unknown as { location?: Location }).location;
    if (loc?.protocol === 'chrome-extension:') return `page:${loc.pathname}`;
    return `content:${loc?.hostname ?? 'unknown'}`;
  } catch {
    return 'unknown';
  }
}

function stringifyArg(a: unknown): string {
  try {
    if (typeof a === 'string') return a;
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
}

function formatMessage(args: unknown[]): string {
  const s = args.map(stringifyArg).join(' ');
  return s.length > MAX_ARG_LENGTH ? s.slice(0, MAX_ARG_LENGTH) + '…' : s;
}

// In-memory queue, flushed to storage with a short debounce so a burst of
// calls (e.g. per-character typing simulation) doesn't do a storage
// read-modify-write per call.
let pending: DebugLogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(immediate: boolean): void {
  const chromeStorage = (globalThis as unknown as { chrome?: typeof chrome }).chrome?.storage?.local;
  if (!chromeStorage) return; // Not in an extension context (e.g. unit tests)

  const doFlush = () => {
    flushTimer = null;
    if (pending.length === 0) return;
    const batch = pending;
    pending = [];
    chromeStorage.get([BEKAR_DEBUG_LOG_KEY], (res: Record<string, unknown>) => {
      if (chrome.runtime.lastError) return; // extension context gone — drop silently
      const existing = Array.isArray(res?.[BEKAR_DEBUG_LOG_KEY]) ? (res[BEKAR_DEBUG_LOG_KEY] as DebugLogEntry[]) : [];
      const merged = [...existing, ...batch].slice(-MAX_LOG_ENTRIES);
      chromeStorage.set({ [BEKAR_DEBUG_LOG_KEY]: merged }, () => void chrome.runtime.lastError);
    });
  };

  if (immediate) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    doFlush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(doFlush, 400);
  }
}

function persist(level: DebugLogEntry['level'], args: unknown[]): void {
  try {
    pending.push({ ts: Date.now(), level, source: currentSource(), message: formatMessage(args) });
    // Errors/warnings are rare and high-signal — flush right away so a crash
    // right after doesn't lose them. log/info are batched.
    scheduleFlush(level === 'error' || level === 'warn');
  } catch {
    /* never let logging itself throw */
  }
}

/** Clear the persisted debug log (used by the Settings "Clear" button). */
export function clearDebugLog(): void {
  const chromeStorage = (globalThis as unknown as { chrome?: typeof chrome }).chrome?.storage?.local;
  chromeStorage?.set({ [BEKAR_DEBUG_LOG_KEY]: [] });
}

export function log(...args: unknown[]): void {
  persist('log', args);
  if (DEBUG) {
    console.log('[OA]', ...args);
  }
}

export function info(...args: unknown[]): void {
  persist('info', args);
  console.info('[OA]', ...args);
}

export function warn(...args: unknown[]): void {
  persist('warn', args);
  console.warn('[OA]', ...args);
}

export function error(...args: unknown[]): void {
  persist('error', args);
  if (shouldLogError()) {
    console.error('[OA]', ...args);
  }
}

/**
 * Catch what try/catch can't: uncaught exceptions and unhandled promise
 * rejections in this context. Call once per context (content script,
 * background service worker, and — optionally — extension pages) as early
 * as possible. Safe to call multiple times; only the first call attaches
 * listeners.
 */
let globalCaptureInstalled = false;
export function initGlobalErrorCapture(): void {
  if (globalCaptureInstalled) return;
  globalCaptureInstalled = true;
  try {
    const target = (typeof window !== 'undefined' ? window : (globalThis as unknown as { self?: typeof self }).self) as
      | Window
      | typeof self
      | undefined;
    if (!target) return;
    target.addEventListener('error', (e: ErrorEvent) => {
      error('[Uncaught]', e.message, e.filename ? `${e.filename}:${e.lineno}` : '');
    });
    target.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      const reason = e.reason instanceof Error ? `${e.reason.name}: ${e.reason.message}` : String(e.reason);
      error('[UnhandledRejection]', reason);
    });
  } catch {
    /* never let capture installation throw */
  }
}
