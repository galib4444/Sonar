/**
 * AI provider abstraction — Ollama (local), Gemini (cloud), or Claude
 * (cloud), switchable in Settings. Existing Ollama code paths delegate here
 * first; when the active provider is a cloud one they route to that
 * provider's REST API instead of localhost:11434.
 *
 * Cloud API keys live in browser.storage.local only — never in the repo.
 * Embeddings always stay on Ollama (cloud providers are chat/generation only
 * here).
 */

import browser from './browser-compat';

export type AIProviderName = 'ollama' | 'gemini' | 'claude';

export interface AIProviderConfig {
  provider: AIProviderName;
  geminiApiKey: string;
  geminiModel: string;
  claudeApiKey: string;
  claudeModel: string;
  /** Master switch for Gemini/Claude. False forces `provider` to 'ollama' everywhere Settings reads/writes it, regardless of what's stored — a deliberate extra layer over just clearing the API keys, for turning cloud use off without losing saved keys. */
  onlineEnabled: boolean;
}

export const DEFAULT_AI_PROVIDER_CONFIG: AIProviderConfig = {
  provider: 'ollama',
  geminiApiKey: '',
  geminiModel: 'gemini-3.1-pro-preview',
  claudeApiKey: '',
  claudeModel: 'claude-sonnet-5',
  onlineEnabled: true,
};

const STORAGE_KEY = 'aiProviderConfig';

export async function getAIProviderConfig(): Promise<AIProviderConfig> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored && typeof stored === 'object') {
      return { ...DEFAULT_AI_PROVIDER_CONFIG, ...(stored as Partial<AIProviderConfig>) };
    }
  } catch (err) {
    console.warn('[AIProvider] Failed to load config, using defaults:', err);
  }
  return { ...DEFAULT_AI_PROVIDER_CONFIG };
}

export async function saveAIProviderConfig(config: AIProviderConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: config });
}

// ── Voice constraints (imported from Sonar voice-dna.md) ───────────────

const VOICE_NOTES_KEY = 'voiceNotes';

export async function saveVoiceNotes(notes: string): Promise<void> {
  await browser.storage.local.set({ [VOICE_NOTES_KEY]: notes });
}

/**
 * Voice constraints block for generation system prompts. Empty string when
 * no voice notes were imported, so callers can concatenate blindly.
 */
export async function voicePromptBlock(maxChars = 4000): Promise<string> {
  try {
    const result = await browser.storage.local.get(VOICE_NOTES_KEY);
    const notes = result[VOICE_NOTES_KEY] as string | undefined;
    if (!notes) return '';
    return `\nVOICE CONSTRAINTS (follow these when writing as the candidate):\n${notes.slice(0, maxChars)}\n`;
  } catch {
    return '';
  }
}

// ── Gemini client ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  timeout?: number;
  maxTokens?: number;
  onChunk?: (text: string) => void;
}

/** Common shape both cloud clients (Gemini, Claude) expose, so callers can treat them interchangeably. */
export interface AIChatClient {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  isAvailable(): Promise<boolean>;
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function toGeminiBody(messages: ChatMessage[], options?: ChatOptions) {
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  return {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents,
    generationConfig: {
      temperature: options?.temperature ?? 0.1,
      // Thinking-tier Pro models spend part of this budget on hidden reasoning
      // before the visible output, so 4096 truncated real resume-tailoring JSON
      // mid-string. 16384 leaves headroom for both on a full-resume response.
      maxOutputTokens: options?.maxTokens ?? 16384,
    },
  };
}

export class GeminiClient implements AIChatClient {
  constructor(
    private apiKey: string,
    private model: string = DEFAULT_AI_PROVIDER_CONFIG.geminiModel
  ) {}

  private async request(path: string, body: unknown, signal: AbortSignal): Promise<Response> {
    return fetch(`${GEMINI_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
      signal,
    });
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = options?.model?.startsWith('gemini') ? options.model : this.model;
    const controller = new AbortController();
    // Matches chatStream's timeout below — Pro-tier "thinking" models can take
    // 30-40s+ on a real resume-tailoring prompt, leaving little margin at 60s.
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 120000);
    try {
      const resp = await this.request(
        `/models/${model}:generateContent`,
        toGeminiBody(messages, options),
        controller.signal
      );
      if (!resp.ok) {
        const errText = await resp.text().catch(() => resp.statusText);
        throw new Error(`Gemini error ${resp.status}: ${errText}`);
      }
      const data = await resp.json();
      const text: string | undefined = data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('');
      if (!text) {
        const block = data.promptFeedback?.blockReason;
        throw new Error(block ? `Gemini blocked the prompt: ${block}` : 'Empty Gemini response');
      }
      return text;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Gemini request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Streaming chat via SSE. Resolves with the full text. */
  async chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = options?.model?.startsWith('gemini') ? options.model : this.model;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 120000);
    try {
      const resp = await this.request(
        `/models/${model}:streamGenerateContent?alt=sse`,
        toGeminiBody(messages, options),
        controller.signal
      );
      if (!resp.ok) {
        const errText = await resp.text().catch(() => resp.statusText);
        throw new Error(`Gemini error ${resp.status}: ${errText}`);
      }
      let full = '';
      const reader = resp.body?.getReader();
      if (!reader) {
        // No stream support — fall back to buffered body
        const data = await resp.json();
        full = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
        if (full) options?.onChunk?.(full);
        return full;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      const LF = String.fromCharCode(10);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(LF);
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta: string | undefined = data.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text ?? '')
              .join('');
            if (delta) {
              full += delta;
              options?.onChunk?.(delta);
            }
          } catch {
            /* incomplete SSE line */
          }
        }
      }
      return full;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Gemini request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async isAvailable(): Promise<boolean> {
    const result = await this.checkAvailability();
    return result.ok;
  }

  /**
   * Same check as isAvailable(), but keeps the actual failure reason
   * instead of collapsing it to a boolean — an invalid API key (401/403),
   * an invalid model name (404), and a network error all show the same
   * generic "check the API key and model name" to the user otherwise,
   * which makes a real Settings-page failure undiagnosable from the UI
   * alone.
   */
  async checkAvailability(): Promise<{ ok: boolean; detail?: string }> {
    try {
      // GET /models/{model} fetches one specific model and takes no query
      // params — pageSize belongs only to the list-all-models endpoint
      // (GET /models with no name). Sending it here 400s unconditionally,
      // regardless of whether the API key or model name are actually valid.
      const resp = await fetch(`${GEMINI_BASE}/models/${this.model}`, {
        headers: { 'x-goog-api-key': this.apiKey },
      });
      if (resp.ok) return { ok: true };
      const body = await resp.text().catch(() => '');
      let message = body;
      try {
        message = JSON.parse(body)?.error?.message ?? body;
      } catch { /* not JSON */ }
      return { ok: false, detail: `${resp.status}: ${message}`.slice(0, 300) };
    } catch (err) {
      return { ok: false, detail: err instanceof Error ? err.message : 'Network error' };
    }
  }
}

/**
 * The active Gemini client, or null when the provider is Ollama or no API key
 * is configured. Callers use this as: delegate to Gemini when non-null, else
 * run the existing Ollama path.
 */
export async function getActiveGeminiClient(): Promise<GeminiClient | null> {
  const config = await getAIProviderConfig();
  if (!config.onlineEnabled || config.provider !== 'gemini' || !config.geminiApiKey) return null;
  return new GeminiClient(config.geminiApiKey, config.geminiModel);
}

// ── Claude client ────────────────────────────────────────────────────────────

const CLAUDE_BASE = 'https://api.anthropic.com/v1';
const CLAUDE_VERSION = '2023-06-01';

/**
 * Claude only accepts 'user'/'assistant' turns in `messages`; system content
 * is a separate top-level field. Consecutive system messages are joined.
 *
 * Deliberately omits `temperature`/`top_p`/`top_k`: current-generation models
 * (Sonnet 5, Opus 5, Opus 4.7/4.8, Fable 5/5.1) reject sampling params with a
 * 400. Gating that per model ID would be a string-matching trap that rots as
 * models change; simplest correct behaviour is to never send it.
 */
function toClaudeBody(messages: ChatMessage[], options?: ChatOptions) {
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
  const claudeMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));
  return {
    ...(system ? { system } : {}),
    messages: claudeMessages,
    // Generous ceiling: adaptive thinking (on by default on current models)
    // spends max_tokens before any visible output, and a low cap truncates
    // the resume mid-bullet with no error.
    max_tokens: options?.maxTokens ?? 16000,
  };
}

export class ClaudeClient implements AIChatClient {
  constructor(
    private apiKey: string,
    private model: string = DEFAULT_AI_PROVIDER_CONFIG.claudeModel
  ) {}

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': CLAUDE_VERSION,
      // Anthropic blocks direct browser calls unless this header opts in —
      // there is no server-side proxy here, so the extension calls the API
      // directly from an extension page (never from a content script).
      'anthropic-dangerous-direct-browser-access': 'true',
    };
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = options?.model?.startsWith('claude') ? options.model : this.model;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 120000);
    try {
      const resp = await fetch(`${CLAUDE_BASE}/messages`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ model, ...toClaudeBody(messages, options) }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => resp.statusText);
        throw new Error(`Claude error ${resp.status}: ${errText}`);
      }
      const data = await resp.json();
      const text: string = (data.content ?? [])
        .filter((b: { type?: string }) => b.type === 'text')
        .map((b: { text?: string }) => b.text ?? '')
        .join('');
      if (!text) {
        if (data.stop_reason === 'refusal') throw new Error('Claude declined the request');
        throw new Error('Empty Claude response');
      }
      return text;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Claude request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Streaming chat via SSE. Resolves with the full text. */
  async chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = options?.model?.startsWith('claude') ? options.model : this.model;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 120000);
    try {
      const resp = await fetch(`${CLAUDE_BASE}/messages`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ model, ...toClaudeBody(messages, options), stream: true }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => resp.statusText);
        throw new Error(`Claude error ${resp.status}: ${errText}`);
      }
      let full = '';
      const reader = resp.body?.getReader();
      if (!reader) {
        const data = await resp.json();
        full = (data.content ?? [])
          .filter((b: { type?: string }) => b.type === 'text')
          .map((b: { text?: string }) => b.text ?? '')
          .join('');
        if (full) options?.onChunk?.(full);
        return full;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      const LF = String.fromCharCode(10);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(LF);
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
              const delta: string = data.delta.text ?? '';
              if (delta) {
                full += delta;
                options?.onChunk?.(delta);
              }
            }
          } catch {
            /* incomplete SSE line */
          }
        }
      }
      return full;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Claude request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * A real (tiny) POST /v1/messages, not just a model-lookup GET — a GET
   * validates the API key and model ID but nothing about the request shape,
   * so it can report "Connected!" while every real generation 400s on a
   * request-body incompatibility. This exercises the same body builder.
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.checkAvailability();
    return result.ok;
  }

  /** Same check as isAvailable(), but keeps the actual failure reason — see GeminiClient.checkAvailability(). */
  async checkAvailability(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const resp = await fetch(`${CLAUDE_BASE}/messages`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          model: this.model,
          ...toClaudeBody([{ role: 'user', content: 'Hi' }], { maxTokens: 1 }),
        }),
      });
      if (resp.ok) return { ok: true };
      const body = await resp.text().catch(() => '');
      let message = body;
      try {
        message = JSON.parse(body)?.error?.message ?? body;
      } catch { /* not JSON */ }
      return { ok: false, detail: `${resp.status}: ${message}`.slice(0, 300) };
    } catch (err) {
      return { ok: false, detail: err instanceof Error ? err.message : 'Network error' };
    }
  }
}

/**
 * The active Claude client, or null when the provider is not Claude or no
 * API key is configured.
 */
export async function getActiveClaudeClient(): Promise<ClaudeClient | null> {
  const config = await getAIProviderConfig();
  if (config.provider !== 'claude' || !config.claudeApiKey) return null;
  return new ClaudeClient(config.claudeApiKey, config.claudeModel);
}

/**
 * The active cloud client (Gemini or Claude), or null when the provider is
 * Ollama or the selected cloud provider has no API key configured. Callers
 * use this as: delegate to the cloud client when non-null, else run the
 * existing Ollama path.
 */
export async function getActiveCloudClient(): Promise<AIChatClient | null> {
  const config = await getAIProviderConfig();
  if (!config.onlineEnabled) return null;
  if (config.provider === 'gemini' && config.geminiApiKey) {
    return new GeminiClient(config.geminiApiKey, config.geminiModel);
  }
  if (config.provider === 'claude' && config.claudeApiKey) {
    return new ClaudeClient(config.claudeApiKey, config.claudeModel);
  }
  return null;
}
