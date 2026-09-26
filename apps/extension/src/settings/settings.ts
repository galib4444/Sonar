/**
 * Settings page logic
 */
import browser from '../shared/browser-compat';
import { getSettings, setSettings } from '../shared/storage';
import { log, error, initGlobalErrorCapture, clearDebugLog, BEKAR_DEBUG_LOG_KEY, type DebugLogEntry } from '../shared/log';
initGlobalErrorCapture();
import { getOllamaConfig, saveOllamaConfig, testOllamaConnection, DEFAULT_OLLAMA_CONFIG } from '../shared/ollama-config';
import { getAIProviderConfig, saveAIProviderConfig, GeminiClient, ClaudeClient, DEFAULT_AI_PROVIDER_CONFIG } from '../shared/ai-provider';
import { getTrackerSyncConfig, saveTrackerSyncConfig, syncApplicationsToSheets } from '../shared/tracker-sync';
import { getBridgeConfig, saveBridgeConfig, testBridgeConnection, pullProfileFromBridge, DEFAULT_BRIDGE_CONFIG } from '../shared/bridge-client';
import { setHTML } from '../shared/html';

async function init(): Promise<void> {
  const settings = await getSettings();

  // --- Toggles ---
  const enabledToggle = document.getElementById('toggle-enabled');
  const dryrunToggle = document.getElementById('toggle-dryrun');

  if (enabledToggle) {
    enabledToggle.classList.toggle('active', settings.enabled);
    enabledToggle.setAttribute('aria-checked', String(settings.enabled));
    enabledToggle.addEventListener('click', async () => {
      const next = !enabledToggle.classList.contains('active');
      enabledToggle.classList.toggle('active', next);
      enabledToggle.setAttribute('aria-checked', String(next));
      await setSettings({ enabled: next });
    });
  }

  if (dryrunToggle) {
    dryrunToggle.classList.toggle('active', settings.dryRun);
    dryrunToggle.setAttribute('aria-checked', String(settings.dryRun));
    dryrunToggle.addEventListener('click', async () => {
      const next = !dryrunToggle.classList.contains('active');
      dryrunToggle.classList.toggle('active', next);
      dryrunToggle.setAttribute('aria-checked', String(next));
      await setSettings({ dryRun: next });
    });
  }

  // --- Job Discovery settings ---
  await setSettings({ scheduledSearchEnabled: false });
  const notifToggle = document.getElementById('toggle-notifications');
  const prefLearnToggle = document.getElementById('toggle-pref-learn');
  const intervalSelect = document.getElementById('select-search-interval') as HTMLSelectElement | null;
  const lastSearchEl = document.getElementById('last-search-time');

  function wireToggle(el: HTMLElement | null, key: keyof typeof settings, onChange?: () => void) {
    if (!el) return;
    el.classList.toggle('active', !!(settings as any)[key]);
    el.setAttribute('aria-checked', String(!!(settings as any)[key]));
    el.addEventListener('click', async () => {
      const next = !el.classList.contains('active');
      el.classList.toggle('active', next);
      el.setAttribute('aria-checked', String(next));
      await setSettings({ [key]: next } as any);
      onChange?.();
    });
  }

  wireToggle(notifToggle, 'notificationsEnabled');
  wireToggle(prefLearnToggle, 'preferenceLearnEnabled');
  // scheduled search toggle is inert — do not wire it

  if (intervalSelect) {
    intervalSelect.value = String(settings.scheduledSearchIntervalHours ?? 8);
    intervalSelect.addEventListener('change', async () => {
      await setSettings({ scheduledSearchIntervalHours: parseInt(intervalSelect.value, 10) });
      browser.runtime.sendMessage({ kind: 'UPDATE_SEARCH_SCHEDULE' }).catch(() => {});
    });
  }

  document.getElementById('btn-test-notification')?.addEventListener('click', async () => {
    await browser.runtime.sendMessage({ kind: 'TEST_NOTIFICATION' });
    showFeedback('feedback-test-notif');
  });

  document.getElementById('btn-clear-prefs')?.addEventListener('click', async () => {
    await browser.runtime.sendMessage({ kind: 'CLEAR_PREFERENCES' });
    showFeedback('feedback-clear-prefs');
  });

  try {
    const prefResp = await browser.runtime.sendMessage({ kind: 'GET_LEARNED_PREFERENCES' });
    if (lastSearchEl && prefResp?.lastRun) {
      const d = new Date(prefResp.lastRun);
      lastSearchEl.textContent = d.toLocaleString();
    }
  } catch {}

  // --- Update Resume (re-upload & re-parse) ---
  const reuploadBtn = document.getElementById('btn-reupload-resume');
  const reuploadInput = document.getElementById('reupload-resume-input') as HTMLInputElement | null;
  const reuploadFeedback = document.getElementById('feedback-reupload') as HTMLElement | null;

  function showReuploadStatus(msg: string, isError = false): void {
    if (!reuploadFeedback) return;
    reuploadFeedback.textContent = msg;
    reuploadFeedback.style.display = 'inline';
    reuploadFeedback.style.color = isError ? '#dc2626' : '#16a34a';
  }

  async function extractTextForSettings(file: File): Promise<string> {
    const name = file.name.toLowerCase();
    if (file.type === 'text/plain' || name.endsWith('.txt')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
      });
    }
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) throw new Error('PDF reader not available. Please reload the page and try again.');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    }
    if (name.endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = (window as any).mammoth;
      if (!mammoth) throw new Error('DOCX reader not available. Please reload the page and try again.');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (!result.value?.trim()) throw new Error('Could not extract text from DOCX file.');
      return result.value;
    }
    throw new Error(`Unsupported file type. Please upload a PDF, DOCX, or TXT file.`);
  }

  if (reuploadBtn && reuploadInput) {
    reuploadBtn.addEventListener('click', () => reuploadInput.click());

    reuploadInput.addEventListener('change', async () => {
      const file = reuploadInput.files?.[0];
      if (!file) return;
      reuploadInput.value = '';

      reuploadBtn.setAttribute('disabled', 'true');
      showReuploadStatus('Parsing resume...');

      try {
        const resumeText = await extractTextForSettings(file);

        // Quality gate
        const nonPrintable = (resumeText.match(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g) || []).length;
        if (nonPrintable / Math.max(resumeText.length, 1) > 0.05) {
          throw new Error('File appears garbled or is a scanned image. Use a text-based PDF, DOCX, or TXT.');
        }
        if (resumeText.trim().length < 100) {
          throw new Error('Extracted text is too short. Is the file empty?');
        }

        showReuploadStatus('AI is analyzing your resume...');
        const response = await browser.runtime.sendMessage({ kind: 'PARSE_RESUME', resumeText });

        if (response?.kind === 'RESUME_PARSED' && response.profile) {
          // Merge: preserve selfId, workAuth, professional links — overwrite skills/work/education/summary
          const existing = (await browser.storage.local.get('userProfile'))?.userProfile || {};
          const merged = {
            ...existing,
            skills: response.profile.skills || existing.skills || [],
            work: response.profile.work || existing.work || [],
            education: response.profile.education || existing.education || [],
            summary: response.profile.summary || existing.summary || '',
            resumeText,
            lastUpdated: Date.now(),
          };
          await browser.storage.local.set({ userProfile: merged });
          showReuploadStatus('Profile updated!');
        } else {
          throw new Error(response?.error || 'Parse failed. Please try again.');
        }
      } catch (err) {
        showReuploadStatus(err instanceof Error ? err.message : 'Failed to update resume.', true);
      } finally {
        reuploadBtn.removeAttribute('disabled');
      }
    });
  }

  // --- Export Profile ---
  document.getElementById('btn-export-profile')?.addEventListener('click', async () => {
    try {
      const result = await browser.storage.local.get('userProfile');
      const profile = result.userProfile;
      if (!profile) { alert('No profile found. Set up your profile first.'); return; }
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      showFeedback('feedback-export');
    } catch (err) { error('Export failed:', err); }
  });

  // --- Debug Log ---
  document.getElementById('btn-copy-debug-log')?.addEventListener('click', async () => {
    const resultEl = document.getElementById('debug-log-result');
    try {
      const result = await browser.storage.local.get(BEKAR_DEBUG_LOG_KEY);
      const entries = (result[BEKAR_DEBUG_LOG_KEY] as DebugLogEntry[] | undefined) ?? [];
      if (entries.length === 0) {
        if (resultEl) { resultEl.textContent = 'No entries yet.'; resultEl.style.display = 'block'; }
        return;
      }
      const text = entries
        .map(e => `${new Date(e.ts).toISOString()} [${e.level}] [${e.source}] ${e.message}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      showFeedback('feedback-debug-log');
      if (resultEl) { resultEl.textContent = `Copied ${entries.length} entries.`; resultEl.style.display = 'block'; }
    } catch (err) {
      error('Copy debug log failed:', err);
      if (resultEl) { resultEl.textContent = 'Copy failed — see console.'; resultEl.style.display = 'block'; }
    }
  });

  document.getElementById('btn-clear-debug-log')?.addEventListener('click', async () => {
    clearDebugLog();
    const resultEl = document.getElementById('debug-log-result');
    if (resultEl) { resultEl.textContent = 'Cleared.'; resultEl.style.display = 'block'; }
  });

  // --- View Learned Values ---
  document.getElementById('btn-view-learned')?.addEventListener('click', async () => {
    await browser.storage.local.set({ showLearnedValues: true });
    browser.tabs.create({ url: browser.runtime.getURL('onboarding/onboarding.html') });
  });

  // --- Reset Self-ID ---
  document.getElementById('btn-clean-selfid')?.addEventListener('click', async () => {
    if (!confirm('Reset Self-ID data (Gender, Race, Disability, Veteran Status) to defaults?\n\nYour personal info and work history will not be affected.')) return;
    try {
      const result = await browser.storage.local.get('userProfile');
      const profile = result.userProfile;
      if (!profile) { alert('No profile found.'); return; }
      profile.selfId = {
        gender: [], race: [], orientation: [],
        veteran: 'Decline to self-identify',
        transgender: 'Decline to self-identify',
        disability: 'Decline to self-identify',
      };
      profile.lastUpdated = Date.now();
      await browser.storage.local.set({ userProfile: profile });
      showFeedback('feedback-selfid');
    } catch (err) { error('Self-ID reset failed:', err); }
  });

  // --- Clear All Applications ---
  document.getElementById('btn-clear-apps')?.addEventListener('click', async () => {
    if (!confirm('Delete ALL tracked job applications?\n\nThis cannot be undone.')) return;
    try {
      const allKeys = await browser.storage.local.get(null);
      const summaryKeys = Object.keys(allKeys).filter(k => k.startsWith('dailySummary_'));
      if (summaryKeys.length > 0) {
        await browser.storage.local.remove(summaryKeys);
      }
      showFeedback('feedback-clear');
    } catch (err) { error('Clear apps failed:', err); }
  });

  // --- Danger Zone: Clear All Data ---
  const confirmPanel = document.getElementById('danger-confirm-panel');

  document.getElementById('btn-open-clear-all')?.addEventListener('click', () => {
    confirmPanel?.classList.add('open');
    confirmPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  document.getElementById('btn-cancel-clear')?.addEventListener('click', () => {
    confirmPanel?.classList.remove('open');
  });

  document.getElementById('btn-download-data')?.addEventListener('click', async () => {
    try {
      const allData = await browser.storage.local.get(null);
      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bekar-data-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) { error('Data download failed:', err); }
  });

  document.getElementById('btn-nuke-all')?.addEventListener('click', async () => {
    const nukeBtn = document.getElementById('btn-nuke-all') as HTMLButtonElement;
    if (nukeBtn) {
      nukeBtn.textContent = 'Deleting...';
      nukeBtn.disabled = true;
    }
    try {
      await browser.storage.local.clear();
      // Reload so settings UI reflects the cleared state
      window.location.reload();
    } catch (err) {
      error('Nuclear clear failed:', err);
      if (nukeBtn) { nukeBtn.textContent = 'Delete Everything'; nukeBtn.disabled = false; }
    }
  });

  // --- Storage usage ---
  try {
    const allData = await browser.storage.local.get(null);
    const bytes = new Blob([JSON.stringify(allData)]).size;
    const kb = (bytes / 1024).toFixed(1);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const pct = Math.min(100, (bytes / (10 * 1024 * 1024)) * 100);
    const fill = document.getElementById('storage-fill');
    const text = document.getElementById('storage-text');
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = bytes > 1024 * 1024 ? `${mb} MB used` : `${kb} KB used`;
  } catch { /* ignore */ }

  // --- Ollama Configuration section ---
  await initAIProviderSettings();
  await initTrackerSyncSettings();
  await initBridgeSettings();
  await initOllamaSettings();

  // --- Version ---
  try {
    const manifest = browser.runtime.getManifest();
    const v = manifest.version || '0.1.0';
    const versionText = document.getElementById('version-text');
    const footerVersion = document.getElementById('footer-version');
    if (versionText) versionText.textContent = v;
    if (footerVersion) footerVersion.textContent = `v${v}`;
  } catch { /* ignore */ }

  log('Settings page initialized');
}

function showFeedback(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2000);
}

async function initAIProviderSettings(): Promise<void> {
  const providerSelect = document.getElementById('settings-ai-provider') as HTMLSelectElement | null;
  const keyInput = document.getElementById('settings-gemini-key') as HTMLInputElement | null;
  const modelInput = document.getElementById('settings-gemini-model') as HTMLInputElement | null;
  const keyField = document.getElementById('gemini-key-field') as HTMLElement | null;
  const modelField = document.getElementById('gemini-model-field') as HTMLElement | null;
  const claudeKeyInput = document.getElementById('settings-claude-key') as HTMLInputElement | null;
  const claudeModelInput = document.getElementById('settings-claude-model') as HTMLInputElement | null;
  const claudeKeyField = document.getElementById('claude-key-field') as HTMLElement | null;
  const claudeModelField = document.getElementById('claude-model-field') as HTMLElement | null;
  const testResultEl = document.getElementById('settings-provider-test-result') as HTMLElement | null;
  const quickToggleGemini = document.getElementById('btn-quick-toggle-gemini') as HTMLButtonElement | null;
  const quickToggleOllama = document.getElementById('btn-quick-toggle-ollama') as HTMLButtonElement | null;
  const quickToggleClaude = document.getElementById('btn-quick-toggle-claude') as HTMLButtonElement | null;
  const onlineToggle = document.getElementById('settings-online-enabled') as HTMLInputElement | null;
  const geminiOption = providerSelect?.querySelector('option[value="gemini"]') as HTMLOptionElement | null;
  const claudeOption = providerSelect?.querySelector('option[value="claude"]') as HTMLOptionElement | null;

  const syncQuickToggleActiveState = () => {
    quickToggleGemini?.classList.toggle('active', providerSelect?.value === 'gemini');
    quickToggleOllama?.classList.toggle('active', providerSelect?.value === 'ollama');
    quickToggleClaude?.classList.toggle('active', providerSelect?.value === 'claude');
  };

  const syncFieldVisibility = () => {
    const onlineOn = onlineToggle?.checked ?? true;
    // Master switch: when off, Gemini/Claude are unreachable everywhere
    // (also enforced in ai-provider.ts's getActiveCloudClient/
    // getActiveGeminiClient, so this isn't just cosmetic) — the dropdown
    // options are disabled and the select is forced back to Ollama rather
    // than left pointing at a choice that can no longer take effect.
    if (geminiOption) geminiOption.disabled = !onlineOn;
    if (claudeOption) claudeOption.disabled = !onlineOn;
    if (quickToggleGemini) quickToggleGemini.disabled = !onlineOn;
    if (quickToggleClaude) quickToggleClaude.disabled = !onlineOn;
    if (!onlineOn && providerSelect && (providerSelect.value === 'gemini' || providerSelect.value === 'claude')) {
      providerSelect.value = 'ollama';
    }

    const isGemini = providerSelect?.value === 'gemini';
    const isClaude = providerSelect?.value === 'claude';
    if (keyField) keyField.style.display = isGemini ? '' : 'none';
    if (modelField) modelField.style.display = isGemini ? '' : 'none';
    if (claudeKeyField) claudeKeyField.style.display = isClaude ? '' : 'none';
    if (claudeModelField) claudeModelField.style.display = isClaude ? '' : 'none';
    syncQuickToggleActiveState();
  };

  try {
    const config = await getAIProviderConfig();
    if (providerSelect) providerSelect.value = config.provider;
    if (keyInput) keyInput.value = config.geminiApiKey;
    if (modelInput) modelInput.value = config.geminiModel;
    if (claudeKeyInput) claudeKeyInput.value = config.claudeApiKey;
    if (claudeModelInput) claudeModelInput.value = config.claudeModel;
    if (onlineToggle) onlineToggle.checked = config.onlineEnabled;
  } catch (err) {
    error('Failed to load AI provider config:', err);
  }
  syncFieldVisibility();

  providerSelect?.addEventListener('change', syncFieldVisibility);
  onlineToggle?.addEventListener('change', async () => {
    syncFieldVisibility();
    await saveCurrentProvider();
  });

  document.getElementById('btn-test-provider')?.addEventListener('click', async () => {
    if (testResultEl) {
      testResultEl.textContent = 'Testing...';
      testResultEl.className = 'ollama-test-result visible';
    }
    if (providerSelect?.value === 'gemini') {
      const key = keyInput?.value.trim() ?? '';
      if (!key) {
        if (testResultEl) {
          testResultEl.textContent = 'Enter a Gemini API key first.';
          testResultEl.className = 'ollama-test-result visible fail';
        }
        return;
      }
      const granted = await chrome.permissions.request({
        origins: ['https://generativelanguage.googleapis.com/*'],
      });
      if (!granted) {
        if (testResultEl) {
          testResultEl.textContent = 'Permission denied. Nothing was sent to Google.';
          testResultEl.className = 'ollama-test-result visible fail';
        }
        return;
      }
      const client = new GeminiClient(key, modelInput?.value.trim() || DEFAULT_AI_PROVIDER_CONFIG.geminiModel);
      const { ok, detail } = await client.checkAvailability();
      if (testResultEl) {
        testResultEl.textContent = ok
          ? 'Connected! Gemini API key and model verified.'
          : `Gemini rejected the request${detail ? `: ${detail}` : ' — check the API key and model name.'}`;
        testResultEl.className = `ollama-test-result visible ${ok ? 'ok' : 'fail'}`;
      }
    } else if (providerSelect?.value === 'claude') {
      const key = claudeKeyInput?.value.trim() ?? '';
      if (!key) {
        if (testResultEl) {
          testResultEl.textContent = 'Enter a Claude API key first.';
          testResultEl.className = 'ollama-test-result visible fail';
        }
        return;
      }
      const granted = await chrome.permissions.request({
        origins: ['https://api.anthropic.com/*'],
      });
      if (!granted) {
        if (testResultEl) {
          testResultEl.textContent = 'Permission denied. Nothing was sent to Anthropic.';
          testResultEl.className = 'ollama-test-result visible fail';
        }
        return;
      }
      const client = new ClaudeClient(key, claudeModelInput?.value.trim() || DEFAULT_AI_PROVIDER_CONFIG.claudeModel);
      const { ok, detail } = await client.checkAvailability();
      if (testResultEl) {
        testResultEl.textContent = ok
          ? 'Connected! Claude API key and model verified.'
          : `Claude rejected the request${detail ? `: ${detail}` : ' — check the API key and model name.'}`;
        testResultEl.className = `ollama-test-result visible ${ok ? 'ok' : 'fail'}`;
      }
    } else {
      const cfg = await getOllamaConfig();
      const result = await testOllamaConnection(cfg.endpoint);
      if (testResultEl) {
        testResultEl.textContent = result.success
          ? `Connected! Ollama v${result.version} at ${cfg.endpoint}`
          : `Cannot reach Ollama: ${result.error}`;
        testResultEl.className = `ollama-test-result visible ${result.success ? 'ok' : 'fail'}`;
      }
    }
  });

  const saveCurrentProvider = async (): Promise<boolean> => {
    try {
      const provider = (
        providerSelect?.value === 'gemini' ? 'gemini' : providerSelect?.value === 'claude' ? 'claude' : 'ollama'
      ) as 'gemini' | 'claude' | 'ollama';
      if (provider === 'gemini') {
        const granted = await chrome.permissions.request({
          origins: ['https://generativelanguage.googleapis.com/*'],
        });
        if (!granted) {
          if (testResultEl) {
            testResultEl.textContent = 'Permission denied. Gemini stays off — nothing was sent.';
            testResultEl.className = 'ollama-test-result visible fail';
          }
          return false;
        }
      } else if (provider === 'claude') {
        const granted = await chrome.permissions.request({
          origins: ['https://api.anthropic.com/*'],
        });
        if (!granted) {
          if (testResultEl) {
            testResultEl.textContent = 'Permission denied. Claude stays off — nothing was sent.';
            testResultEl.className = 'ollama-test-result visible fail';
          }
          return false;
        }
      }
      await saveAIProviderConfig({
        provider,
        geminiApiKey: keyInput?.value.trim() ?? '',
        geminiModel: modelInput?.value.trim() || DEFAULT_AI_PROVIDER_CONFIG.geminiModel,
        claudeApiKey: claudeKeyInput?.value.trim() ?? '',
        claudeModel: claudeModelInput?.value.trim() || DEFAULT_AI_PROVIDER_CONFIG.claudeModel,
        onlineEnabled: onlineToggle?.checked ?? true,
      });
      showFeedback('feedback-provider');
      syncQuickToggleActiveState();
      return true;
    } catch (err) {
      error('Failed to save AI provider config:', err);
      return false;
    }
  };

  document.getElementById('btn-save-provider')?.addEventListener('click', saveCurrentProvider);

  // Quick toggle: flip the active provider and save in one click, without
  // reopening the dropdown — for going back and forth between providers
  // while comparing them. Gemini/Claude each require their own API key to
  // already be filled in; Ollama has no key requirement (always-allowed
  // localhost), so it switches immediately.
  const quickSwitchTo = async (provider: 'gemini' | 'claude' | 'ollama') => {
    if (!providerSelect) return;
    if (provider !== 'ollama' && !(onlineToggle?.checked ?? true)) {
      if (testResultEl) {
        testResultEl.textContent = 'Online providers are disabled — enable them above first.';
        testResultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    if (provider === 'gemini' && !keyInput?.value.trim()) {
      if (testResultEl) {
        testResultEl.textContent = 'Enter a Gemini API key first, then switch to it.';
        testResultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    if (provider === 'claude' && !claudeKeyInput?.value.trim()) {
      if (testResultEl) {
        testResultEl.textContent = 'Enter a Claude API key first, then switch to it.';
        testResultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    providerSelect.value = provider;
    syncFieldVisibility();
    await saveCurrentProvider();
  };
  quickToggleGemini?.addEventListener('click', () => quickSwitchTo('gemini'));
  quickToggleOllama?.addEventListener('click', () => quickSwitchTo('ollama'));
  quickToggleClaude?.addEventListener('click', () => quickSwitchTo('claude'));
}

async function initTrackerSyncSettings(): Promise<void> {
  const urlInput = document.getElementById('settings-sheets-webhook') as HTMLInputElement | null;
  const resultEl = document.getElementById('settings-sync-result') as HTMLElement | null;

  try {
    const config = await getTrackerSyncConfig();
    if (urlInput) urlInput.value = config.webhookUrl;
    if (resultEl && config.lastSyncedAt) {
      resultEl.textContent = `Last synced ${new Date(config.lastSyncedAt).toLocaleString()} (${config.syncedIds.length} total rows pushed)`;
      resultEl.className = 'ollama-test-result visible';
    }
  } catch (err) {
    error('Failed to load tracker sync config:', err);
  }

  document.getElementById('btn-save-webhook')?.addEventListener('click', async () => {
    try {
      const url = urlInput?.value.trim() ?? '';
      if (url) {
        const granted = await chrome.permissions.request({
          origins: ['https://script.google.com/*', 'https://script.googleusercontent.com/*'],
        });
        if (!granted) {
          if (resultEl) {
            resultEl.textContent = 'Permission denied. Webhook not saved — nothing was sent.';
            resultEl.className = 'ollama-test-result visible fail';
          }
          return;
        }
      }
      const config = await getTrackerSyncConfig();
      config.webhookUrl = url;
      await saveTrackerSyncConfig(config);
      showFeedback('feedback-webhook');
    } catch (err) {
      error('Failed to save webhook URL:', err);
    }
  });

  document.getElementById('btn-sync-tracker')?.addEventListener('click', async () => {
    // Save any unsaved URL edit first so "Sync Now" does what the user sees.
    const config = await getTrackerSyncConfig();
    const typed = urlInput?.value.trim() ?? '';
    if (!typed) {
      if (resultEl) {
        resultEl.textContent = 'No webhook URL — nothing to send.';
        resultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    const granted = await chrome.permissions.request({
      origins: ['https://script.google.com/*', 'https://script.googleusercontent.com/*'],
    });
    if (!granted) {
      if (resultEl) {
        resultEl.textContent = 'Permission denied. Nothing was sent to Google.';
        resultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    if (typed !== config.webhookUrl) {
      config.webhookUrl = typed;
      await saveTrackerSyncConfig(config);
    }

    if (resultEl) {
      resultEl.textContent = 'Syncing…';
      resultEl.className = 'ollama-test-result visible';
    }
    const result = await syncApplicationsToSheets();
    if (resultEl) {
      if (result.ok) {
        resultEl.textContent =
          result.pushed === 0
            ? `Nothing new to sync (${result.skipped} already pushed).`
            : `Pushed ${result.pushed} application${result.pushed === 1 ? '' : 's'} to the sheet (${result.skipped} already there).`;
        resultEl.className = 'ollama-test-result visible ok';
      } else {
        resultEl.textContent = `Sync failed: ${result.error}`;
        resultEl.className = 'ollama-test-result visible fail';
      }
    }
  });
}

async function initBridgeSettings(): Promise<void> {
  const toggle = document.getElementById('toggle-bridge-enabled') as HTMLElement | null;
  const urlInput = document.getElementById('settings-bridge-url') as HTMLInputElement | null;
  const tokenInput = document.getElementById('settings-bridge-token') as HTMLInputElement | null;
  const resultEl = document.getElementById('settings-bridge-result') as HTMLElement | null;

  const setToggle = (on: boolean) => {
    if (!toggle) return;
    toggle.classList.toggle('active', on);
    toggle.setAttribute('aria-checked', String(on));
  };

  try {
    const config = await getBridgeConfig();
    setToggle(config.enabled);
    if (urlInput) urlInput.value = config.url || DEFAULT_BRIDGE_CONFIG.url;
    if (tokenInput) tokenInput.value = config.token;
    if (resultEl && config.lastProfileSyncAt) {
      resultEl.textContent = `Profile last synced ${new Date(config.lastProfileSyncAt).toLocaleString()}.`;
      resultEl.className = 'ollama-test-result visible';
    }
  } catch (err) {
    error('Failed to load bridge config:', err);
  }

  const currentConfig = async () => {
    const config = await getBridgeConfig();
    config.url = urlInput?.value.trim() || DEFAULT_BRIDGE_CONFIG.url;
    config.token = tokenInput?.value.trim() ?? '';
    return config;
  };

  toggle?.addEventListener('click', async () => {
    const config = await currentConfig();
    config.enabled = !config.enabled;
    await saveBridgeConfig(config);
    setToggle(config.enabled);
  });

  document.getElementById('btn-save-bridge')?.addEventListener('click', async () => {
    const config = await currentConfig();
    await saveBridgeConfig(config);
    showFeedback('feedback-bridge');
  });

  document.getElementById('btn-test-bridge')?.addEventListener('click', async () => {
    const config = await currentConfig();
    if (resultEl) {
      resultEl.textContent = 'Testing…';
      resultEl.className = 'ollama-test-result visible';
    }
    const result = await testBridgeConnection(config);
    if (resultEl) {
      resultEl.textContent = result.message;
      resultEl.className = `ollama-test-result visible ${result.ok ? 'ok' : 'fail'}`;
    }
  });

  document.getElementById('btn-sync-bridge-profile')?.addEventListener('click', async () => {
    const config = await currentConfig();
    await saveBridgeConfig(config);
    if (!config.enabled) {
      if (resultEl) {
        resultEl.textContent = 'Turn the bridge on first.';
        resultEl.className = 'ollama-test-result visible fail';
      }
      return;
    }
    if (resultEl) {
      resultEl.textContent = 'Syncing…';
      resultEl.className = 'ollama-test-result visible';
    }
    const result = await pullProfileFromBridge();
    if (resultEl) {
      resultEl.textContent = result.message;
      resultEl.className = `ollama-test-result visible ${result.ok ? 'ok' : 'fail'}`;
    }
  });
}

async function initOllamaSettings(): Promise<void> {
  const badge = document.getElementById('ollama-badge') as HTMLElement | null;
  const hint = document.getElementById('ollama-status') as HTMLElement | null;
  const epInput = document.getElementById('settings-ollama-endpoint') as HTMLInputElement | null;
  const chatInput = document.getElementById('settings-ollama-chat-model') as HTMLInputElement | null;
  const embInput = document.getElementById('settings-ollama-embed-model') as HTMLInputElement | null;
  const testResultEl = document.getElementById('settings-ollama-test-result') as HTMLElement | null;
  const localToggleLlama = document.getElementById('btn-quick-toggle-llama') as HTMLButtonElement | null;
  const localToggleQwen = document.getElementById('btn-quick-toggle-qwen') as HTMLButtonElement | null;

  // Load current config into inputs
  try {
    const config = await getOllamaConfig();
    if (epInput) epInput.value = config.endpoint;
    if (chatInput) chatInput.value = config.chatModel;
    if (embInput) embInput.value = config.embeddingModel;

    // Show connection status badge
    const result = await testOllamaConnection(config.endpoint);
    applyOllamaBadge(badge, hint, result, config.endpoint, config.enabled);
  } catch (err) {
    error('Failed to load Ollama config:', err);
  }

  // Test connection button
  document.getElementById('btn-test-ollama')?.addEventListener('click', async () => {
    const endpoint = epInput?.value.trim() || DEFAULT_OLLAMA_CONFIG.endpoint;
    if (testResultEl) {
      testResultEl.textContent = 'Testing...';
      testResultEl.className = 'ollama-test-result visible';
    }
    const result = await testOllamaConnection(endpoint);
    if (testResultEl) {
      if (!result.success) {
        testResultEl.textContent = `Cannot reach Ollama: ${result.error}`;
        testResultEl.className = 'ollama-test-result visible fail';
      } else if (result.corsBlocked) {
        setHTML(testResultEl,
          `<strong>CORS Blocked</strong> — Ollama v${result.version} is running but blocking this extension.<br><br>` +
          `<strong>Fix:</strong> Stop Ollama, then run this as ONE command in a new terminal:<br>` +
          `<code style="background:#1e2a3a;color:#fbbf24;padding:4px 8px;border-radius:4px;display:inline-block;margin-top:6px;font-size:12px;word-break:break-all;">` +
          `OLLAMA_ORIGINS='chrome-extension://*' ollama serve</code><br>` +
          `<span style="font-size:11px;color:#6b7280;margin-top:4px;display:inline-block;">Keep that terminal open, then click Test Connection again.</span>`);
        testResultEl.className = 'ollama-test-result visible fail';
      } else {
        testResultEl.textContent = `Connected! Ollama v${result.version} — AI features fully working`;
        testResultEl.className = 'ollama-test-result visible ok';
      }
    }
    applyOllamaBadge(badge, hint, result, endpoint, true);
  });

  const syncLocalModelToggleActiveState = () => {
    const model = chatInput?.value.trim();
    localToggleLlama?.classList.toggle('active', model === 'llama3.2');
    localToggleQwen?.classList.toggle('active', model === 'qwen2.5:7b');
  };
  syncLocalModelToggleActiveState();

  const saveOllamaSettings = async (): Promise<boolean> => {
    try {
      const endpoint = epInput?.value.trim() || DEFAULT_OLLAMA_CONFIG.endpoint;
      const chatModel = chatInput?.value.trim() || DEFAULT_OLLAMA_CONFIG.chatModel;
      const embeddingModel = embInput?.value.trim() || DEFAULT_OLLAMA_CONFIG.embeddingModel;

      const cfg = await getOllamaConfig();
      cfg.endpoint = endpoint;
      cfg.chatModel = chatModel;
      cfg.embeddingModel = embeddingModel;

      // Test before enabling — only enable if both reachable AND CORS is not blocked
      const result = await testOllamaConnection(endpoint);
      cfg.enabled = result.success && !result.corsBlocked;
      cfg.lastChecked = Date.now();
      await saveOllamaConfig(cfg);

      applyOllamaBadge(badge, hint, result, endpoint, cfg.enabled);
      showFeedback('feedback-ollama');
      syncLocalModelToggleActiveState();
      return true;
    } catch (err) {
      error('Failed to save Ollama config:', err);
      return false;
    }
  };

  // Save config button
  document.getElementById('btn-save-ollama')?.addEventListener('click', saveOllamaSettings);

  // Quick toggle: both models now tailor equally well (per-entry rewriting
  // makes every kept entry get a rewrite attempt regardless of model size —
  // see resume-tailor-service.ts), so this is a pure speed/model-size
  // choice, not a quality one. Sets the Chat Model field and saves
  // immediately, same one-click pattern as the Gemini/Claude toggle above.
  const quickSwitchLocalModel = async (model: 'llama3.2' | 'qwen2.5:7b') => {
    if (chatInput) chatInput.value = model;
    await saveOllamaSettings();
  };
  localToggleLlama?.addEventListener('click', () => quickSwitchLocalModel('llama3.2'));
  localToggleQwen?.addEventListener('click', () => quickSwitchLocalModel('qwen2.5:7b'));
}

/** Apply badge + hint text based on connection test result */
function applyOllamaBadge(
  badge: HTMLElement | null,
  hint: HTMLElement | null,
  result: Awaited<ReturnType<typeof testOllamaConnection>>,
  endpoint: string,
  enabled: boolean,
): void {
  if (!result.success) {
    if (badge) { badge.textContent = 'Offline'; badge.style.background = '#ffebee'; badge.style.color = '#c62828'; }
    if (hint) hint.textContent = enabled ? 'Cannot reach Ollama — check that it is running' : 'AI features disabled — configure below to enable';
  } else if (result.corsBlocked) {
    if (badge) { badge.textContent = 'CORS Blocked'; badge.style.background = '#fffbeb'; badge.style.color = '#d97706'; }
    if (hint) hint.textContent = `Ollama v${result.version} reachable but blocking extension. Stop Ollama, then run as one command: OLLAMA_ORIGINS='chrome-extension://*' ollama serve`;
  } else {
    if (badge) { badge.textContent = 'Connected'; badge.style.background = '#e8f5e9'; badge.style.color = '#2e7d32'; }
    if (hint) hint.textContent = `Ollama v${result.version} at ${endpoint} — AI features ready`;
  }
}

init();
