/**
 * Extracts structured facts from a job description via the active AI
 * provider (Ollama/Gemini/Claude — same routing as resume-tailor-service.ts).
 *
 * This is the one place AI is used in the ATS scoring path: job descriptions
 * are unstructured prose, and there's no reliable local way to pull out "the
 * top keywords a posting cares about" without understanding the text. The
 * scoring math itself happens afterward in ats-scorer.ts, deterministically —
 * the model extracts facts, it doesn't grade itself.
 */

import { ollamaFetch } from './ollama-fetch';
import { getOllamaConfig } from './ollama-config';
import { getActiveCloudClient } from './ai-provider';

const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_NUM_CTX = 8192;

export interface JDFacts {
  keywords_top_10: string[];
  must_haves: string[];
  seniority: string;
}

function buildPrompt(jobDescription: string): string {
  return `Extract structured facts from this job description.

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY a JSON object in exactly this shape (no markdown fences, no explanation, no extra keys):
{"keywords_top_10": ["skill1", "skill2"], "must_haves": ["requirement1", "requirement2"], "seniority": "entry"}

"keywords_top_10" — up to 10 of the most important technical skills, tools, and qualifications this posting asks for, in the posting's own wording.
"must_haves" — up to 6 hard requirements (years of experience, specific technology, a degree, a certification), not nice-to-haves.
"seniority" — one of: entry, mid, senior, staff, principal.`;
}

async function generateJson(prompt: string): Promise<string> {
  const cloud = await getActiveCloudClient();
  if (cloud) {
    return cloud.chat([{ role: 'user', content: prompt }], { temperature: 0.1 });
  }

  const ollamaConfig = await getOllamaConfig();
  const response = await ollamaFetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaConfig.chatModel,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0.1, num_predict: 1024, num_ctx: OLLAMA_NUM_CTX },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return (data.response ?? '').trim();
}

export async function analyzeJD(jobDescription: string): Promise<JDFacts> {
  const raw = await generateJson(buildPrompt(jobDescription));

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        keywords_top_10: Array.isArray(parsed.keywords_top_10) ? parsed.keywords_top_10.slice(0, 10) : [],
        must_haves: Array.isArray(parsed.must_haves) ? parsed.must_haves.slice(0, 6) : [],
        seniority: typeof parsed.seniority === 'string' ? parsed.seniority : 'mid',
      };
    }
  } catch {
    /* parsing failed */
  }

  return { keywords_top_10: [], must_haves: [], seniority: 'mid' };
}
