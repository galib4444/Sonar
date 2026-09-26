/**
 * Resume Tailor page logic — loads profile resume, accepts JD input,
 * calls Ollama for tailoring + keyword gap analysis, displays results.
 */

import browser from '../shared/browser-compat';
import { getUserProfile } from '../shared/profile';
import { tailorResume, analyzeResumeFit, refineTailoredResume } from '../shared/resume-tailor-service';
import { getAIProviderConfig } from '../shared/ai-provider';
import { recordResumeFeedback } from '../shared/resume-feedback';
import type { ATSScoreResult } from '../shared/ats-scorer';
import { renderResumeHtml, RESUME_CSS, buildPrintDocument, DEFAULT_MARGIN_IN } from '../shared/resume-render';

// ── Margin preference ────────────────────────────────────────────────────────

const RESUME_EDITOR_PREFS_KEY = 'resumeEditorPrefs';

interface ResumeEditorPrefs {
  marginIn: number;
}

async function getMarginIn(): Promise<number> {
  try {
    const stored = await browser.storage.local.get(RESUME_EDITOR_PREFS_KEY);
    const prefs = stored[RESUME_EDITOR_PREFS_KEY] as Partial<ResumeEditorPrefs> | undefined;
    return typeof prefs?.marginIn === 'number' ? prefs.marginIn : DEFAULT_MARGIN_IN;
  } catch {
    return DEFAULT_MARGIN_IN;
  }
}

async function saveMarginIn(marginIn: number): Promise<void> {
  await browser.storage.local.set({ [RESUME_EDITOR_PREFS_KEY]: { marginIn } });
}

function escapeHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderATSList(el: HTMLElement, groupEl: HTMLElement, items: string[]): void {
  el.innerHTML = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
  groupEl.style.display = items.length ? '' : 'none';
}

function renderATSScore(ats: ATSScoreResult): void {
  atsSection.classList.add('visible');
  const scoreClass = ats.score >= 80 ? 'high' : ats.score >= 55 ? 'medium' : 'low';
  atsScoreEl.textContent = `${ats.score}%`;
  atsScoreEl.className = `ats-score ${scoreClass}`;
  renderATSList(atsIssuesEl, atsIssuesGroup, ats.issues);
  renderATSList(atsWarningsEl, atsWarningsGroup, ats.warnings);
  renderATSList(atsRecommendationsEl, atsRecommendationsGroup, ats.recommendations);
}

interface KeywordGap {
  present: string[];
  missing: string[];
  score: number;
}

function renderKeywordGap(keywordGap: KeywordGap): void {
  keywordSection.classList.add('visible');
  const scoreClass = keywordGap.score >= 70 ? 'high' : keywordGap.score >= 40 ? 'medium' : 'low';
  keywordScoreEl.textContent = `${keywordGap.score}%`;
  keywordScoreEl.className = `keyword-score ${scoreClass}`;
  keywordsPresentEl.innerHTML = keywordGap.present
    .map(k => `<span class="keyword-badge present">${escapeHtml(k)}</span>`)
    .join('');
  keywordsMissingEl.innerHTML = keywordGap.missing
    .map(k => `<span class="keyword-badge missing">${escapeHtml(k)}</span>`)
    .join('');
}

let currentMarginIn = DEFAULT_MARGIN_IN;

/** The one place the full structural parser runs — once, on the complete result. */
function showFinalResume(text: string): void {
  resultText.className = 'resume-doc';
  resultText.style.padding = `${currentMarginIn}in`;
  resultText.innerHTML = renderResumeHtml(text);
}

/**
 * Re-scores whatever `tailoredResult` currently holds against the JD —
 * shared by the initial tailor, the chat refine, and a manual edit save, so
 * the ATS/keyword panels always describe what's actually about to be
 * exported rather than a stale prior version.
 */
async function refreshScoring(jd: string): Promise<void> {
  const fit = await analyzeResumeFit(tailoredResult, jd);
  renderATSScore(fit.ats);
  renderKeywordGap(fit.keywordGap);
}

const resumeTextArea = document.getElementById('resume-text') as HTMLTextAreaElement;
const jdTextArea = document.getElementById('jd-text') as HTMLTextAreaElement;
const btnTailor = document.getElementById('btn-tailor') as HTMLButtonElement;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const btnScrape = document.getElementById('btn-scrape') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLElement;
const keywordSection = document.getElementById('keyword-section') as HTMLElement;
const keywordScoreEl = document.getElementById('keyword-score') as HTMLElement;
const keywordsPresentEl = document.getElementById('keywords-present') as HTMLElement;
const keywordsMissingEl = document.getElementById('keywords-missing') as HTMLElement;
const resultPanel = document.getElementById('result-panel') as HTMLElement;
const resultText = document.getElementById('result-text') as HTMLElement;
const atsSection = document.getElementById('ats-section') as HTMLElement;
const atsScoreEl = document.getElementById('ats-score') as HTMLElement;
const atsIssuesGroup = document.getElementById('ats-issues-group') as HTMLElement;
const atsIssuesEl = document.getElementById('ats-issues') as HTMLElement;
const atsWarningsGroup = document.getElementById('ats-warnings-group') as HTMLElement;
const atsWarningsEl = document.getElementById('ats-warnings') as HTMLElement;
const atsRecommendationsGroup = document.getElementById('ats-recommendations-group') as HTMLElement;
const atsRecommendationsEl = document.getElementById('ats-recommendations') as HTMLElement;
const chatPanel = document.getElementById('chat-panel') as HTMLElement;
const chatLog = document.getElementById('chat-log') as HTMLElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const btnChatSend = document.getElementById('btn-chat-send') as HTMLButtonElement;
const jdConfidenceWarning = document.getElementById('jd-confidence-warning') as HTMLElement;
const btnEdit = document.getElementById('btn-edit') as HTMLButtonElement;
const btnSaveEdit = document.getElementById('btn-save-edit') as HTMLButtonElement;
const btnCancelEdit = document.getElementById('btn-cancel-edit') as HTMLButtonElement;
const marginInput = document.getElementById('margin-input') as HTMLInputElement;
const btnResetMargin = document.getElementById('btn-reset-margin') as HTMLButtonElement;

let tailoredResult = '';
let sourceTabId: number | null = null;
let currentJobTitle = '';
let currentCompany = '';

// Wire up "Got it" dismiss for the PDF instructions banner
document.getElementById('pdf-instructions-close')?.addEventListener('click', () => {
  const el = document.getElementById('pdf-instructions');
  if (el) el.classList.remove('visible');
});

const OLLAMA_URL = 'http://localhost:11434';

/**
 * Ready-state check for whichever provider Settings has selected. A cloud
 * provider (Gemini/Claude) with a saved API key skips the Ollama probe
 * entirely — without this, a user on a cloud provider with Ollama not
 * running could never enable the Tailor button.
 */
async function checkProviderStatus(): Promise<boolean> {
  const indicatorEl = document.getElementById('ollama-indicator');
  const statusLabelEl = document.getElementById('ollama-status-label');

  const config = await getAIProviderConfig();
  if (config.provider === 'gemini' && config.geminiApiKey) {
    if (indicatorEl) indicatorEl.className = 'ollama-indicator connected';
    if (statusLabelEl) statusLabelEl.textContent = 'Gemini Ready';
    if (btnTailor) btnTailor.disabled = false;
    return true;
  }
  if (config.provider === 'claude' && config.claudeApiKey) {
    if (indicatorEl) indicatorEl.className = 'ollama-indicator connected';
    if (statusLabelEl) statusLabelEl.textContent = 'Claude Ready';
    if (btnTailor) btnTailor.disabled = false;
    return true;
  }

  try {
    const res = await fetch(`${OLLAMA_URL}/api/version`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      if (indicatorEl) { indicatorEl.className = 'ollama-indicator connected'; }
      if (statusLabelEl) { statusLabelEl.textContent = 'Ollama Connected'; }
      if (btnTailor) btnTailor.disabled = false;
      return true;
    }
  } catch { /* offline */ }
  if (indicatorEl) { indicatorEl.className = 'ollama-indicator disconnected'; }
  if (statusLabelEl) {
    statusLabelEl.innerHTML = 'Ollama Offline — <a href="https://ollama.com/download" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">Download</a> &amp; run <code style="font-size:11px;background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;">ollama serve</code>, or switch to Gemini/Claude in Settings.';
  }
  if (btnTailor) { btnTailor.disabled = true; btnTailor.title = 'Ollama must be running (or a cloud provider configured in Settings) to tailor your resume'; }
  return false;
}

/**
 * Not every scrape can tell the actual job posting apart from the rest of
 * the page — see job-description-scraper.ts's ExtractionConfidence doc
 * comment. A 'low' result already went through stripApplicationFormNoise()
 * as a backstop, but that's a blocklist, not a guarantee; surface it instead
 * of silently trusting it.
 */
function showJdConfidence(confidence: string | undefined): void {
  jdConfidenceWarning.hidden = confidence !== 'low';
}

// Once the user touches the JD themselves, the warning no longer describes
// what's actually in the box.
jdTextArea?.addEventListener('input', () => { jdConfidenceWarning.hidden = true; });

async function loadProfileResume(): Promise<void> {
  const profile = await getUserProfile();
  if (profile?.resumeText) {
    resumeTextArea.value = profile.resumeText;
    statusText.textContent = 'Resume loaded from active profile.';
  } else {
    statusText.textContent = 'No resume found. Paste your resume text.';
  }
}

async function loadPendingJD(): Promise<void> {
  try {
    const data = await browser.storage.local.get([
      'pending_tailor_jd', 'pending_tailor_title', 'pending_tailor_company',
      'pending_tailor_url', 'pending_tailor_source_tab', 'pending_tailor_confidence',
    ]);
    if (data.pending_tailor_jd && typeof data.pending_tailor_jd === 'string' && data.pending_tailor_jd.length > 10) {
      jdTextArea.value = data.pending_tailor_jd;
      showJdConfidence(data.pending_tailor_confidence as string | undefined);
      const parts: string[] = [];
      if (data.pending_tailor_title) {
        parts.push(data.pending_tailor_title);
        currentJobTitle = String(data.pending_tailor_title);
      }
      if (data.pending_tailor_company) {
        parts.push(`at ${data.pending_tailor_company}`);
        currentCompany = String(data.pending_tailor_company);
      }
      statusText.textContent = parts.length
        ? `Job description loaded: ${parts.join(' ')}`
        : 'Job description loaded from previous page.';
    }
    if (data.pending_tailor_source_tab && typeof data.pending_tailor_source_tab === 'number') {
      sourceTabId = data.pending_tailor_source_tab;
    }
    await browser.storage.local.remove([
      'pending_tailor_jd', 'pending_tailor_title', 'pending_tailor_company',
      'pending_tailor_url', 'pending_tailor_source_tab', 'pending_tailor_confidence',
    ]);
  } catch (err) {
    console.warn('Failed to load pending JD:', err);
  }
}

btnScrape?.addEventListener('click', async () => {
  try {
    statusText.textContent = 'Scraping job description...';
    const msg: any = { kind: 'SCRAPE_JOB_DESCRIPTION' };
    if (sourceTabId) msg.sourceTabId = sourceTabId;
    const response = await browser.runtime.sendMessage(msg);
    if (response?.text) {
      jdTextArea.value = response.text;
      showJdConfidence(response.confidence);
      statusText.textContent = response.confidence === 'low'
        ? 'Scraped, but not from a recognized job-description section — check it before tailoring.'
        : 'Job description scraped successfully.';
    } else {
      statusText.textContent = 'Could not extract job description. Paste it manually.';
    }
  } catch (err) {
    console.error('Scrape failed:', err);
    statusText.textContent = 'Scrape failed. Paste the job description manually.';
  }
});

btnTailor?.addEventListener('click', async () => {
  const resume = resumeTextArea.value.trim();
  const jd = jdTextArea.value.trim();

  if (!resume) {
    statusText.textContent = 'Please provide your resume text.';
    return;
  }
  if (!jd) {
    statusText.textContent = 'Please provide a job description.';
    return;
  }

  btnTailor.disabled = true;
  statusText.textContent = 'Tailoring resume with AI...';
  resultPanel.classList.add('visible');
  resultText.className = 'result-placeholder';
  resultText.textContent = 'Generating tailored resume...';
  tailoredResult = '';

  try {
    const tailored = await tailorResume(resume, jd);
    tailoredResult = tailored;
    showFinalResume(tailoredResult);

    // Score the tailored resume, not the original paste — this is what's
    // about to be exported, so the ATS/keyword numbers should describe it.
    await refreshScoring(jd);

    btnExport.disabled = false;
    btnCopy.disabled = false;
    btnEdit.disabled = false;
    chatPanel.classList.add('visible');
    chatInput.disabled = false;
    btnChatSend.disabled = false;
    statusText.textContent = 'Resume tailored successfully.';
  } catch (err) {
    console.error('Tailor failed:', err);
    statusText.textContent = `Error: ${err instanceof Error ? err.message : 'Tailoring failed'}. Is Ollama running (or a cloud provider configured)?`;
  } finally {
    btnTailor.disabled = false;
  }
});

btnCopy?.addEventListener('click', async () => {
  if (!tailoredResult) return;
  await navigator.clipboard.writeText(tailoredResult);
  const orig = btnCopy.textContent;
  btnCopy.textContent = 'Copied!';
  setTimeout(() => { btnCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`; }, 1500);
});

// ── Manual edit (plain text, not click-to-edit) ─────────────────────────────

function setOtherControlsDisabled(disabled: boolean): void {
  btnTailor.disabled = disabled;
  btnExport.disabled = disabled || !tailoredResult;
  btnCopy.disabled = disabled || !tailoredResult;
  btnEdit.disabled = disabled || !tailoredResult;
  chatInput.disabled = disabled;
  btnChatSend.disabled = disabled;
}

btnEdit?.addEventListener('click', () => {
  if (!tailoredResult) return;
  setOtherControlsDisabled(true);
  btnSaveEdit.style.display = '';
  btnCancelEdit.style.display = '';

  const textarea = document.createElement('textarea');
  textarea.id = 'result-edit-textarea';
  textarea.className = 'result-edit-textarea';
  textarea.value = tailoredResult;
  resultText.replaceWith(textarea);
});

function exitEditMode(newTextarea: HTMLElement): void {
  newTextarea.replaceWith(resultText);
  btnSaveEdit.style.display = 'none';
  btnCancelEdit.style.display = 'none';
  setOtherControlsDisabled(false);
}

btnSaveEdit?.addEventListener('click', async () => {
  const textarea = document.getElementById('result-edit-textarea') as HTMLTextAreaElement | null;
  if (!textarea) return;
  tailoredResult = textarea.value;
  showFinalResume(tailoredResult);
  exitEditMode(textarea);

  const jd = jdTextArea.value.trim();
  if (jd) {
    try {
      await refreshScoring(jd);
    } catch (err) {
      console.warn('Failed to re-score after manual edit:', err);
    }
  }
  statusText.textContent = 'Edit saved.';
});

btnCancelEdit?.addEventListener('click', () => {
  const textarea = document.getElementById('result-edit-textarea') as HTMLTextAreaElement | null;
  if (!textarea) return;
  exitEditMode(textarea);
});

// ── Margin control ───────────────────────────────────────────────────────────

function applyMargin(marginIn: number): void {
  currentMarginIn = marginIn;
  marginInput.value = String(marginIn);
  if (resultText.classList.contains('resume-doc')) {
    resultText.style.padding = `${marginIn}in`;
  }
}

marginInput?.addEventListener('change', () => {
  const value = parseFloat(marginInput.value);
  if (Number.isNaN(value)) return;
  const clamped = Math.min(1.0, Math.max(0.3, value));
  applyMargin(clamped);
  saveMarginIn(clamped).catch(() => {});
});

btnResetMargin?.addEventListener('click', () => {
  if (!confirm(`Reset margin to the default (${DEFAULT_MARGIN_IN}in)?`)) return;
  applyMargin(DEFAULT_MARGIN_IN);
  saveMarginIn(DEFAULT_MARGIN_IN).catch(() => {});
  statusText.textContent = 'Margin reset to default.';
});

function appendChatMessage(text: string, kind: 'feedback' | 'status'): void {
  const el = document.createElement('div');
  el.className = `chat-message ${kind}`;
  el.textContent = text;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendChatFeedback(): Promise<void> {
  const feedback = chatInput.value.trim();
  if (!feedback || !tailoredResult) return;
  const jd = jdTextArea.value.trim();

  chatInput.value = '';
  chatInput.disabled = true;
  btnChatSend.disabled = true;
  appendChatMessage(feedback, 'feedback');
  appendChatMessage('Revising...', 'status');

  try {
    const revised = await refineTailoredResume(resumeTextArea.value.trim(), tailoredResult, jd, feedback);
    tailoredResult = revised;
    showFinalResume(tailoredResult);
    chatLog.lastElementChild?.remove(); // drop "Revising..."
    appendChatMessage('Updated the resume above.', 'status');

    await refreshScoring(jd);
  } catch (err) {
    chatLog.lastElementChild?.remove(); // drop "Revising..."
    appendChatMessage(`Couldn't apply that: ${err instanceof Error ? err.message : 'unknown error'}`, 'status');
  } finally {
    chatInput.disabled = false;
    btnChatSend.disabled = false;
    chatInput.focus();
  }

  // Queue the raw feedback for a later /resume learn pass regardless of
  // whether the live revision succeeded — the complaint itself is still
  // useful signal even if this one call failed.
  recordResumeFeedback(feedback, { jobTitle: currentJobTitle, company: currentCompany }).catch(() => {});
}

btnChatSend?.addEventListener('click', () => { sendChatFeedback(); });
chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatFeedback();
});

btnExport?.addEventListener('click', async () => {
  if (!tailoredResult) return;

  // Show the step-by-step instructions banner immediately
  const instrEl = document.getElementById('pdf-instructions');
  if (instrEl) instrEl.classList.add('visible');

  statusText.textContent = 'Opening print window — set Destination → "Save as PDF" then click Save.';

  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      statusText.textContent = 'Please allow popups to export PDF.';
      return;
    }

    printWindow.document.write(buildPrintDocument(renderResumeHtml(tailoredResult), currentMarginIn));
    printWindow.document.close();
    // Called from here rather than an injected <script> in the print
    // document — an inline <script> in an extension-origin about:blank
    // window is a plausible silent CSP casualty, and this is more robust
    // regardless of whether that was actually happening.
    printWindow.focus();
    printWindow.print();
  } catch (err) {
    statusText.textContent = 'PDF export failed.';
    console.error('PDF export failed:', err);
  }
});

async function init(): Promise<void> {
  const styleEl = document.createElement('style');
  styleEl.textContent = RESUME_CSS;
  document.head.appendChild(styleEl);

  applyMargin(await getMarginIn());

  await loadProfileResume();
  await loadPendingJD();
  await checkProviderStatus();
}
init();
