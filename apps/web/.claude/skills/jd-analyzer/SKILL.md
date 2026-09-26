# JD Analyzer Skill

## Purpose
Parse job descriptions into structured, actionable insights using the Gemini API.

## Responsibilities
- Extract structured data from job descriptions (title, company, skills, requirements)
- Identify must-have vs nice-to-have qualifications
- Extract top keywords using TF-IDF and POS tagging
- Categorize skills into technical, soft, and domain skills
- Estimate salary range based on role and location
- Determine seniority level

## Input Schema
```typescript
interface JDAnalyzerInput {
  jd_text: string;
  jd_url?: string; // Optional for auto-extraction
  user_baseline_salary?: number; // For salary comparison
}
```

## Processing Steps

1. **Text Cleaning**: Remove HTML tags, normalize whitespace
2. **Gemini API Call**: Extract structured data using prompt template
3. **Keyword Extraction**: TF-IDF + POS tagging for top 20 keywords
4. **Skill Categorization**: Group keywords into skill domains
5. **Salary Lookup**: Match role + location to static salary dataset
6. **Must-Have Detection**: Identify required vs preferred qualifications

## Gemini Prompt Template
Located at: `.claude/skills/jd-analyzer/prompts/parse-jd.txt`

```
You are an expert recruiter analyzing a job description.

Extract the following in JSON format:

{
  "title": "exact job title",
  "company": "company name",
  "location": "location string",
  "seniority": "entry|mid|senior|staff|principal",
  "skills": [
    {"name": "skill name", "weight": 1-10, "category": "technical|soft|domain"}
  ],
  "must_haves": ["requirement 1", "requirement 2", ...],
  "nice_to_haves": ["preference 1", "preference 2", ...],
  "keywords_top_10": ["keyword1", "keyword2", ...],
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "team_size": "estimated team size or 'unknown'",
  "remote_policy": "remote|hybrid|onsite|unknown"
}

JOB DESCRIPTION:
{jd_text}

Return ONLY valid JSON. Do not add commentary.
```

## Output Schema
```typescript
interface JDInsights {
  title: string;
  company: string;
  location: string;
  seniority: 'entry' | 'mid' | 'senior' | 'staff' | 'principal';
  skills_extracted: Array<{
    name: string;
    weight: number; // 1-10
    category: 'technical' | 'soft' | 'domain';
  }>;
  must_haves: string[];
  nice_to_haves: string[];
  keywords_top_10: string[];
  responsibilities: string[];
  team_size: string;
  remote_policy: 'remote' | 'hybrid' | 'onsite' | 'unknown';
  salary_estimate?: {
    min: number;
    max: number;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
  };
}
```

## Keyword Extraction Algorithm
```typescript
// Use TF-IDF to find important terms
// Filter to nouns, verbs, and proper nouns using POS tagging
// Remove common words (the, and, etc.)
// Rank by frequency * importance
// Return top 20 keywords
```

## Salary Estimation
- Load salary dataset from `public/salary-data.json`
- Match on: role title, seniority, location
- Return range with confidence level
- Default to national average if no match

## Error Handling
- If Gemini API fails, retry with OpenRouter
- If structured extraction fails, return partial results
- Log all API errors with request details

## Usage Notes
- This skill is the first step in the resume generation pipeline
- JD insights are passed to match-scorer and bullet-rewriter
- Cache JD analysis results for 24 hours to reduce API calls
