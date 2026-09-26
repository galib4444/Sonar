/**
 * Bullet Rewriter
 * Rewrites resume bullets to incorporate JD keywords while preventing hallucinations
 */

import type { UserProfile, JDInsights, BulletRewriteResult, RewrittenBullet } from '../types';
import { callGemini } from './gemini-client';
import { loadActionVerbs } from '../utils/knowledge-base';
import { extractMetrics } from '../utils/text';

/**
 * Rewrite resume bullets to align with JD keywords
 */
export async function rewriteBullets(
  userProfile: UserProfile,
  jdInsights: JDInsights
): Promise<BulletRewriteResult> {
  // Step 1: Score and select bullets to rewrite
  const allBullets = [
    ...userProfile.experience.flatMap((exp, expIdx) =>
      exp.bullets.map((bullet, bulletIdx) => ({
        original: bullet,
        source: exp.company,
        experienceIndex: expIdx,
        bulletIndex: bulletIdx,
        score: scoreBullet(bullet, jdInsights),
      }))
    ),
  ];

  // Sort by score and select top 6-8 bullets
  const bulletsToRewrite = allBullets
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(8, allBullets.length))
    .filter((b) => b.score < 8); // Only rewrite if not already well-aligned

  const rewrittenBullets: RewrittenBullet[] = [];

  // Step 2: Rewrite each selected bullet
  for (const bulletData of bulletsToRewrite) {
    try {
      const rewritten = await rewriteBullet(
        bulletData.original,
        jdInsights.keywords_top_10,
        bulletData.source
      );
      rewrittenBullets.push(rewritten);
    } catch (error) {
      console.error(`Failed to rewrite bullet: ${bulletData.original}`, error);
      // Keep original if rewriting fails
      rewrittenBullets.push({
        original: bulletData.original,
        rewritten: bulletData.original,
        keywords_added: [],
        action_verb_used: '',
        changes_made: ['Failed to rewrite - keeping original'],
      });
    }
  }

  // Step 3: Validate rewrites
  const validation = validateRewrites(
    rewrittenBullets,
    allBullets.map((b) => b.original)
  );

  return {
    original_bullets: bulletsToRewrite.map((b) => b.original),
    rewritten_bullets: rewrittenBullets,
    validation,
  };
}

/**
 * Score a single bullet against JD keywords
 */
function scoreBullet(bullet: string, jdInsights: JDInsights): number {
  let score = 0;

  // Has quantified results? (+3 points)
  const metrics = extractMetrics(bullet);
  if (metrics.length > 0) score += 3;

  // Contains JD keywords? (+2 points per keyword, max 4)
  const keywordMatches = jdInsights.keywords_top_10.filter((kw) =>
    bullet.toLowerCase().includes(kw.toLowerCase())
  );
  score += Math.min(keywordMatches.length * 2, 4);

  // Appropriate length? (+2 points)
  if (bullet.length >= 50 && bullet.length <= 150) score += 2;

  // Starts with action verb? (+1 point)
  const actionVerbs = loadActionVerbs();
  const allVerbs = Object.values(actionVerbs.action_verbs).flat();
  const startsWithVerb = allVerbs.some((verb) =>
    bullet.toLowerCase().startsWith(verb.toLowerCase())
  );
  if (startsWithVerb) score += 1;

  return score;
}

/**
 * Rewrite a single bullet
 */
async function rewriteBullet(
  originalBullet: string,
  jdKeywords: string[],
  company: string
): Promise<RewrittenBullet> {
  const actionVerbs = loadActionVerbs();
  const allVerbs = Object.values(actionVerbs.action_verbs).flat();

  // Extract metrics from original to preserve them
  const originalMetrics = extractMetrics(originalBullet);

  // Build prompt
  const prompt = `You are an expert resume writer optimizing bullets for ATS.

ORIGINAL BULLET:
${originalBullet}

JOB KEYWORDS TO INCORPORATE (use 1-2 naturally):
${jdKeywords.slice(0, 5).join(', ')}

APPROVED ACTION VERBS (use one to start):
${allVerbs.slice(0, 20).join(', ')}

ORIGINAL METRICS TO PRESERVE:
${originalMetrics.join(', ') || 'None'}

RULES:
1. Preserve ALL numbers and metrics from original
2. Integrate 1-2 JD keywords naturally
3. Start with an approved action verb
4. Keep under 150 characters
5. Never invent achievements not in original
6. Maintain the core accomplishment
7. Keep company name: ${company}

Return ONLY the rewritten bullet. No commentary.`;

  // Call Gemini
  const response = await callGemini({
    prompt,
    temperature: 0.7,
    maxTokens: 100,
  });

  const rewrittenText = response.text.trim();

  // Identify changes
  const keywordsAdded = jdKeywords.filter(
    (kw) =>
      rewrittenText.toLowerCase().includes(kw.toLowerCase()) &&
      !originalBullet.toLowerCase().includes(kw.toLowerCase())
  );

  const actionVerbUsed =
    allVerbs.find((verb) => rewrittenText.toLowerCase().startsWith(verb.toLowerCase())) ||
    '';

  const changes: string[] = [];
  if (keywordsAdded.length > 0) {
    changes.push(`Added keywords: ${keywordsAdded.join(', ')}`);
  }
  if (actionVerbUsed) {
    changes.push(`Used action verb: ${actionVerbUsed}`);
  }

  return {
    original: originalBullet,
    rewritten: rewrittenText,
    keywords_added: keywordsAdded,
    action_verb_used: actionVerbUsed,
    changes_made: changes,
  };
}

/**
 * Validate rewrites to prevent hallucinations
 */
function validateRewrites(
  rewrittenBullets: RewrittenBullet[]
): {
  no_hallucinations: boolean;
  metrics_preserved: boolean;
  length_ok: boolean;
} {
  let noHallucinations = true;
  let metricsPreserved = true;
  let lengthOk = true;

  for (const rewritten of rewrittenBullets) {
    // Check length
    if (rewritten.rewritten.length > 150) {
      lengthOk = false;
    }

    // Check metrics preserved
    const originalMetrics = extractMetrics(rewritten.original);
    const rewrittenMetrics = extractMetrics(rewritten.rewritten);

    // All original metrics should be present in rewritten
    for (const metric of originalMetrics) {
      if (!rewritten.rewritten.includes(metric)) {
        metricsPreserved = false;
        console.warn(`Metric lost in rewrite: ${metric}`);
      }
    }

    // Check for potential hallucinations
    // New metrics that weren't in original are suspicious
    const newMetrics = rewrittenMetrics.filter((m) => !originalMetrics.includes(m));
    if (newMetrics.length > 0) {
      noHallucinations = false;
      console.warn(`Potential hallucinated metrics: ${newMetrics.join(', ')}`);
    }
  }

  return {
    no_hallucinations: noHallucinations,
    metrics_preserved: metricsPreserved,
    length_ok: lengthOk,
  };
}
