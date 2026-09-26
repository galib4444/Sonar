# Bullet Rewriter Skill

## Purpose
Rewrite resume bullets to maximize keyword alignment with job description while maintaining truthfulness.

## Responsibilities
- Score existing bullets against JD keywords
- Rewrite top bullets to incorporate JD keywords naturally
- Use action verbs from knowledge base
- Ensure no hallucinated metrics or experiences
- Maintain quantified results from original bullets
- Keep bullets concise (≤ 2 lines at 11pt font)

## Input Schema
```typescript
interface BulletRewriterInput {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  match_score: MatchScoreResult;
  knowledge_base: {
    action_verbs: ActionVerbs;
    bullet_examples: BulletExample[];
  };
}
```

## Processing Steps

### 1. Score Existing Bullets
```typescript
// For each bullet, calculate:
//   - Keyword overlap with JD top 10 keywords
//   - Has quantified result? (contains numbers/%)
//   - Uses strong action verb?
//   - Length appropriate? (≤ 150 chars)
// Rank bullets by score
```

### 2. Select Bullets to Rewrite
```typescript
// Select top 6-8 bullets across all experiences
// Prioritize:
//   - Most recent experiences
//   - Bullets with numbers but missing keywords
//   - Bullets relevant to must-have requirements
```

### 3. Rewrite Using Gemini
```typescript
// For each selected bullet:
//   - Call Gemini with rewrite prompt
//   - Inject 1-2 JD keywords naturally
//   - Use action verb from knowledge base
//   - Preserve original metrics
//   - Validate no hallucinations
```

## Gemini Prompt Template
Located at: `.claude/skills/bullet-rewriter/prompts/rewrite-bullets.txt`

```
You are an expert resume writer optimizing bullets for ATS.

ORIGINAL BULLET:
{original_bullet}

JOB KEYWORDS TO INCORPORATE (use 1-2 naturally):
{jd_keywords}

APPROVED ACTION VERBS (use one):
{action_verbs}

RULES:
1. Preserve all numbers and metrics from original
2. Integrate 1-2 JD keywords naturally
3. Start with an approved action verb
4. Keep under 150 characters
5. Never invent achievements not in original
6. Maintain the core accomplishment

Return ONLY the rewritten bullet. No commentary.
```

## Output Schema
```typescript
interface BulletRewriteResult {
  original_bullets: string[];
  rewritten_bullets: Array<{
    original: string;
    rewritten: string;
    keywords_added: string[];
    action_verb_used: string;
    changes_made: string[];
  }>;
  validation: {
    no_hallucinations: boolean;
    metrics_preserved: boolean;
    length_ok: boolean;
  };
}
```

## Validation Rules

### No Hallucinations
```typescript
// Check that rewritten bullet:
//   - Doesn't add new companies
//   - Doesn't add new technologies not in original
//   - Doesn't inflate numbers (10% -> 50%)
//   - Doesn't change role responsibilities
```

### Metrics Preserved
```typescript
// Extract numbers from original: [10, 5%, $2M]
// Ensure ALL numbers appear in rewritten version
// Allow reformatting: "10 people" -> "team of 10"
```

### Length Check
```typescript
// Maximum 150 characters
// Approximately 2 lines at 11pt Calibri
// Flag if exceeds limit
```

## Action Verb Categories
Loaded from `knowledge-base/processed/action-verbs.json`:
- Leadership: Led, Managed, Directed, Coordinated, Spearheaded
- Achievement: Achieved, Delivered, Exceeded, Accomplished, Drove
- Technical: Developed, Implemented, Engineered, Architected, Built
- Analysis: Analyzed, Evaluated, Assessed, Investigated, Researched
- Communication: Presented, Documented, Collaborated, Facilitated
- Creativity: Designed, Created, Innovated, Pioneered, Launched

## Usage Notes
- Run after match-scorer to know which bullets to prioritize
- Always validate rewrites to prevent hallucinations
- Keep original bullets for user to review changes
- Limit rewrites to 6-8 bullets to maintain authenticity
