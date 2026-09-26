# Match Scorer Skill

## Purpose
Calculate job-resume match scores and ROI metrics to help users assess fit.

## Responsibilities
- Calculate overall match score (0-100)
- Break down score into components (skill overlap, must-have coverage, seniority fit, evidence)
- Identify skill gaps
- Calculate financial ROI and career growth potential

## Input Schema
```typescript
interface MatchScorerInput {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  user_baseline_salary?: number;
}
```

## Match Score Algorithm (0-100)

### 1. Skill Overlap (50 points)
```typescript
// Compare user skills with top 10 JD skills
// Fuzzy matching: "JavaScript" matches "JS", "React.js" matches "React"
// Score = (matched_skills / top_10_jd_skills) * 50
```

### 2. Must-Have Coverage (20 points)
```typescript
// Check if user experience/projects mention must-have requirements
// Extract keywords from each must-have
// Search in user bullets, skills list
// Score = (covered_must_haves / total_must_haves) * 20
```

### 3. Seniority Fit (15 points)
```typescript
// Calculate years of experience from user profile
// Map to seniority levels:
//   entry: 0-2 years (ideal: 1)
//   mid: 2-5 years (ideal: 3.5)
//   senior: 5-10 years (ideal: 7)
//   staff: 8-15 years (ideal: 10)
//   principal: 12-25 years (ideal: 15)
// Score = 15 if in range, penalize if under/over qualified
```

### 4. Evidence Score (15 points)
```typescript
// Count bullets that have both:
//   1. Quantified results (contains numbers)
//   2. JD-relevant keywords
// Score = min((quantified_relevant_bullets / total_bullets) * 30, 15)
```

## Output Schema
```typescript
interface MatchScoreResult {
  total_score: number; // 0-100
  breakdown: {
    skill_overlap: number; // 0-50
    must_have_coverage: number; // 0-20
    seniority_fit: number; // 0-15
    evidence_score: number; // 0-15
  };
  matched_skills: string[];
  gaps: string[];
  recommendations: string[];
  roi_metrics?: {
    salary_delta: number;
    career_growth_potential: 'high' | 'medium' | 'low';
    time_to_competence: string;
  };
}
```

## ROI Calculation
```typescript
// salary_delta = jd_estimated_salary - user_baseline_salary
// career_growth_potential based on:
//   - Is this a step up in seniority?
//   - Are new skills high-demand?
//   - Is company tier higher?
// time_to_competence = estimate based on gap skills
```

## Fuzzy Skill Matching
```typescript
// Examples of fuzzy matches:
//   "JavaScript" <-> "JS", "ECMAScript"
//   "React" <-> "React.js", "ReactJS"
//   "Python" <-> "Python3", "Python 3.x"
//   "Machine Learning" <-> "ML", "AI/ML"
// Use Levenshtein distance and common aliases
```

## Usage Notes
- Run after jd-analyzer to get JD insights
- Match score informs bullet-rewriter on which bullets to prioritize
- Scores < 60 should show "stretch role" warning
- Scores > 85 should show "strong fit" indicator
