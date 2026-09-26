/**
 * Answer bank — curated long-form answers exported from Sonar
 * (packages/profile/export-extension-profile.ts). Used as grounded context
 * for free-text screening questions and cover letters, so the AI reuses
 * vetted wording instead of inventing claims.
 */

import { chromeCompat } from './browser-compat';

export interface AnswerBankEntry {
  question: string;
  answer: string;
}

const ANSWER_BANK_KEY = 'answerBank';

export async function saveAnswerBank(entries: AnswerBankEntry[]): Promise<void> {
  await chromeCompat.storage.local.set({ [ANSWER_BANK_KEY]: entries });
}

export async function getAnswerBank(): Promise<AnswerBankEntry[]> {
  try {
    const result = await chromeCompat.storage.local.get(ANSWER_BANK_KEY);
    return (result[ANSWER_BANK_KEY] as AnswerBankEntry[] | undefined) ?? [];
  } catch {
    return [];
  }
}

/**
 * Render the answer bank as a compact context block for AI prompts.
 * Empty string when no bank is loaded, so callers can concatenate blindly.
 */
export async function answerBankPromptBlock(maxChars = 6000): Promise<string> {
  const bank = await getAnswerBank();
  if (!bank.length) return '';
  let block = 'Reference answers previously written by the candidate (reuse their facts and voice; never contradict them):\n';
  for (const { question, answer } of bank) {
    const next = `\nQ: ${question}\nA: ${answer}\n`;
    if (block.length + next.length > maxChars) break;
    block += next;
  }
  return block;
}
