import { describe, it, expect } from 'vitest';
import { hasRunawayRepetition, extractGuardTokens, isGrounded, looksLikeCompleteSentence } from './resume-output-guard';

describe('hasRunawayRepetition', () => {
  it('is false for normal resume text with no repeated lines', () => {
    const text = 'Jordan Rivera\nSpringfield, NY 10001 | (555) 010-0199 | jordan.rivera@example.com\n\nEXPERIENCE\nBuilt a sales funnel using GoHighLevel.';
    expect(hasRunawayRepetition(text)).toBe(false);
  });

  it('is true once a substantial line repeats 3+ times', () => {
    const line = 'AI Trainer (Contract) — Acme AI Labs (Dec 2025 - Present)';
    const text = [line, 'bullet one', line, 'bullet two', line, 'bullet three'].join('\n');
    expect(hasRunawayRepetition(text)).toBe(true);
  });

  it('ignores short repeated lines (section headers, blank separators)', () => {
    const text = ['EXPERIENCE', 'a bullet', 'EXPERIENCE', 'another bullet', 'EXPERIENCE'].join('\n');
    expect(hasRunawayRepetition(text)).toBe(false);
  });
});

describe('extractGuardTokens', () => {
  it('extracts numbers with common suffixes', () => {
    const tokens = extractGuardTokens('Grew revenue by 25% to $1.2M across 3 markets.');
    expect(tokens.has('25%')).toBe(true);
    expect(tokens.has('$1.2m')).toBe(true);
    expect(tokens.has('3')).toBe(true);
  });

  it('extracts capitalized proper nouns and tool names', () => {
    const tokens = extractGuardTokens('Built a sales funnel for Blue Lantern Cafe using GoHighLevel.');
    expect(tokens.has('lantern')).toBe(true);
    expect(tokens.has('cafe')).toBe(true);
    expect(tokens.has('gohighlevel')).toBe(true);
  });

});

describe('isGrounded', () => {
  const allowed = extractGuardTokens(
    'Jordan Rivera\n\nEXPERIENCE\nAssociate — Riverside Tech Incubator (RTI) (Feb 2025 - Present)\n' +
    '- Built a sales funnel for Blue Lantern Cafe using GoHighLevel.\n\nSKILLS\nPython, React, AWS'
  );

  it('allows a rewrite that only reuses facts already present in the resume', () => {
    expect(isGrounded('Used GoHighLevel and Python to automate the Blue Lantern Cafe sales funnel.', allowed)).toBe(true);
  });

  it('does not reject a rewrite merely because it leads with a capitalized action verb not found in the resume', () => {
    // Regression case: an earlier version of this check pulled every
    // capitalized word from the candidate, including its own leading verb
    // ("Optimized", "Streamlined", ...) — since VOICE_RULES makes every
    // bullet one sentence, that verb is capitalized purely by sentence
    // position, not because it's a real fact, and it will almost never
    // already appear capitalized somewhere else in the resume. That made
    // ordinary bullet rewrites silently revert to the original wording on
    // every single tailoring pass.
    expect(isGrounded('Optimized the sales funnel for Blue Lantern Cafe using GoHighLevel.', allowed)).toBe(true);
  });

  it('still rejects a non-leading capitalized word that introduces an unverifiable fact', () => {
    expect(isGrounded('Streamlined onboarding for Vercel using GoHighLevel.', allowed)).toBe(false);
  });

  it('rejects a rewrite that introduces a company not anywhere in the resume', () => {
    expect(isGrounded('Built systems used by Anthropic to automate sales.', allowed)).toBe(false);
  });

  it('rejects a rewrite that invents a metric not anywhere in the resume', () => {
    expect(isGrounded('Increased conversion by 40% for the client.', allowed)).toBe(false);
  });
});

describe('looksLikeCompleteSentence', () => {
  it('allows an ordinary complete bullet', () => {
    expect(looksLikeCompleteSentence('Built a sales funnel for Blue Lantern Cafe using GoHighLevel.')).toBe(true);
  });

  it('allows real hyphenated and possessive words without flagging them as orphan single letters', () => {
    // Regression case: a naive `\b[A-Za-z]+\b` split reads "e-commerce" as
    // ["e", "commerce"] and "Dylana's" as ["Dylana", "s"] — both false
    // positives confirmed against every bullet in the real master profile.
    expect(looksLikeCompleteSentence("Built the e-commerce foundation for launch.")).toBe(true);
    expect(looksLikeCompleteSentence("Edited videos for Dylana's Sweet Treat INC.")).toBe(true);
  });

  it('treats a curly/smart apostrophe the same as a straight one', () => {
    // Regression case: confirmed live from a real llama3.2 tailoring run —
    // "client’s" (curly apostrophe, what models commonly emit) split
    // into ["client", "s"] and flagged "s" as an orphan single-letter word,
    // rejecting an otherwise perfectly valid, complete rewrite.
    expect(looksLikeCompleteSentence('Rebuilt a restaurant client’s website in three days.')).toBe(true);
  });

  it('allows a real, complete rewrite that simply has no trailing period', () => {
    // Regression case: llama3.2's genuine, well-formed rewrites frequently
    // skip the trailing period. An earlier version of this check required
    // terminal punctuation and rejected the large majority of that model's
    // legitimate work as a result — confirmed against a real tailoring run.
    expect(looksLikeCompleteSentence('Designed, prototyped, and shipped full-stack features rapidly')).toBe(true);
  });

  it('does not catch a mid-word truncation that leaves no orphan short word or overlong merge (a known, accepted gap)', () => {
    // "text ta" has no single-letter word and no overlong merged word, so
    // this specific shape isn't caught — the alternative (requiring
    // terminal punctuation) rejects far more legitimate content than it
    // catches real corruption, per the regression case above.
    expect(looksLikeCompleteSentence('Evaluate model accuracy across audio, visual, and text ta')).toBe(true);
  });

  it('rejects a bullet with an orphan single-letter word from a dropped character', () => {
    expect(looksLikeCompleteSentence('Built with Sam, t intern previously onboarded on the scheduling app.')).toBe(false);
  });

  it('rejects a bullet with two words merged by a dropped space', () => {
    expect(looksLikeCompleteSentence('Identified high-impacengineering opportunities to solve problems.')).toBe(false);
  });
});
