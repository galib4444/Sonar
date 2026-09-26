/**
 * Fetch wrapper for local Ollama API calls (localhost:11434 only).
 */
export async function ollamaFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, init);
}
