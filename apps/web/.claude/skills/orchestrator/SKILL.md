# Orchestrator Skill

## Purpose
Main coordinator that routes requests to appropriate skills and handles workflow orchestration for the HustlerAI system.

## Responsibilities
- Determine which skill to invoke based on request
- Manage multi-step workflows (JD → Resume pipeline)
- Handle errors and retry logic
- Aggregate results from multiple skills
- Track workflow state and progress

## Key Workflows

### 1. JD to Resume Generation
```typescript
async function generateResumeFromJD(jd: string, userProfile: UserProfile) {
  // Step 1: Analyze JD
  const jdInsights = await invoke('jd-analyzer', 'parse', { jd_text: jd });

  // Step 2: Score match
  const matchScore = await invoke('match-scorer', 'calculate', {
    user_profile: userProfile,
    jd_insights: jdInsights
  });

  // Step 3: Rewrite bullets to match JD
  const tailoredExperience = await invoke('bullet-rewriter', 'rewrite', {
    user_profile: userProfile,
    jd_insights: jdInsights,
    match_score: matchScore
  });

  // Step 4: Validate ATS compliance
  const atsValidation = await invoke('ats-validator', 'validate', {
    resume_sections: tailoredExperience,
    jd_keywords: jdInsights.keywords_top_10
  });

  // Step 5: Generate PDF
  const pdf = await invoke('pdf-generator', 'create', {
    resume_sections: tailoredExperience,
    metadata: { match_score: matchScore, ats_score: atsValidation.score }
  });

  // Step 6: Generate STAR answers
  const starAnswers = await invoke('star-generator', 'generate', {
    user_profile: userProfile,
    jd_insights: jdInsights
  });

  return {
    resume: tailoredExperience,
    pdf_url: pdf.pdf_url,
    star_answers: starAnswers,
    match_score: matchScore,
    ats_validation: atsValidation,
    jd_insights: jdInsights
  };
}
```

## Input Schema
```typescript
interface OrchestratorRequest {
  workflow: 'generate_resume' | 'analyze_jd' | 'validate_resume';
  inputs: {
    jd_text?: string;
    jd_url?: string;
    user_profile?: UserProfile;
    resume_data?: ResumeData;
  };
  context?: {
    session_id?: string;
    trace_id?: string;
  };
}
```

## Output Schema
```typescript
interface OrchestratorResponse {
  workflow: string;
  status: 'success' | 'error';
  outputs: {
    resume?: ResumeData;
    pdf_url?: string;
    star_answers?: STARAnswer[];
    match_score?: MatchScoreResult;
    jd_insights?: JDInsights;
  };
  metadata: {
    duration_ms: number;
    skills_invoked: string[];
    total_tokens_used: number;
  };
}
```

## Error Handling
- Retry failed skill invocations up to 3 times with exponential backoff
- Fallback to OpenRouter if Gemini API fails
- Log all errors with trace_id for debugging
- Return partial results if some skills fail

## Usage Notes
- All workflows should go through the orchestrator
- Orchestrator maintains workflow state and can resume from failure
- Use trace_id to debug multi-skill workflows
