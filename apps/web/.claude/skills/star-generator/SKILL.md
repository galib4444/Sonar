# STAR Generator Skill

## Purpose
Generate STAR (Situation, Task, Action, Result) behavioral interview answers aligned to job description requirements.

## Responsibilities
- Match user experiences to JD must-haves and key skills
- Generate 5 behavioral interview questions based on JD
- Create STAR-formatted answers using real user experiences
- Integrate JD keywords naturally into answers
- Validate no invented achievements
- Keep answers concise (≤ 120 words)

## Input Schema
```typescript
interface STARGeneratorInput {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  num_answers: number; // Default: 5
}
```

## Processing Steps

### 1. Experience Matching
```typescript
// For each JD must-have and top skill:
//   - Find relevant user experiences
//   - Match by keyword overlap
//   - Prioritize quantified achievements
```

### 2. Question Generation
```typescript
// Generate 5 behavioral questions covering:
//   - Leadership/teamwork (if mentioned in JD)
//   - Technical challenge (if technical role)
//   - Conflict resolution
//   - Project ownership
//   - Specific skill from JD
```

### 3. STAR Construction
```typescript
// For each question:
//   - Situation: Set context from user experience
//   - Task: Define the goal/challenge
//   - Action: Describe what user did (integrate JD keywords)
//   - Result: Quantified outcome
```

## Gemini Prompt Template
Located at: `.claude/skills/star-generator/prompts/generate-star.txt`

```
You are a career coach preparing a candidate for behavioral interviews.

ROLE: {jd_title} at {jd_company}

JD MUST-HAVES:
{must_haves}

JD TOP SKILLS:
{top_skills}

CANDIDATE EXPERIENCE:
{user_experience_bullets}

Generate 5 STAR behavioral interview answers tailored to this role.

RULES:
1. Each answer must be ≤ 120 words total
2. Format: S (Situation), T (Task), A (Action), R (Result)
3. Integrate 1-2 JD keywords naturally in Action section
4. Use ONLY real experiences from candidate's profile
5. Quantify results when possible; if not, use [ADD METRIC]
6. Never invent achievements not in the profile

Return JSON:
{
  "answers": [
    {
      "question": "Tell me about a time you...",
      "star": {
        "situation": "...",
        "task": "...",
        "action": "...",
        "result": "..."
      },
      "keywords_used": ["keyword1", "keyword2"]
    }
  ]
}
```

## Output Schema
```typescript
interface STARAnswer {
  question: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keywords_used: string[];
  experience_source: string; // Which company/project this came from
}

interface STARGeneratorOutput {
  answers: STARAnswer[];
  validation: {
    all_from_real_experience: boolean;
    no_hallucinations: boolean;
    length_ok: boolean;
  };
}
```

## Validation Rules

### No Hallucinations
```typescript
// Check that each STAR answer:
//   - References a company from user's experience
//   - Doesn't add technologies not in user's profile
//   - Doesn't inflate numbers beyond user's actual achievements
```

### Length Check
```typescript
// Total words in S+T+A+R ≤ 120 words
// Individual components:
//   Situation: ~25 words
//   Task: ~20 words
//   Action: ~40 words (most important)
//   Result: ~35 words
```

### Real Experience Check
```typescript
// Extract company names and projects mentioned in STAR
// Verify all appear in user_profile.experience or user_profile.projects
```

## Example Output
```json
{
  "question": "Tell me about a time you led a cross-functional project",
  "star": {
    "situation": "At Acme Corp, our Q3 product launch was delayed due to design-eng misalignment",
    "task": "I was tasked with aligning both teams on a unified timeline for a 6-week sprint",
    "action": "I facilitated 3 design sprints, created a shared Jira board, and implemented weekly syncs using Agile methodology",
    "result": "We delivered the launch 2 weeks early, improved cross-team satisfaction from 6 to 8.5/10, and shipped 4 key features"
  },
  "keywords_used": ["cross-functional", "Agile", "product launch"],
  "experience_source": "Acme Corp - Product Manager"
}
```

## Export Formats

### Plain Text
```
QUESTION 1: Tell me about a time you...

SITUATION: At Acme Corp...
TASK: I was tasked with...
ACTION: I facilitated...
RESULT: We delivered...

Keywords: cross-functional, Agile, product launch
---
```

### Markdown
```markdown
## 1. Tell me about a time you...

**Situation**: At Acme Corp...

**Task**: I was tasked with...

**Action**: I facilitated...

**Result**: We delivered...

*Keywords used: cross-functional, Agile, product launch*
```

## Usage Notes
- Run after jd-analyzer to get targeted questions
- Show [ADD METRIC] placeholder if quantification missing
- Generate 5 answers covering different competencies
- Allow user to regenerate specific answers
- Store answers for later reference/practice
