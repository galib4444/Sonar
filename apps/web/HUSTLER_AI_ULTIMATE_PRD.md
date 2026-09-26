# HustlerAI — Ultimate Product Requirements Document (PRD)

**Version**: 2.0 (Claude Skills Architecture)  
**Owner**: Project owner  
**Built With**: Claude Skills (Agent-First Architecture)  
**Tracks**: Best Financial Hack, Best Use of Gemini API, Best AI App Built with Cloudflare, Best Domain Name (GoDaddy)

---

## 🎯 EXECUTIVE SUMMARY

**HustlerAI** is an AI-powered career-finance optimizer that transforms any job posting into actionable assets: ranked fit scores, ATS-optimized one-page resumes, recruiter summaries, STAR interview answers, and a Chrome extension that autofills application forms.

**Core Innovation**: Agent-first architecture using Claude Skills where each major system component is a specialized, autonomous agent that can be composed, tested, and deployed independently.

---

## 📋 TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Problem & Market Opportunity](#2-problem--market-opportunity)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Feature Requirements](#5-feature-requirements)
6. [Claude Skills Architecture](#6-claude-skills-architecture)
7. [Agent System Design](#7-agent-system-design)
8. [Repository Structure](#8-repository-structure)
9. [Tech Stack](#9-tech-stack)
10. [Knowledge Base System](#10-knowledge-base-system)
11. [API Design](#11-api-design)
12. [Algorithms & Scoring](#12-algorithms--scoring)
13. [Data Models](#13-data-models)
14. [ATS Compliance Rules](#14-ats-compliance-rules)
15. [Chrome Extension Architecture](#15-chrome-extension-architecture)
16. [Security & Privacy](#16-security--privacy)
17. [Testing Strategy](#17-testing-strategy)
18. [Deployment Strategy](#18-deployment-strategy)
19. [Development Workflow](#19-development-workflow)
20. [Implementation Timeline](#20-implementation-timeline)
21. [Demo Script](#21-demo-script)
22. [Appendix: Prompt Library](#22-appendix-prompt-library)

---

## 1) PRODUCT VISION

### One-Liner
**HustlerAI** turns any job post into a complete application package in under 60 seconds: ranked fit, ATS-clean resume, recruiter TL;DR, STAR answers, and autofilled application forms.

### Vision Statement
Democratize access to professional career optimization by making world-class resume tailoring, interview prep, and application automation available to everyone—reducing time-to-apply from hours to seconds while maximizing financial outcomes.

### Success Definition
- **TTV (Time-to-Value)**: < 60 seconds from JD paste → complete application package
- **Interview Rate**: 3x increase vs. generic applications
- **Financial Impact**: Users track and optimize for salary growth and ROI
- **Scale**: 10,000+ tailored resumes generated in first month

---

## 2) PROBLEM & MARKET OPPORTUNITY

### The Problem

**Job applications are broken:**
- ⏰ **Time sink**: 2-4 hours per application (research, tailor, apply)
- 📄 **Generic resumes**: 75% of applicants use one resume for all jobs
- 🤖 **ATS black hole**: 98% of Fortune 500 use ATS; 75% of resumes rejected by bots
- 💰 **Financial blindness**: Candidates can't assess salary/ROI efficiently
- 🔄 **No feedback loop**: No way to track what works

### Why Now?

1. **AI Capabilities**: LLMs can now understand context, rewrite professionally, and maintain truth
2. **ATS Dominance**: Every major company uses ATS (Greenhouse, Lever, Workday)
3. **Remote Work**: Global job market = more applications, more competition
4. **Economic Pressure**: People need to maximize income mobility efficiently
5. **Skills Infrastructure**: Claude Skills enable modular, composable AI agents

### Market Size

- **TAM**: 150M knowledge workers in US, 60M active job seekers annually
- **SAM**: 20M tech/business professionals who apply to 10+ jobs/year
- **SOM**: 100K early adopters (students, bootcamp grads, career switchers)

---

## 3) GOALS & SUCCESS METRICS

### MVP Goals

#### Functional Goals
1. ✅ **JD Analysis**: Parse any job description into structured insights (skills, must-haves, salary)
2. ✅ **Resume Generation**: Create ATS-compliant one-page PDF tailored to JD
3. ✅ **Interview Prep**: Generate 5 STAR behavioral answers aligned to role
4. ✅ **Financial Lens**: Show salary fit and career ROI calculations
5. ✅ **Apply Assist**: Chrome extension autofills Greenhouse/Lever forms
6. ✅ **Privacy**: Ephemeral mode + offline demo capability

#### Technical Goals
1. ✅ **Agent Architecture**: All major components implemented as Claude Skills
2. ✅ **Sub-60s Latency**: Complete workflow in under 60 seconds
3. ✅ **ATS Perfect**: 100% of outputs pass ATS compliance checks
4. ✅ **Knowledge Grounding**: All outputs based on reference materials
5. ✅ **Production Ready**: CI/CD, monitoring, error handling, logging

### Success Metrics

#### User Metrics
- **Time-to-Value**: < 60s (paste JD → download resume)
- **Completion Rate**: > 80% of started workflows finish
- **Resume Downloads**: > 1,000 in first week
- **Extension Installs**: > 500 in first week

#### Quality Metrics
- **ATS Compliance**: 100% pass rate (single column, fonts, keywords)
- **One-Page Rate**: 100% (never exceed 1 page at 11pt)
- **Keyword Coverage**: ≥ 8/10 top JD keywords present in resume
- **Match Score Accuracy**: Correlates with user-reported interview rates

#### Business Metrics
- **Wow Factor**: Judges can see complete demo in 90 seconds
- **Sponsor Integration**: All 4 sponsor APIs/services integrated
- **Code Quality**: > 80% test coverage, 0 critical bugs

### Anti-Goals (Out of Scope)

- ❌ Multi-page resumes, complex design templates
- ❌ Full scraping across all ATS platforms (just Greenhouse + Lever)
- ❌ User accounts with authentication (ephemeral only)
- ❌ Real-time salary APIs (static dataset is fine)
- ❌ Mobile apps (web + extension only)

---

## 4) USER PERSONAS

### Primary Persona: Early Career / Student

**Name**: Alex (22, Recent CS Graduate)

**Demographics**:
- New grad or < 2 years experience
- Applying to 50-100 jobs
- Limited resume experience
- Budget-conscious

**Goals**:
- Land first "real" job quickly
- Maximize starting salary
- Stand out with limited experience
- Learn what works

**Pain Points**:
- "I don't know how to tailor my resume"
- "I spend 3 hours per application"
- "I never hear back"
- "I don't know what salary to target"

**How HustlerAI Helps**:
- Guided tailoring (Hybrid mode)
- Sub-60s resume generation
- Clear match scores show fit
- Salary benchmarks inform negotiations

---

### Secondary Persona: Career Switcher

**Name**: Jamie (32, Switching to Tech)

**Demographics**:
- 5-10 years in different field
- Bootcamp grad or self-taught
- Needs to translate experience
- Time-constrained

**Goals**:
- Show transferable skills
- Overcome "no experience" perception
- Apply efficiently (has current job)
- Maximize career ROI

**Pain Points**:
- "How do I make retail experience relevant to PM roles?"
- "I don't have the keywords they want"
- "Applications take forever"

**How HustlerAI Helps**:
- Keyword alignment auto-magic
- Bullet rewriting shows transferability
- Financial ROI shows best-fit roles
- Extension saves hours per week

---

### Tertiary Persona: Recruiter/Judge

**Name**: Sam (38, Technical Recruiter)

**Demographics**:
- Reviews 100+ resumes/day
- Understands ATS systems
- Values clarity and relevance
- Skeptical of AI

**Goals**:
- Quickly assess candidate fit
- See relevant experience
- Verify ATS compatibility
- Identify red flags

**How HustlerAI Helps**:
- Recruiter TL;DR (3-line summary)
- Must-Have Matrix shows exact matches
- Keyword Dial visualizes coverage
- ATS Checklist proves compliance

---

## 5) FEATURE REQUIREMENTS

### 5.1) JD Analyzer (Gemini-Powered Agent)

**Purpose**: Transform unstructured job descriptions into structured, actionable insights.

**Inputs**:
- Job description text (pasted or scraped)
- Optional: URL for auto-extraction (Greenhouse/Lever)

**Outputs**:
```json
{
  "title": "Senior Product Manager",
  "company": "Acme Corp",
  "location": "Remote (US)",
  "seniority": "senior",
  "skills_extracted": [
    {"skill": "product strategy", "weight": 10, "category": "core"},
    {"skill": "agile", "weight": 8, "category": "methodology"},
    ...
  ],
  "must_haves": [
    "5+ years PM experience",
    "B2B SaaS background",
    ...
  ],
  "nice_to_haves": [
    "Technical background",
    "MBA preferred"
  ],
  "salary_range": {
    "low": 120000,
    "high": 160000,
    "currency": "USD",
    "geo": "US-Remote"
  },
  "keywords_top_10": ["product", "roadmap", "stakeholders", ...],
  "recruiter_tldr": "Seeking experienced PM to lead B2B SaaS product strategy..."
}
```

**UI Components**:
- Match Score Card (0-100 with breakdown)
- Salary Fit Card (range + comparison to user baseline)
- Skills List (ranked, with must-have badges)
- Gaps List (what's missing from user profile)

**Agent**: `jd-analyzer-skill`

---

### 5.2) Resume Generator (Multi-Agent)

**Purpose**: Create ATS-optimized, one-page PDF tailored to specific JD.

**Inputs**:
- User profile (experience, education, skills, projects)
- JD insights (from analyzer)
- Mode: "Hybrid" (AI prefill + user edits)

**Process Flow**:
1. **Bullet Scoring Agent**: Score existing bullets vs JD keywords
2. **Bullet Rewriter Agent**: Rewrite top 6-8 bullets with JD keywords
3. **Layout Agent**: Assemble sections, enforce line budget
4. **Validation Agent**: Run ATS checks
5. **PDF Agent**: Generate final PDF with QR code

**Outputs**:
```json
{
  "resume_sections": {
    "summary": "...",
    "experience": [...],
    "projects": [...],
    "education": [...],
    "skills": ["Python", "SQL", ...],
    "certifications": [...]
  },
  "metadata": {
    "ats_score": {
      "layout": true,
      "fonts": true,
      "keywords": 9,
      "single_column": true,
      "file_format": true
    },
    "match_score": 87,
    "keyword_coverage": {
      "product": 3,
      "roadmap": 2,
      "stakeholders": 4,
      ...
    },
    "line_count": 42,
    "page_count": 1
  },
  "recruiter_tldr": "Senior PM with 6yr B2B SaaS exp...",
  "must_have_matrix": [
    {"requirement": "5+ years PM", "evidence": "Experience Section, Bullet 1"},
    ...
  ],
  "pdf_url": "https://...",
  "qr_code_url": "https://hustlerai.tech/r/abc123"
}
```

**UI Components**:
- Split Editor (bullets on left, preview on right)
- Line Budget Meter (visual gauge)
- ATS Checklist (green checks)
- Keyword Dial (circular 10/10 gauge)
- Must-Have Matrix (table)
- Recruiter TL;DR (card)
- Live Preview (updates on edit)

**Agents**: 
- `resume-generator-skill` (orchestrator)
- `bullet-rewriter-skill`
- `ats-validator-skill`
- `pdf-generator-skill`

---

### 5.3) STAR Interview Answers

**Purpose**: Generate behavioral interview answers using STAR framework.

**Inputs**:
- User profile (experience bank)
- JD insights (role requirements)

**Outputs**:
```json
{
  "answers": [
    {
      "question": "Tell me about a time you led a cross-functional project",
      "star": {
        "situation": "At Acme Corp, our product roadmap was blocked by misalignment between eng and design (Q3 2023).",
        "task": "I was tasked with getting both teams aligned on a single 6-month plan.",
        "action": "I scheduled weekly syncs, created a shared Jira board, and facilitated 3 design sprints with both teams present. I used Figma for real-time collaboration.",
        "result": "Shipped 4 major features on time, reduced planning cycles from 3 weeks to 1 week, and improved cross-team NPS from 6 to 8.5."
      },
      "keywords_used": ["roadmap", "cross-functional", "alignment"]
    },
    ...
  ]
}
```

**Export Formats**:
- Plain text (.txt)
- JSON (.json)
- Markdown (.md)

**Optional**: Text-to-speech playback (ElevenLabs)

**Agent**: `star-generator-skill`

---

### 5.4) Financial Lens

**Purpose**: Show salary and ROI metrics to inform application prioritization.

**Components**:

#### A) Salary Fit Card
```
Role Salary Range: $120K - $160K
Your Current: $95K
Potential Lift: +26% to +68%
Market Percentile: 65th (mid-range for role)
```

#### B) Career ROI Calculator
```
ROI Score = (Avg Salary × Match Score × Skill Growth Factor) ÷ Est. App Time

Example:
  Avg Salary: $140K
  Match Score: 87/100 (0.87)
  Skill Factor: 1.15 (will learn 3 new skills)
  App Time: 0.5 hours (with HustlerAI)
  
  ROI = (140000 × 0.87 × 1.15) ÷ 0.5 = $280,140 per hour invested
```

#### C) Growth Factor
- Count "new skills" from JD not in user profile
- Weight by skill importance (must-have = 2x, nice-to-have = 1x)

**Data Source**: Static JSON with salary ranges by role/geo

**Agent**: `match-scorer-skill`

---

### 5.5) Apply Assist (Chrome Extension)

**Purpose**: Autofill Greenhouse/Lever application forms with tailored resume data.

**Supported Platforms**:
- ✅ Greenhouse (boards.greenhouse.io)
- ✅ Lever (jobs.lever.co)

**Flow**:
1. User lands on job posting page
2. Clicks HustlerAI extension icon
3. Extension detects JD text automatically
4. Calls backend: `POST /api/tailor` with JD
5. Receives tailored resume data + PDF URL
6. Autofills all text inputs (name, email, experience, etc.)
7. Uploads PDF to file input
8. Shows overlay: "✓ Filled | [Preview Resume] | **Submit yourself**"
9. User reviews and clicks Submit

**Constraints**:
- Extension does NOT click Submit (user control)
- Extension only fills, doesn't scrape sensitive data
- PDF upload uses native `<input type="file">` handling

**Fallback**: Bookmarklet for unsupported platforms (opens app with prefilled JD)

**Agent**: `extension-builder-skill`

---

### 5.6) Privacy & Reliability

#### A) Ephemeral Mode
- Delete all generated artifacts (PDFs, JSON) after 30 minutes
- No user accounts required
- Session-only storage (localStorage + memory)

#### B) Offline Demo Mode
- Toggle to use 3 pre-seeded JDs and user profiles
- Serve cached PDFs (no API calls)
- Works without internet (judge demo resilience)

#### C) Data Minimization
- Don't send PII to AI APIs (redact phone/email from prompts)
- No resume storage unless user explicitly saves
- Analytics: aggregate only (no user tracking)

---

## 6) CLAUDE SKILLS ARCHITECTURE

### Overview

**Philosophy**: Every major system component is a **Claude Skill**—an autonomous agent with clear inputs/outputs, responsibilities, and dependencies. Skills can be composed, tested independently, and deployed as modular capabilities.

### Skills Hierarchy

```
hustler-ai/
├── orchestrator-skill (main coordinator)
│   ├── routes requests to sub-agents
│   └── handles error recovery
│
├── knowledge-processor-skill
│   ├── extracts text from reference PDFs
│   ├── structures into JSON
│   └── builds embeddings (optional RAG)
│
├── jd-analyzer-skill
│   ├── calls Gemini to parse JD
│   ├── extracts skills/must-haves
│   ├── estimates salary from dataset
│   └── calculates match score
│
├── resume-generator-skill (orchestrator)
│   ├── coordinates bullet-rewriter
│   ├── coordinates ats-validator
│   ├── coordinates pdf-generator
│   └── assembles final output
│
├── bullet-rewriter-skill
│   ├── loads action verbs from knowledge base
│   ├── scores bullets vs keywords
│   ├── rewrites top bullets using Gemini
│   └── validates no fake metrics
│
├── ats-validator-skill
│   ├── checks layout (single column, no tables)
│   ├── validates fonts (Arial/Calibri, 10.5-11.5pt)
│   ├── verifies keyword density
│   └── ensures 1-page limit
│
├── pdf-generator-skill
│   ├── uses @react-pdf/renderer or Puppeteer
│   ├── applies ATS-safe templates
│   ├── adds QR code to footer
│   └── outputs PDF URL
│
├── star-generator-skill
│   ├── loads experience bank
│   ├── matches experiences to JD domains
│   ├── generates STAR answers via Gemini
│   └── validates no invented achievements
│
├── match-scorer-skill
│   ├── calculates keyword overlap
│   ├── assesses must-have coverage
│   ├── estimates seniority fit
│   └── computes ROI score
│
├── extension-builder-skill
│   ├── creates manifest.json (MV3)
│   ├── writes content scripts (Greenhouse/Lever)
│   ├── implements autofill logic
│   └── builds background service worker
│
├── api-builder-skill
│   ├── scaffolds Next.js API routes
│   ├── implements request validation
│   ├── adds error handling
│   └── sets up CORS
│
├── testing-skill
│   ├── writes unit tests (Jest)
│   ├── writes integration tests
│   ├── writes E2E tests (Playwright)
│   └── runs test suite
│
└── deployment-skill
    ├── builds for production
    ├── deploys to Vercel
    ├── deploys Workers to Cloudflare
    └── configures domain (GoDaddy)
```

### Skill Communication Protocol

**Format**: Skills communicate via structured JSON messages

```typescript
// Request
interface SkillRequest {
  skill: string;
  action: string;
  inputs: Record<string, unknown>;
  context?: {
    user_id?: string;
    session_id?: string;
    trace_id?: string;
  };
}

// Response
interface SkillResponse<T> {
  skill: string;
  action: string;
  status: 'success' | 'error';
  outputs?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    duration_ms: number;
    tokens_used?: number;
    cost?: number;
  };
}
```

**Example**:

```typescript
// Request to jd-analyzer-skill
{
  "skill": "jd-analyzer",
  "action": "parse",
  "inputs": {
    "jd_text": "We're seeking a Senior PM with 5+ years...",
    "jd_url": "https://boards.greenhouse.io/company/jobs/123"
  },
  "context": {
    "session_id": "sess_abc123",
    "trace_id": "trace_xyz789"
  }
}

// Response
{
  "skill": "jd-analyzer",
  "action": "parse",
  "status": "success",
  "outputs": {
    "title": "Senior Product Manager",
    "company": "Acme Corp",
    "skills_extracted": [...],
    "must_haves": [...],
    "salary_range": {...}
  },
  "metadata": {
    "duration_ms": 1847,
    "tokens_used": 1523,
    "cost": 0.0023
  }
}
```

---

## 7) AGENT SYSTEM DESIGN

### 7.1) orchestrator-skill (Main Coordinator)

**Responsibility**: Routes requests to appropriate skills and handles workflow orchestration.

**Key Functions**:
- Determine which skill to invoke based on request
- Manage multi-step workflows
- Handle errors and retry logic
- Aggregate results from multiple skills

**Example Workflow**: JD → Resume

```typescript
async function generateResumeFromJD(jd: string, user: UserProfile) {
  // Step 1: Analyze JD
  const jdInsights = await invoke('jd-analyzer', 'parse', { jd_text: jd });
  
  // Step 2: Score match
  const matchScore = await invoke('match-scorer', 'calculate', {
    user_profile: user,
    jd_insights: jdInsights
  });
  
  // Step 3: Generate resume (this calls sub-skills internally)
  const resume = await invoke('resume-generator', 'create', {
    user_profile: user,
    jd_insights: jdInsights,
    match_score: matchScore
  });
  
  // Step 4: Generate STAR answers
  const starAnswers = await invoke('star-generator', 'generate', {
    user_profile: user,
    jd_insights: jdInsights
  });
  
  return {
    resume,
    star_answers: starAnswers,
    match_score: matchScore,
    jd_insights: jdInsights
  };
}
```

**SKILL.md Location**: `.claude/skills/orchestrator/SKILL.md`

---

### 7.2) knowledge-processor-skill

**Responsibility**: Extract, structure, and index reference materials from PDFs.

**Inputs**:
- Path to PDF directory (`/knowledge-base/raw/`)
- Output directory (`/knowledge-base/processed/`)

**Outputs**:
- `action-verbs.json`: List of approved action verbs with categories
- `ats-rules.json`: ATS compliance rules
- `bullet-examples.json`: Real-world bullet examples with scores
- `templates.json`: Resume template structures
- `embeddings.json` (optional): Vector embeddings for RAG

**Process**:
```typescript
1. Scan `/knowledge-base/raw/` for PDFs
2. For each PDF:
   a. Extract text using pdf-parse
   b. Identify document type (action verbs, ATS rules, examples, etc.)
   c. Parse structure (lists, tables, sections)
   d. Convert to JSON schema
   e. Save to `/knowledge-base/processed/`
3. Build index/embeddings if RAG needed
```

**Key Extractions**:

**From Action-Verbs-Quantify.pdf**:
```json
{
  "action_verbs": {
    "leadership": ["Led", "Managed", "Directed", "Coordinated"],
    "achievement": ["Achieved", "Delivered", "Exceeded", "Accomplished"],
    "technical": ["Developed", "Implemented", "Engineered", "Architected"],
    "analysis": ["Analyzed", "Evaluated", "Assessed", "Investigated"]
  },
  "quantification_patterns": [
    "Increased X by Y%",
    "Reduced X from Y to Z",
    "Managed $X budget",
    "Led team of X people"
  ]
}
```

**From Resume-Format.pdf + What-Is-ATS.pdf**:
```json
{
  "ats_rules": {
    "layout": {
      "single_column": true,
      "no_tables": true,
      "no_text_boxes": true,
      "no_headers_footers": true,
      "max_pages": 1
    },
    "fonts": {
      "approved": ["Arial", "Calibri", "Helvetica", "Times New Roman"],
      "body_size": { "min": 10.5, "max": 11.5 },
      "header_size": { "min": 12, "max": 14 }
    },
    "sections": {
      "required": ["Experience", "Education", "Skills"],
      "optional": ["Summary", "Projects", "Certifications"],
      "order": ["Summary", "Experience", "Projects", "Education", "Skills"]
    },
    "keywords": {
      "min_coverage": 8,
      "max_density": 0.03,
      "placement": ["summary", "experience_bullets", "skills"]
    }
  }
}
```

**SKILL.md Location**: `.claude/skills/knowledge-processor/SKILL.md`

---

### 7.3) jd-analyzer-skill

**Responsibility**: Parse job descriptions into structured, actionable insights.

**Inputs**:
```typescript
interface JDAnalyzerInput {
  jd_text: string;
  jd_url?: string; // Optional for auto-extraction
  user_baseline_salary?: number; // For salary comparison
}
```

**Process**:
1. **Text Cleaning**: Remove HTML, normalize whitespace
2. **Gemini API Call**: Extract structured data using prompt template
3. **Keyword Extraction**: TF-IDF + POS tagging for top 20 keywords
4. **Skill Categorization**: Group keywords into skill domains
5. **Salary Lookup**: Match role + location to static dataset
6. **Must-Have Detection**: Identify required vs. preferred qualifications

**Gemini Prompt Template**:
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
  "recruiter_tldr": "1-2 sentence summary for recruiter"
}

Job Description:
{jd_text}

Rules:
- Be precise with skills extraction
- Distinguish must-haves from nice-to-haves carefully
- Seniority based on years required and scope of role
- Keywords should be nouns/skills/tools, not generic verbs
```

**Outputs**:
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
  salary_range: {
    low: number;
    high: number;
    currency: string;
    geo: string;
    percentile_25?: number;
    percentile_50?: number;
    percentile_75?: number;
  };
  keywords_top_10: string[];
  recruiter_tldr: string;
  metadata: {
    jd_length: number;
    confidence_score: number;
    extracted_at: string;
  };
}
```

**Error Handling**:
- If Gemini fails: Retry once, then fallback to OpenRouter
- If salary lookup fails: Return national average with warning
- If extraction incomplete: Return partial with confidence score

**SKILL.md Location**: `.claude/skills/jd-analyzer/SKILL.md`

---

### 7.4) bullet-rewriter-skill

**Responsibility**: Rewrite resume bullets to align with JD keywords while maintaining truth.

**Inputs**:
```typescript
interface BulletRewriterInput {
  user_bullets: string[]; // All user's experience bullets
  jd_insights: JDInsights;
  action_verbs: string[]; // From knowledge base
  bullet_examples: BulletExample[]; // From knowledge base
  max_bullets: number; // Usually 6-8
}
```

**Process**:
1. **Bullet Scoring**: Score each bullet against JD keywords (0-100)
2. **Selection**: Pick top `max_bullets` bullets
3. **Batch Rewrite**: Single Gemini call to rewrite all selected bullets
4. **Validation**: Ensure no fake metrics added
5. **Keyword Injection**: Verify JD keywords naturally integrated

**Scoring Algorithm**:
```typescript
function scoreBullet(bullet: string, jdKeywords: string[]): number {
  let score = 0;
  
  // Keyword presence (40%)
  const bulletLower = bullet.toLowerCase();
  const matchedKeywords = jdKeywords.filter(kw => 
    bulletLower.includes(kw.toLowerCase())
  );
  score += (matchedKeywords.length / jdKeywords.length) * 40;
  
  // Quantification (30%)
  const hasNumber = /\d+/.test(bullet);
  const hasPercentage = /%/.test(bullet);
  const hasCurrency = /\$/.test(bullet);
  if (hasNumber || hasPercentage || hasCurrency) score += 30;
  
  // Action verb strength (20%)
  const actionVerbs = loadActionVerbs(); // From knowledge base
  const bulletWords = bullet.split(' ');
  const firstWord = bulletWords[0];
  if (actionVerbs.strong.includes(firstWord)) score += 20;
  else if (actionVerbs.moderate.includes(firstWord)) score += 10;
  
  // Length (10%) - prefer 1-2 lines (60-120 chars)
  const length = bullet.length;
  if (length >= 60 && length <= 120) score += 10;
  else if (length < 60) score += 5;
  
  return Math.min(score, 100);
}
```

**Gemini Prompt Template**:
```
You are an expert resume writer. Rewrite these bullets to align with the job description while maintaining truth.

APPROVED ACTION VERBS: {action_verbs}

EXAMPLE BULLETS (for style):
{bullet_examples}

JD TOP KEYWORDS: {jd_keywords}

JD MUST-HAVES: {must_haves}

USER BULLETS TO REWRITE:
{bullets}

RULES:
1. Start with a strong action verb from the approved list
2. Naturally integrate 1-2 JD keywords per bullet
3. Keep quantified results - NEVER invent metrics
4. If a bullet lacks a metric, add [ADD METRIC] placeholder
5. Single line per bullet (60-120 characters)
6. Maintain domain truth - don't fabricate achievements
7. Output format: JSON array of strings

Example input:
"Built a web app for tracking inventory"

Example output:
"Developed React-based inventory management system that reduced tracking time by [ADD METRIC]%, supporting [ADD METRIC] SKUs"

Now rewrite the bullets above. Return only JSON:
{"rewritten": ["bullet1", "bullet2", ...], "keyword_hits": {"keyword": count, ...}}
```

**Validation**:
```typescript
function validateRewrittenBullets(
  original: string[],
  rewritten: string[],
  jdKeywords: string[]
): ValidationResult {
  const issues: string[] = [];
  
  // Check: No invented specific numbers
  for (let i = 0; i < rewritten.length; i++) {
    const origNumbers = extractNumbers(original[i]);
    const rewriteNumbers = extractNumbers(rewritten[i]);
    const newNumbers = rewriteNumbers.filter(n => !origNumbers.includes(n));
    
    if (newNumbers.length > 0 && !rewritten[i].includes('[ADD METRIC]')) {
      issues.push(`Bullet ${i}: Invented number ${newNumbers[0]}`);
    }
  }
  
  // Check: Keywords present
  let totalKeywordHits = 0;
  for (const bullet of rewritten) {
    const bulletLower = bullet.toLowerCase();
    const hits = jdKeywords.filter(kw => bulletLower.includes(kw.toLowerCase()));
    totalKeywordHits += hits.length;
  }
  
  if (totalKeywordHits < Math.min(jdKeywords.length, 8)) {
    issues.push(`Only ${totalKeywordHits} keyword hits; need at least 8`);
  }
  
  // Check: Length
  for (let i = 0; i < rewritten.length; i++) {
    if (rewritten[i].length > 150) {
      issues.push(`Bullet ${i}: Too long (${rewritten[i].length} chars)`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
```

**SKILL.md Location**: `.claude/skills/bullet-rewriter/SKILL.md`

---

### 7.5) ats-validator-skill

**Responsibility**: Validate resume compliance with ATS requirements.

**Inputs**:
```typescript
interface ATSValidatorInput {
  resume_sections: ResumeSections;
  pdf_buffer?: Buffer; // If validating PDF
  ats_rules: ATSRules; // From knowledge base
}
```

**Validation Checks**:

```typescript
interface ATSValidationResult {
  valid: boolean;
  score: number; // 0-100
  checks: {
    layout: {
      single_column: boolean;
      no_tables: boolean;
      no_text_boxes: boolean;
      no_images: boolean;
    };
    fonts: {
      approved_fonts: boolean;
      body_size_ok: boolean;
      header_size_ok: boolean;
    };
    sections: {
      standard_headings: boolean;
      required_present: boolean;
      logical_order: boolean;
    };
    keywords: {
      coverage: number; // 0-10
      density_ok: boolean;
      placement_ok: boolean;
    };
    file: {
      true_pdf: boolean; // Not scanned image
      filename_ok: boolean;
      size_ok: boolean; // < 2MB
    };
    page_count: {
      is_one_page: boolean;
      line_count: number;
    };
  };
  issues: string[];
  warnings: string[];
}
```

**Validation Logic**:

```typescript
async function validateATS(input: ATSValidatorInput): Promise<ATSValidationResult> {
  const checks = {
    layout: validateLayout(input.resume_sections),
    fonts: validateFonts(input.resume_sections),
    sections: validateSections(input.resume_sections, input.ats_rules),
    keywords: validateKeywords(input.resume_sections, input.jd_keywords),
    file: input.pdf_buffer ? validatePDF(input.pdf_buffer) : null,
    page_count: validatePageCount(input.resume_sections)
  };
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Layout checks
  if (!checks.layout.single_column) {
    issues.push('Resume uses multiple columns - ATS may misread');
  }
  if (!checks.layout.no_tables) {
    issues.push('Resume contains tables - ATS may lose data');
  }
  
  // Font checks
  if (!checks.fonts.approved_fonts) {
    issues.push('Font not ATS-friendly - use Arial, Calibri, or Times');
  }
  if (!checks.fonts.body_size_ok) {
    warnings.push('Body font size should be 10.5-11.5pt');
  }
  
  // Keyword checks
  if (checks.keywords.coverage < 8) {
    warnings.push(`Only ${checks.keywords.coverage}/10 top keywords present`);
  }
  if (!checks.keywords.density_ok) {
    warnings.push('Keyword density too high - may appear stuffed');
  }
  
  // Page count
  if (!checks.page_count.is_one_page) {
    issues.push('Resume exceeds 1 page');
  }
  
  // Calculate score
  const score = calculateATSScore(checks);
  
  return {
    valid: issues.length === 0,
    score,
    checks,
    issues,
    warnings
  };
}

function calculateATSScore(checks: ATSChecks): number {
  let score = 0;
  
  // Layout (30 points)
  if (checks.layout.single_column) score += 10;
  if (checks.layout.no_tables) score += 10;
  if (checks.layout.no_text_boxes) score += 5;
  if (checks.layout.no_images) score += 5;
  
  // Fonts (20 points)
  if (checks.fonts.approved_fonts) score += 10;
  if (checks.fonts.body_size_ok) score += 5;
  if (checks.fonts.header_size_ok) score += 5;
  
  // Sections (20 points)
  if (checks.sections.standard_headings) score += 10;
  if (checks.sections.required_present) score += 10;
  
  // Keywords (20 points)
  score += checks.keywords.coverage * 2; // 0-10 coverage → 0-20 points
  
  // File (10 points)
  if (checks.file?.true_pdf) score += 5;
  if (checks.file?.filename_ok) score += 3;
  if (checks.file?.size_ok) score += 2;
  
  return Math.min(score, 100);
}
```

**SKILL.md Location**: `.claude/skills/ats-validator/SKILL.md`

---

### 7.6) pdf-generator-skill

**Responsibility**: Generate ATS-compliant PDF from resume data.

**Technology Choice**: `@react-pdf/renderer` (pure React, no headless browser)

**Inputs**:
```typescript
interface PDFGeneratorInput {
  resume_sections: ResumeSections;
  metadata: {
    match_score: number;
    ats_score: number;
    qr_url?: string; // Link to live version
  };
  template: 'ats-clean' | 'ats-modern'; // Default: ats-clean
}
```

**Template: ats-clean**

```typescript
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: '0.5in',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 12,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    color: '#333',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottom: '1pt solid #000',
    paddingBottom: 2,
  },
  experienceItem: {
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  dates: {
    fontSize: 10,
    color: '#666',
  },
  bullet: {
    fontSize: 10.5,
    marginLeft: 12,
    marginBottom: 3,
  },
  skills: {
    fontSize: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    marginRight: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 8,
    color: '#999',
  }
});

export const ATSCleanTemplate = ({ resume, metadata }: TemplateProps) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.contact}>
          {resume.contact.email} | {resume.contact.phone} | {resume.contact.location}
        </Text>
        {resume.contact.links.map((link, i) => (
          <Link key={i} src={link} style={styles.contact}>{link}</Link>
        ))}
      </View>

      {/* Summary (optional) */}
      {resume.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUMMARY</Text>
          <Text style={{fontSize: 10}}>{resume.summary}</Text>
        </View>
      )}

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPERIENCE</Text>
        {resume.experience.map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <Text style={styles.jobTitle}>{exp.title}</Text>
            <Text style={styles.company}>{exp.company} | {exp.location}</Text>
            <Text style={styles.dates}>{exp.start_date} - {exp.end_date}</Text>
            {exp.bullets.map((bullet, j) => (
              <Text key={j} style={styles.bullet}>• {bullet}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECTS</Text>
          {resume.projects.map((proj, i) => (
            <View key={i} style={styles.experienceItem}>
              <Text style={styles.jobTitle}>{proj.name}</Text>
              {proj.link && <Link src={proj.link} style={styles.company}>{proj.link}</Link>}
              {proj.bullets.map((bullet, j) => (
                <Text key={j} style={styles.bullet}>• {bullet}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EDUCATION</Text>
        {resume.education.map((edu, i) => (
          <View key={i} style={{marginBottom: 4}}>
            <Text style={styles.jobTitle}>{edu.degree}</Text>
            <Text style={styles.company}>{edu.school} | {edu.graduation_year}</Text>
            {edu.highlights && edu.highlights.map((hl, j) => (
              <Text key={j} style={styles.bullet}>• {hl}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SKILLS</Text>
        <View style={styles.skills}>
          {resume.skills.map((skill, i) => (
            <Text key={i} style={styles.skillItem}>{skill}</Text>
          ))}
        </View>
      </View>

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
          {resume.certifications.map((cert, i) => (
            <Text key={i} style={{fontSize: 10, marginBottom: 2}}>
              {cert.name} - {cert.org} ({cert.year})
            </Text>
          ))}
        </View>
      )}

      {/* Footer with QR */}
      {metadata.qr_url && (
        <View style={styles.footer}>
          <Text>View live: {metadata.qr_url}</Text>
        </View>
      )}
    </Page>
  </Document>
);
```

**Line Budget Calculation**:

```typescript
function calculateLineCount(resume: ResumeSections): number {
  let lines = 0;
  
  // Header: 3 lines (name + contact info)
  lines += 3;
  
  // Summary: ~2-3 lines
  if (resume.summary) {
    lines += Math.ceil(resume.summary.length / 100);
  }
  
  // Experience: title + company + dates + bullets
  for (const exp of resume.experience) {
    lines += 3; // Title, company, dates
    for (const bullet of exp.bullets) {
      lines += Math.ceil(bullet.length / 90); // ~90 chars per line at 11pt
    }
    lines += 0.5; // Spacing
  }
  
  // Projects
  for (const proj of resume.projects) {
    lines += 2; // Title + link
    for (const bullet of proj.bullets) {
      lines += Math.ceil(bullet.length / 90);
    }
    lines += 0.5;
  }
  
  // Education: 2-3 lines per entry
  lines += resume.education.length * 2.5;
  
  // Skills: 1-2 lines
  lines += Math.ceil(resume.skills.length * 15 / 540); // ~15 chars per skill
  
  // Certifications: 1 line per cert
  if (resume.certifications) {
    lines += resume.certifications.length;
  }
  
  return Math.ceil(lines);
}

const MAX_LINES_PER_PAGE = 52; // At 11pt with 0.5" margins

function enforcOnePageLimit(resume: ResumeSections): ResumeSections {
  let lines = calculateLineCount(resume);
  
  if (lines <= MAX_LINES_PER_PAGE) return resume;
  
  // Trim bullets starting with lowest-scored
  const bulletScores = scoreBullets(resume);
  const sortedBullets = bulletScores.sort((a, b) => a.score - b.score);
  
  while (lines > MAX_LINES_PER_PAGE && sortedBullets.length > 0) {
    const lowestBullet = sortedBullets.shift();
    removeBullet(resume, lowestBullet.section, lowestBullet.index);
    lines = calculateLineCount(resume);
  }
  
  return resume;
}
```

**Output**:
```typescript
interface PDFGeneratorOutput {
  pdf_url: string; // Signed URL or base64
  pdf_buffer: Buffer;
  metadata: {
    file_size_bytes: number;
    page_count: number;
    line_count: number;
    generation_time_ms: number;
  };
}
```

**SKILL.md Location**: `.claude/skills/pdf-generator/SKILL.md`

---

### 7.7) star-generator-skill

**Responsibility**: Generate STAR behavioral interview answers aligned to JD.

**Inputs**:
```typescript
interface STARGeneratorInput {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  num_answers: number; // Default: 5
}
```

**Process**:
1. **Experience Matching**: Find user experiences relevant to JD domains
2. **Question Generation**: Create 5 behavioral questions based on JD must-haves
3. **STAR Construction**: For each question, generate STAR answer
4. **Validation**: Ensure no invented achievements

**Gemini Prompt Template**:
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
4. Use only real experiences from candidate's profile
5. Quantify results when possible; if not, use [ADD METRIC]
6. Never invent achievements not in the profile

EXAMPLE OUTPUT:
{
  "answers": [
    {
      "question": "Tell me about a time you led a cross-functional project",
      "star": {
        "situation": "At Acme Corp, our Q3 product launch was delayed due to design-eng misalignment",
        "task": "I was tasked with getting both teams on a unified timeline for 6-week sprint",
        "action": "I facilitated 3 design sprints, created shared Jira board, implemented weekly syncs using Agile methodology",
        "result": "Delivered launch 2 weeks early, improved cross-team satisfaction from 6 to 8.5, shipped 4 features"
      },
      "keywords_used": ["cross-functional", "Agile", "product launch"]
    }
  ]
}

Now generate 5 STAR answers. Return ONLY JSON.
```

**Validation**:
```typescript
function validateSTARAnswers(
  answers: STARAnswer[],
  userProfile: UserProfile
): ValidationResult {
  const issues: string[] = [];
  
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const star = answer.star;
    
    // Check: All STAR components present
    if (!star.situation || !star.task || !star.action || !star.result) {
      issues.push(`Answer ${i}: Missing STAR component`);
    }
    
    // Check: Length
    const totalWords = [star.situation, star.task, star.action, star.result]
      .join(' ').split(' ').length;
    if (totalWords > 130) {
      issues.push(`Answer ${i}: Too long (${totalWords} words, max 120)`);
    }
    
    // Check: References real experience
    const mentionedCompanies = extractCompanies(star);
    const userCompanies = userProfile.experience.map(e => e.company);
    const hasRealCompany = mentionedCompanies.some(c => 
      userCompanies.some(uc => uc.toLowerCase().includes(c.toLowerCase()))
    );
    if (!hasRealCompany && !star.result.includes('[ADD METRIC]')) {
      issues.push(`Answer ${i}: May reference invented experience`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
```

**Export Formats**:

```typescript
// Plain text
function exportToText(answers: STARAnswer[]): string {
  return answers.map((a, i) => `
QUESTION ${i + 1}: ${a.question}

SITUATION: ${a.star.situation}

TASK: ${a.star.task}

ACTION: ${a.star.action}

RESULT: ${a.star.result}

Keywords: ${a.keywords_used.join(', ')}

---
  `).join('\n');
}

// Markdown
function exportToMarkdown(answers: STARAnswer[]): string {
  return `# Behavioral Interview Answers

${answers.map((a, i) => `
## ${i + 1}. ${a.question}

**Situation**: ${a.star.situation}

**Task**: ${a.star.task}

**Action**: ${a.star.action}

**Result**: ${a.star.result}

*Keywords used: ${a.keywords_used.join(', ')}*
  `).join('\n')}
  `;
}
```

**SKILL.md Location**: `.claude/skills/star-generator/SKILL.md`

---

### 7.8) match-scorer-skill

**Responsibility**: Calculate job-resume match scores and ROI metrics.

**Inputs**:
```typescript
interface MatchScorerInput {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  user_baseline_salary?: number;
}
```

**Match Score Algorithm** (0-100):

```typescript
function calculateMatchScore(
  user: UserProfile,
  jd: JDInsights
): MatchScoreResult {
  
  // 1. Skill Overlap (50%)
  const userSkills = new Set(user.skills.map(s => s.toLowerCase()));
  const jdSkills = jd.skills_extracted.map(s => s.name.toLowerCase());
  const jdTopSkills = jdSkills.slice(0, 10);
  
  const matchedSkills = jdTopSkills.filter(js => {
    return Array.from(userSkills).some(us => 
      us.includes(js) || js.includes(us)
    );
  });
  const skillOverlap = (matchedSkills.length / jdTopSkills.length) * 50;
  
  // 2. Must-Have Coverage (20%)
  const mustHaveCoverage = calculateMustHaveCoverage(user, jd.must_haves);
  
  // 3. Seniority Fit (15%)
  const seniorityFit = calculateSeniorityFit(user, jd.seniority);
  
  // 4. Evidence Score (15%)
  const evidenceScore = calculateEvidenceScore(user, jdSkills);
  
  const totalScore = skillOverlap + mustHaveCoverage + seniorityFit + evidenceScore;
  
  return {
    total_score: Math.round(totalScore),
    breakdown: {
      skill_overlap: Math.round(skillOverlap),
      must_have_coverage: Math.round(mustHaveCoverage),
      seniority_fit: Math.round(seniorityFit),
      evidence_score: Math.round(evidenceScore)
    },
    matched_skills: matchedSkills,
    gaps: jdTopSkills.filter(js => !matchedSkills.includes(js))
  };
}

function calculateMustHaveCoverage(
  user: UserProfile,
  mustHaves: string[]
): number {
  const allUserText = [
    ...user.experience.flatMap(e => e.bullets),
    ...user.projects.flatMap(p => p.bullets),
    user.skills.join(' ')
  ].join(' ').toLowerCase();
  
  let covered = 0;
  for (const mustHave of mustHaves) {
    const keywords = extractKeywords(mustHave);
    const matchesAny = keywords.some(kw => allUserText.includes(kw.toLowerCase()));
    if (matchesAny) covered++;
  }
  
  return (covered / mustHaves.length) * 20;
}

function calculateSeniorityFit(
  user: UserProfile,
  targetSeniority: string
): number {
  const yearsExp = calculateYearsOfExperience(user);
  
  const seniorityMap = {
    'entry': { min: 0, max: 2, ideal: 1 },
    'mid': { min: 2, max: 5, ideal: 3.5 },
    'senior': { min: 5, max: 10, ideal: 7 },
    'staff': { min: 8, max: 15, ideal: 10 },
    'principal': { min: 12, max: 25, ideal: 15 }
  };
  
  const target = seniorityMap[targetSeniority];
  if (!target) return 15; // Unknown seniority, give benefit of doubt
  
  if (yearsExp >= target.min && yearsExp <= target.max) {
    return 15;
  } else if (yearsExp < target.min) {
    const gap = target.min - yearsExp;
    return Math.max(0, 15 - (gap * 3));
  } else {
    const excess = yearsExp - target.max;
    return Math.max(0, 15 - (excess * 2)); // Penalize overqualification less
  }
}

function calculateEvidenceScore(
  user: UserProfile,
  jdSkills: string[]
): number {
  const allBullets = [
    ...user.experience.flatMap(e => e.bullets),
    ...user.projects.flatMap(p => p.bullets)
  ];
  
  let quantifiedRelevantBullets = 0;
  for (const bullet of allBullets) {
    const hasNumber = /\d+/.test(bullet);
    const hasJDKeyword = jdSkills.some(skill => 
      bullet.toLowerCase().includes(skill.toLowerCase())
    );
    if (hasNumber && hasJDKeyword) {
      quantifiedRelevantBullets++;
    }
  }
  
  const score = Math.min((quantifiedRelevantBullets / allBullets.length) * 30, 15);
  return score;
}
```

**Career ROI Calculator**:

```typescript
function calculateCareerROI(
  jd: JDInsights,
  matchScore: number,
  userCurrentSalary: number
): CareerROIResult {
  const avgSalary = (jd.salary_range.low + jd.salary_range.high) / 2;
  const estimatedAppTime = 0.5; // hours with HustlerAI
  
  // Skill growth factor
  const newSkills = jd.skills_extracted.filter(jdSkill => 
    !user.skills.some(us => us.toLowerCase() === jdSkill.name.toLowerCase())
  );
  const mustHaveNewSkills = newSkills.filter(ns => 
    jd.must_haves.some(mh => mh.toLowerCase().includes(ns.name.toLowerCase()))
  );
  const skillGrowthFactor = 1 + (mustHaveNewSkills.length * 0.05); // +5% per must-have skill
  
  // ROI formula
  const roi = (avgSalary * (matchScore / 100) * skillGrowthFactor) / estimatedAppTime;
  
  // Salary lift
  const salaryLift = {
    absolute: avgSalary - userCurrentSalary,
    percentage: ((avgSalary - userCurrentSalary) / userCurrentSalary) * 100
  };
  
  return {
    roi_score: Math.round(roi),
    avg_salary: avgSalary,
    salary_lift: salaryLift,
    skill_growth_factor: skillGrowthFactor,
    new_skills: newSkills.map(s => s.name),
    estimated_app_time_hours: estimatedAppTime
  };
}
```

**SKILL.md Location**: `.claude/skills/match-scorer/SKILL.md`

---

### 7.9) extension-builder-skill

**Responsibility**: Build Chrome extension for autofilling application forms.

**Technology**: Chrome Extension Manifest V3

**Directory Structure**:
```
extension/
├── manifest.json
├── background/
│   └── service-worker.ts
├── content/
│   ├── greenhouse.ts
│   ├── lever.ts
│   └── shared.ts
├── popup/
│   ├── index.html
│   ├── popup.tsx
│   └── styles.css
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── utils/
    ├── api.ts
    └── storage.ts
```

**manifest.json**:
```json
{
  "manifest_version": 3,
  "name": "HustlerAI - Resume Autofill",
  "version": "1.0.0",
  "description": "Autofill job applications with ATS-optimized resumes",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "https://*.greenhouse.io/*",
    "https://boards.greenhouse.io/*",
    "https://*.lever.co/*",
    "https://jobs.lever.co/*",
    "https://hustlerai.tech/*",
    "http://localhost:3000/*"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "assets/icon-16.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": [
        "https://*.greenhouse.io/*/jobs/*",
        "https://boards.greenhouse.io/*"
      ],
      "js": ["content/greenhouse.js"],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://*.lever.co/",
        "https://jobs.lever.co/*/*"
      ],
      "js": ["content/lever.js"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**Content Script (Greenhouse)**:

```typescript
// content/greenhouse.ts

interface GreenhouseForm {
  firstName: HTMLInputElement | null;
  lastName: HTMLInputElement | null;
  email: HTMLInputElement | null;
  phone: HTMLInputElement | null;
  resume: HTMLInputElement | null;
  coverLetter?: HTMLTextAreaElement | null;
  customQuestions: Array<{
    element: HTMLElement;
    type: 'text' | 'textarea' | 'select' | 'radio';
  }>;
}

class GreenhouseAutofiller {
  private form: GreenhouseForm | null = null;
  
  constructor() {
    this.detectForm();
  }
  
  detectForm(): void {
    this.form = {
      firstName: document.querySelector('input[name*="first_name" i]'),
      lastName: document.querySelector('input[name*="last_name" i]'),
      email: document.querySelector('input[type="email"]'),
      phone: document.querySelector('input[type="tel"], input[name*="phone" i]'),
      resume: document.querySelector('input[type="file"][name*="resume" i]'),
      coverLetter: document.querySelector('textarea[name*="cover" i]'),
      customQuestions: this.detectCustomQuestions()
    };
  }
  
  detectCustomQuestions(): Array<any> {
    const questions: Array<any> = [];
    
    // Greenhouse uses specific classes for custom questions
    const questionDivs = document.querySelectorAll('.application-question');
    
    questionDivs.forEach(div => {
      const label = div.querySelector('label')?.textContent?.trim();
      const input = div.querySelector('input, textarea, select');
      
      if (input && label) {
        questions.push({
          label,
          element: input,
          type: input.tagName.toLowerCase()
        });
      }
    });
    
    return questions;
  }
  
  async extractJobDescription(): Promise<string> {
    // Greenhouse typically has JD in a specific container
    const jdContainer = document.querySelector('.job-description, #job_description, [data-qa="job-description"]');
    
    if (jdContainer) {
      return jdContainer.textContent?.trim() || '';
    }
    
    // Fallback: grab all text from main content
    const mainContent = document.querySelector('main, .main-content, #content');
    return mainContent?.textContent?.trim() || document.body.innerText;
  }
  
  async autofill(resumeData: ResumeData, pdfBlob: Blob): Promise<void> {
    if (!this.form) {
      throw new Error('Form not detected');
    }
    
    // Fill basic fields
    if (this.form.firstName) {
      this.fillInput(this.form.firstName, resumeData.firstName);
    }
    if (this.form.lastName) {
      this.fillInput(this.form.lastName, resumeData.lastName);
    }
    if (this.form.email) {
      this.fillInput(this.form.email, resumeData.email);
    }
    if (this.form.phone) {
      this.fillInput(this.form.phone, resumeData.phone);
    }
    
    // Upload PDF resume
    if (this.form.resume) {
      await this.uploadFile(this.form.resume, pdfBlob, resumeData.pdfFilename);
    }
    
    // Fill cover letter if present
    if (this.form.coverLetter && resumeData.coverLetter) {
      this.fillInput(this.form.coverLetter, resumeData.coverLetter);
    }
    
    // Show completion overlay
    this.showCompletionOverlay(resumeData);
  }
  
  fillInput(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  async uploadFile(fileInput: HTMLInputElement, blob: Blob, filename: string): Promise<void> {
    const file = new File([blob], filename, { type: 'application/pdf' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  showCompletionOverlay(resumeData: ResumeData): void {
    const overlay = document.createElement('div');
    overlay.id = 'hustlerai-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #10b981;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 350px;
      ">
        <h3 style="margin: 0 0 10px 0; color: #10b981;">✓ Fields Filled</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
          Your resume and info have been autofilled. Review and submit when ready.
        </p>
        <div style="display: flex; gap: 10px;">
          <button id="hustlerai-preview" style="
            flex: 1;
            padding: 8px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Preview Resume</button>
          <button id="hustlerai-close" style="
            padding: 8px 16px;
            background: #e5e7eb;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        </div>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
          Match Score: ${resumeData.matchScore}/100 | ATS Check: ✓
        </p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('hustlerai-preview')?.addEventListener('click', () => {
      window.open(resumeData.resumeUrl, '_blank');
    });
    
    document.getElementById('hustlerai-close')?.addEventListener('click', () => {
      overlay.remove();
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => overlay.remove(), 10000);
  }
}

// Initialize
const autofiller = new GreenhouseAutofiller();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractJD') {
    autofiller.extractJobDescription().then(jd => {
      sendResponse({ jd });
    });
    return true; // Async response
  }
  
  if (message.action === 'autofill') {
    autofiller.autofill(message.resumeData, message.pdfBlob).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});
```

**Popup (User Interface)**:

```typescript
// popup/popup.tsx

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface PopupState {
  loading: boolean;
  jdDetected: boolean;
  jdText?: string;
  resumeGenerated: boolean;
  error?: string;
}

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({
    loading: true,
    jdDetected: false,
    resumeGenerated: false
  });
  
  useEffect(() => {
    detectJobPosting();
  }, []);
  
  async function detectJobPosting() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      setState({
        ...state,
        loading: false,
        error: 'No active tab detected'
      });
      return;
    }
    
    // Check if on supported platform
    const url = tab.url || '';
    const isSupported = url.includes('greenhouse.io') || url.includes('lever.co');
    
    if (!isSupported) {
      setState({
        ...state,
        loading: false,
        error: 'This page is not supported. Use on Greenhouse or Lever job postings.'
      });
      return;
    }
    
    // Extract JD from page
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJD' });
      
      if (response.jd) {
        setState({
          ...state,
          loading: false,
          jdDetected: true,
          jdText: response.jd
        });
      } else {
        throw new Error('Could not extract job description');
      }
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: 'Failed to extract job description'
      });
    }
  }
  
  async function generateAndFill() {
    setState({ ...state, loading: true });
    
    try {
      // Call backend to tailor resume
      const response = await fetch('https://hustlerai.tech/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_text: state.jdText,
          user_profile: await getUserProfile() // From storage
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate resume');
      
      const data = await response.json();
      
      // Get PDF blob
      const pdfResponse = await fetch(data.pdf_url);
      const pdfBlob = await pdfResponse.blob();
      
      // Send to content script for autofill
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id!, {
        action: 'autofill',
        resumeData: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          pdfFilename: data.pdfFilename,
          resumeUrl: data.liveUrl,
          matchScore: data.matchScore
        },
        pdfBlob
      });
      
      setState({
        ...state,
        loading: false,
        resumeGenerated: true
      });
      
      // Close popup after success
      setTimeout(() => window.close(), 2000);
      
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async function getUserProfile(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        resolve(result.userProfile || null);
      });
    });
  }
  
  if (state.loading) {
    return <div className="popup loading">Loading...</div>;
  }
  
  if (state.error) {
    return (
      <div className="popup error">
        <h3>Error</h3>
        <p>{state.error}</p>
      </div>
    );
  }
  
  if (state.resumeGenerated) {
    return (
      <div className="popup success">
        <h3>✓ Success!</h3>
        <p>Your application has been filled. Check the page.</p>
      </div>
    );
  }
  
  if (state.jdDetected) {
    return (
      <div className="popup">
        <h3>Job Detected</h3>
        <p>Ready to tailor your resume and autofill the application?</p>
        <button onClick={generateAndFill} className="btn-primary">
          Tailor & Fill
        </button>
      </div>
    );
  }
  
  return <div className="popup">Unexpected state</div>;
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
```

**SKILL.md Location**: `.claude/skills/extension-builder/SKILL.md`

---

## 8) REPOSITORY STRUCTURE

```
hustler-ai/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Run tests on PR
│   │   ├── deploy-web.yml            # Deploy Next.js to Vercel
│   │   ├── deploy-workers.yml        # Deploy Cloudflare Workers
│   │   └── deploy-extension.yml      # Build extension artifacts
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── .claude/
│   └── skills/                       # PROJECT SKILLS (shared with team)
│       ├── orchestrator/
│       │   └── SKILL.md
│       ├── jd-analyzer/
│       │   ├── SKILL.md
│       │   ├── prompts/
│       │   │   └── parse-jd.txt
│       │   └── tests/
│       │       └── test-cases.json
│       ├── bullet-rewriter/
│       │   ├── SKILL.md
│       │   └── prompts/
│       │       └── rewrite-bullets.txt
│       ├── ats-validator/
│       │   ├── SKILL.md
│       │   └── rules/
│       │       └── ats-rules.json
│       ├── pdf-generator/
│       │   ├── SKILL.md
│       │   └── templates/
│       │       └── ats-clean.tsx
│       ├── star-generator/
│       │   └── SKILL.md
│       ├── match-scorer/
│       │   └── SKILL.md
│       ├── knowledge-processor/
│       │   └── SKILL.md
│       ├── extension-builder/
│       │   └── SKILL.md
│       ├── api-builder/
│       │   └── SKILL.md
│       ├── testing-skill/
│       │   └── SKILL.md
│       └── deployment-skill/
│           └── SKILL.md
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── analyze-jd/
│   │   │   │   └── route.ts
│   │   │   ├── tailor/
│   │   │   │   └── route.ts
│   │   │   ├── generate-pdf/
│   │   │   │   └── route.ts
│   │   │   ├── star/
│   │   │   │   └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── (routes)/
│   │   │   ├── page.tsx              # Home (JD paste)
│   │   │   ├── edit/
│   │   │   │   └── page.tsx          # Resume editor
│   │   │   ├── result/
│   │   │   │   └── page.tsx          # Final output
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   └── about/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── resume/
│   │   │   ├── ResumePreview.tsx
│   │   │   ├── BulletEditor.tsx
│   │   │   ├── ATSChecklist.tsx
│   │   │   ├── KeywordDial.tsx
│   │   │   ├── MustHaveMatrix.tsx
│   │   │   └── LineBudgetMeter.tsx
│   │   ├── jd/
│   │   │   ├── JDAnalyzer.tsx
│   │   │   ├── MatchScoreCard.tsx
│   │   │   ├── SalaryFitCard.tsx
│   │   │   └── CareerROICard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Toaster.tsx
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gemini.ts             # Gemini API client
│   │   │   ├── openrouter.ts         # OpenRouter fallback
│   │   │   └── prompts.ts            # Prompt templates
│   │   ├── scoring/
│   │   │   ├── keyword-extractor.ts
│   │   │   ├── match-score.ts
│   │   │   ├── line-budget.ts
│   │   │   └── roi-calculator.ts
│   │   ├── ats/
│   │   │   ├── validator.ts
│   │   │   ├── rules.ts
│   │   │   └── checker.ts
│   │   ├── pdf/
│   │   │   ├── generator.ts
│   │   │   ├── templates.tsx
│   │   │   └── qr-code.ts
│   │   ├── knowledge/
│   │   │   ├── loader.ts             # Load processed knowledge
│   │   │   ├── query.ts              # Query knowledge base
│   │   │   └── embeddings.ts         # Optional RAG
│   │   ├── agents/
│   │   │   ├── orchestrator.ts       # Main agent coordinator
│   │   │   ├── skill-invoker.ts      # Invoke skills
│   │   │   └── types.ts              # Agent types
│   │   └── utils/
│   │       ├── api.ts
│   │       ├── storage.ts
│   │       ├── validation.ts
│   │       └── logger.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── job.ts
│   │   ├── resume.ts
│   │   ├── agent.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useJDAnalyzer.ts
│   │   ├── useResumeGenerator.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   └── config/
│       ├── site.ts
│       ├── ai.ts
│       └── constants.ts
│
├── extension/                        # Chrome Extension
│   ├── manifest.json
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── greenhouse.ts
│   │   ├── lever.ts
│   │   └── shared.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.tsx
│   │   └── styles.css
│   ├── assets/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   ├── utils/
│   │   ├── api.ts
│   │   └── storage.ts
│   └── webpack.config.js
│
├── workers/                          # Cloudflare Workers
│   ├── analyze-jd/
│   │   └── index.ts
│   ├── generate-pdf/
│   │   └── index.ts
│   ├── shared/
│   │   └── utils.ts
│   └── wrangler.toml
│
├── knowledge-base/
│   ├── raw/                          # Original PDFs
│   │   ├── Action-Verbs-Quantify.pdf
│   │   ├── nyjcc-resume-template.pdf
│   │   ├── QC-Business-Economics.pdf
│   │   ├── My-Personal-Formula.pdf
│   │   ├── Resume-Format.pdf
│   │   ├── Resume-Template-Examples.pdf
│   │   └── What-Is-ATS.pdf
│   ├── processed/                    # Extracted JSON
│   │   ├── action-verbs.json
│   │   ├── ats-rules.json
│   │   ├── bullet-examples.json
│   │   ├── templates.json
│   │   └── quantification-patterns.json
│   ├── embeddings/                   # Optional: vector embeddings
│   │   └── knowledge.index
│   └── README.md
│
├── scripts/
│   ├── process-knowledge.ts          # Extract PDFs → JSON
│   ├── seed-demo-data.ts             # Create demo users/JDs
│   ├── deploy.sh                     # Deploy script
│   ├── test-e2e.sh                   # Run E2E tests
│   └── generate-skills.ts            # Generate SKILL.md templates
│
├── public/
│   ├── demo-data/
│   │   ├── users/
│   │   │   ├── alex-earlycareer.json
│   │   │   ├── jamie-switcher.json
│   │   │   └── sam-midcareer.json
│   │   └── jobs/
│   │       ├── pm-senior.json
│   │       ├── swe-mid.json
│   │       └── analyst-entry.json
│   ├── salary-data.json
│   ├── fonts/
│   └── images/
│
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── scoring.test.ts
│   │   │   ├── ats-validator.test.ts
│   │   │   └── keyword-extractor.test.ts
│   │   └── components/
│   │       ├── ResumePreview.test.tsx
│   │       └── ATSChecklist.test.tsx
│   ├── integration/
│   │   ├── api/
│   │   │   ├── analyze-jd.test.ts
│   │   │   └── tailor.test.ts
│   │   └── agents/
│   │       └── orchestrator.test.ts
│   └── e2e/
│       ├── full-workflow.spec.ts
│       └── extension.spec.ts
│
├── docs/
│   ├── API.md                        # API documentation
│   ├── ARCHITECTURE.md               # System architecture
│   ├── SKILLS.md                     # Skills documentation
│   ├── CONTRIBUTING.md               # Contribution guidelines
│   └── DEPLOYMENT.md                 # Deployment guide
│
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 9) TECH STACK

### Core Framework
- **Next.js 14+** (App Router, Server Components)
- **React 18+**
- **TypeScript 5+**

### UI & Styling
- **Tailwind CSS 3+**
- **shadcn/ui** (accessible component library)
- **Radix UI** (primitives)
- **Lucide React** (icons)

### AI & LLMs
- **Google Gemini API** (primary: `gemini-1.5-pro`)
- **OpenRouter API** (fallback)
- **LangChain.js** (optional, for advanced chains)

### PDF Processing
- **@react-pdf/renderer** (generate PDFs from React)
- **pdf-parse** (extract text from reference PDFs)
- **qrcode** (QR code generation)

### Chrome Extension
- **Chrome Extension Manifest V3**
- **Webpack 5** (bundler)
- **React** (popup UI)

### Deployment
- **Vercel** (Next.js app hosting)
- **Cloudflare Workers** (AI endpoints)
- **GoDaddy** (domain)

### Database (Optional)
- **MongoDB Atlas** (user profiles, if needed)
- **Vercel KV** (ephemeral storage)

### Testing
- **Jest** (unit tests)
- **React Testing Library** (component tests)
- **Playwright** (E2E tests)

### Dev Tools
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **TypeScript** (type safety)
- **pnpm** (package manager)

### CI/CD
- **GitHub Actions** (workflows)
- **Vercel** (auto-deploy)
- **Wrangler** (Cloudflare CLI)

### Monitoring (Optional)
- **Sentry** (error tracking)
- **Vercel Analytics** (usage)
- **Posthog** (product analytics)

---

## 10) KNOWLEDGE BASE SYSTEM

### Overview

The knowledge base system extracts, structures, and indexes information from reference PDFs to ground all resume generation in proven best practices.

### Reference Materials

1. **Action-Verbs-Quantify.pdf** — Action verbs + quantification frameworks
2. **nyjcc-resume-template.pdf** — ATS-safe template structure
3. **QC-Business-Economics.pdf** — Domain-specific bullet examples
4. **My-Personal-Formula.pdf** — Personal resume methodology
5. **Resume-Format.pdf** — ATS formatting rules
6. **Resume-Template-Examples.pdf** — Real-world examples
7. **What-Is-ATS.pdf** — ATS mechanics and optimization

### Processing Pipeline

**Script**: `scripts/process-knowledge.ts`

```typescript
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface KnowledgeProcessor {
  processAll(): Promise<void>;
  processPDF(filename: string, type: DocumentType): Promise<void>;
  extractActionVerbs(text: string): ActionVerbs;
  extractATSRules(text: string): ATSRules;
  extractBulletExamples(text: string): BulletExample[];
  extractTemplates(text: string): Template[];
}

async function processKnowledgeBase() {
  const rawDir = path.join(process.cwd(), 'knowledge-base/raw');
  const processedDir = path.join(process.cwd(), 'knowledge-base/processed');
  
  // Ensure directories exist
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }
  
  // Process each PDF
  await processActionVerbs();
  await processATSRules();
  await processBulletExamples();
  await processTemplates();
  
  console.log('✓ Knowledge base processed successfully');
}

async function processActionVerbs() {
  const pdfPath = path.join(process.cwd(), 'knowledge-base/raw/Action-Verbs-Quantify.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);
  
  // Extract action verbs by category
  const text = data.text;
  const sections = text.split(/\n\n+/);
  
  const actionVerbs: Record<string, string[]> = {
    leadership: [],
    achievement: [],
    technical: [],
    analysis: [],
    communication: [],
    creativity: []
  };
  
  let currentCategory = '';
  for (const section of sections) {
    // Detect category headers
    const categoryMatch = section.match(/^(Leadership|Achievement|Technical|Analysis|Communication|Creativity)/i);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].toLowerCase();
      continue;
    }
    
    // Extract verbs (words that start with capital letter)
    if (currentCategory) {
      const verbs = section.match(/\b[A-Z][a-z]+\b/g) || [];
      actionVerbs[currentCategory].push(...verbs);
    }
  }
  
  // Extract quantification patterns
  const quantPatterns = extractQuantificationPatterns(text);
  
  const output = {
    action_verbs: actionVerbs,
    quantification_patterns: quantPatterns,
    metadata: {
      source: 'Action-Verbs-Quantify.pdf',
      processed_at: new Date().toISOString(),
      total_verbs: Object.values(actionVerbs).flat().length
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'knowledge-base/processed/action-verbs.json'),
    JSON.stringify(output, null, 2)
  );
}

function extractQuantificationPatterns(text: string): string[] {
  const patterns: string[] = [];
  
  // Common quantification patterns
  const regexes = [
    /Increased .* by \d+%/gi,
    /Reduced .* from .* to .*/gi,
    /Managed [\$€£][\d,]+ budget/gi,
    /Led team of \d+ people/gi,
    /Delivered .* in \d+ (weeks|months)/gi,
    /Improved .* by \d+%/gi,
    /Generated [\$€£][\d,]+ in .*/gi
  ];
  
  for (const regex of regexes) {
    const matches = text.match(regex) || [];
    patterns.push(...matches);
  }
  
  return [...new Set(patterns)];
}

async function processATSRules() {
  // Read Resume-Format.pdf and What-Is-ATS.pdf
  const formatPdf = await readPDF('Resume-Format.pdf');
  const atsPdf = await readPDF('What-Is-ATS.pdf');
  
  const combinedText = formatPdf + '\n' + atsPdf;
  
  const atsRules = {
    layout: {
      single_column: true,
      no_tables: extractRule(combinedText, 'table'),
      no_text_boxes: extractRule(combinedText, 'text box'),
      no_headers_footers: extractRule(combinedText, 'header|footer'),
      max_pages: 1
    },
    fonts: {
      approved: ['Arial', 'Calibri', 'Helvetica', 'Times New Roman'],
      body_size: { min: 10.5, max: 11.5 },
      header_size: { min: 12, max: 14 }
    },
    sections: {
      required: ['Experience', 'Education', 'Skills'],
      optional: ['Summary', 'Projects', 'Certifications', 'Activities'],
      order: ['Summary', 'Experience', 'Projects', 'Education', 'Skills', 'Certifications']
    },
    keywords: {
      min_coverage: 8,
      max_density: 0.03,
      placement: ['summary', 'experience_bullets', 'skills_section']
    },
    file: {
      format: 'PDF',
      max_size_mb: 2,
      naming: '{FirstName}_{LastName}_{Role}_{Company}.pdf'
    },
    metadata: {
      source: ['Resume-Format.pdf', 'What-Is-ATS.pdf'],
      processed_at: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'knowledge-base/processed/ats-rules.json'),
    JSON.stringify(atsRules, null, 2)
  );
}

async function processBulletExamples() {
  // Read QC-Business-Economics.pdf and Resume-Template-Examples.pdf
  const qcPdf = await readPDF('QC-Business-Economics.pdf');
  const examplesPdf = await readPDF('Resume-Template-Examples.pdf');
  
  const combinedText = qcPdf + '\n' + examplesPdf;
  
  // Extract bullets (lines that start with • or -)
  const bulletRegex = /^[•\-]\s*(.+)$/gm;
  const matches = [...combinedText.matchAll(bulletRegex)];
  
  const bullets: BulletExample[] = matches.map(match => {
    const bullet = match[1].trim();
    return {
      text: bullet,
      category: categorizeBullet(bullet),
      has_quantification: /\d+/.test(bullet),
      has_action_verb: /^[A-Z][a-z]+/.test(bullet),
      score: scoreBullet(bullet)
    };
  });
  
  // Sort by score and take top 100
  const topBullets = bullets
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  
  fs.writeFileSync(
    path.join(process.cwd(), 'knowledge-base/processed/bullet-examples.json'),
    JSON.stringify({
      bullets: topBullets,
      metadata: {
        source: ['QC-Business-Economics.pdf', 'Resume-Template-Examples.pdf'],
        total_extracted: bullets.length,
        top_selected: topBullets.length,
        processed_at: new Date().toISOString()
      }
    }, null, 2)
  );
}

function categorizeBullet(bullet: string): string {
  const lowerBullet = bullet.toLowerCase();
  
  if (lowerBullet.includes('led') || lowerBullet.includes('managed')) {
    return 'leadership';
  } else if (lowerBullet.includes('developed') || lowerBullet.includes('built')) {
    return 'technical';
  } else if (lowerBullet.includes('analyzed') || lowerBullet.includes('evaluated')) {
    return 'analysis';
  } else if (lowerBullet.includes('increased') || lowerBullet.includes('improved')) {
    return 'achievement';
  } else if (lowerBullet.includes('collaborated') || lowerBullet.includes('presented')) {
    return 'communication';
  } else {
    return 'general';
  }
}

function scoreBullet(bullet: string): number {
  let score = 0;
  
  // Has action verb at start
  if (/^[A-Z][a-z]+/.test(bullet)) score += 20;
  
  // Has quantification
  if (/\d+/.test(bullet)) score += 30;
  if (/%/.test(bullet)) score += 10;
  if (/\$/.test(bullet)) score += 10;
  
  // Has impact keywords
  const impactKeywords = ['increased', 'reduced', 'improved', 'delivered', 'achieved'];
  if (impactKeywords.some(kw => bullet.toLowerCase().includes(kw))) score += 20;
  
  // Good length (60-120 chars)
  if (bullet.length >= 60 && bullet.length <= 120) score += 10;
  
  return score;
}

async function readPDF(filename: string): Promise<string> {
  const pdfPath = path.join(process.cwd(), `knowledge-base/raw/${filename}`);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);
  return data.text;
}

// Run
processKnowledgeBase().catch(console.error);
```

### Usage in Skills

Skills load knowledge via:

```typescript
// lib/knowledge/loader.ts

export function loadActionVerbs(): ActionVerbs {
  const path = './knowledge-base/processed/action-verbs.json';
  const data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

export function loadATSRules(): ATSRules {
  const path = './knowledge-base/processed/ats-rules.json';
  const data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

export function loadBulletExamples(category?: string): BulletExample[] {
  const path = './knowledge-base/processed/bullet-examples.json';
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
  
  if (category) {
    return data.bullets.filter((b: BulletExample) => b.category === category);
  }
  return data.bullets;
}
```

---

## 11) API DESIGN

### Base URL

- **Production**: `https://hustlerai.tech/api`
- **Development**: `http://localhost:3000/api`

### Authentication

No authentication required for MVP (ephemeral mode).

### Endpoints

#### `POST /api/analyze-jd`

**Description**: Parse job description into structured insights.

**Request**:
```json
{
  "jd_text": "We're seeking a Senior Product Manager with 5+ years...",
  "jd_url": "https://boards.greenhouse.io/company/jobs/123",
  "user_baseline_salary": 100000
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "title": "Senior Product Manager",
    "company": "Acme Corp",
    "location": "Remote (US)",
    "seniority": "senior",
    "skills_extracted": [
      {"name": "product strategy", "weight": 10, "category": "core"},
      {"name": "roadmap planning", "weight": 9, "category": "core"},
      {"name": "stakeholder management", "weight": 8, "category": "soft"}
    ],
    "must_haves": [
      "5+ years PM experience",
      "B2B SaaS background",
      "Experience with agile methodologies"
    ],
    "nice_to_haves": [
      "Technical background",
      "MBA preferred",
      "Prior startup experience"
    ],
    "salary_range": {
      "low": 120000,
      "high": 160000,
      "currency": "USD",
      "geo": "US-Remote",
      "percentile_50": 140000
    },
    "keywords_top_10": [
      "product", "roadmap", "stakeholders", "agile", "strategy",
      "b2b", "saas", "metrics", "vision", "cross-functional"
    ],
    "recruiter_tldr": "Seeking experienced PM to lead B2B SaaS product strategy, drive roadmap, and manage cross-functional teams using agile methodologies."
  },
  "metadata": {
    "duration_ms": 1847,
    "tokens_used": 1523
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "error": {
    "code": "GEMINI_API_ERROR",
    "message": "Failed to parse job description",
    "details": "Rate limit exceeded"
  }
}
```

---

#### `POST /api/tailor`

**Description**: Generate tailored resume from user profile and JD insights.

**Request**:
```json
{
  "user_profile": {
    "name": "Alex Johnson",
    "contact": {
      "email": "alex@example.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA",
      "links": ["linkedin.com/in/alexj", "github.com/alexj"]
    },
    "summary": "Product Manager with 6 years experience...",
    "experience": [
      {
        "title": "Product Manager",
        "company": "TechCo",
        "location": "SF, CA",
        "start_date": "Jan 2020",
        "end_date": "Present",
        "bullets": [
          "Led product roadmap for B2B SaaS platform",
          "Managed cross-functional team of 8",
          "Increased user engagement by 35%"
        ]
      }
    ],
    "projects": [...],
    "education": [...],
    "skills": ["Product Strategy", "Agile", "SQL", "Jira", "Figma"],
    "certifications": [...]
  },
  "jd_insights": {
    // Output from /api/analyze-jd
  },
  "mode": "hybrid"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_sections": {
      "name": "Alex Johnson",
      "contact": {...},
      "summary": "...",
      "experience": [...],
      "projects": [...],
      "education": [...],
      "skills": [...],
      "certifications": [...]
    },
    "metadata": {
      "match_score": 87,
      "ats_score": 95,
      "keyword_coverage": {
        "product": 4,
        "roadmap": 3,
        "stakeholders": 2,
        "agile": 2,
        "strategy": 3
      },
      "line_count": 47,
      "page_count": 1
    },
    "ats_checklist": {
      "layout": true,
      "fonts": true,
      "keywords": 9,
      "single_column": true,
      "file_format": true
    },
    "recruiter_tldr": "Senior PM with 6yr B2B SaaS experience, strong in roadmap planning and cross-functional leadership. Proven track record of increasing engagement and managing agile teams.",
    "must_have_matrix": [
      {
        "requirement": "5+ years PM experience",
        "evidence": "Experience Section → TechCo (4yr) + Previous Role (2yr)"
      },
      {
        "requirement": "B2B SaaS background",
        "evidence": "Experience Section, Bullet 1: 'Led product roadmap for B2B SaaS platform'"
      }
    ],
    "pdf_url": "https://hustlerai.tech/outputs/alex_johnson_pm_acme.pdf",
    "live_url": "https://hustlerai.tech/r/abc123"
  },
  "metadata": {
    "duration_ms": 3241,
    "tokens_used": 2847
  }
}
```

---

#### `POST /api/generate-pdf`

**Description**: Generate PDF from resume sections.

**Request**:
```json
{
  "resume_sections": {
    // Resume data
  },
  "metadata": {
    "match_score": 87,
    "ats_score": 95,
    "qr_url": "https://hustlerai.tech/r/abc123"
  },
  "template": "ats-clean"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "pdf_url": "https://hustlerai.tech/outputs/resume_abc123.pdf",
    "pdf_base64": "JVBERi0xLjcKJeLjz9MK...",
    "metadata": {
      "file_size_bytes": 87234,
      "page_count": 1,
      "line_count": 47,
      "generation_time_ms": 824
    }
  }
}
```

---

#### `POST /api/star`

**Description**: Generate STAR behavioral interview answers.

**Request**:
```json
{
  "user_profile": {
    // User experience data
  },
  "jd_insights": {
    // JD insights
  },
  "num_answers": 5
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "answers": [
      {
        "question": "Tell me about a time you led a cross-functional project",
        "star": {
          "situation": "At TechCo, our Q3 product launch was delayed due to design-eng misalignment (Sept 2023).",
          "task": "I was tasked with getting both teams on a unified timeline for 6-week sprint.",
          "action": "I facilitated 3 design sprints using Figma, created shared Jira board with daily standups, and implemented agile ceremonies. Leveraged my product strategy skills to align priorities.",
          "result": "Delivered launch 2 weeks ahead of schedule, improved cross-team satisfaction score from 6.2 to 8.5, shipped 4 major features that drove 35% increase in user engagement."
        },
        "keywords_used": ["cross-functional", "agile", "product strategy", "roadmap"]
      }
    ]
  },
  "metadata": {
    "duration_ms": 2134,
    "tokens_used": 1876
  }
}
```

---

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `GEMINI_API_ERROR` | Gemini API call failed |
| `OPENROUTER_FALLBACK_FAILED` | Fallback to OpenRouter failed |
| `PDF_GENERATION_ERROR` | PDF generation failed |
| `KNOWLEDGE_BASE_ERROR` | Failed to load knowledge base |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Unexpected server error |

---

## 12) ALGORITHMS & SCORING

### 12.1) Keyword Extraction

**Algorithm**: TF-IDF + POS Tagging

```typescript
function extractKeywords(jdText: string): string[] {
  // 1. Normalize text
  const normalized = jdText.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 2. Tokenize
  const tokens = normalized.split(' ');
  
  // 3. Remove stopwords
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', ...]);
  const filteredTokens = tokens.filter(t => !stopwords.has(t) && t.length > 2);
  
  // 4. Calculate TF-IDF
  const termFreq: Record<string, number> = {};
  for (const token of filteredTokens) {
    termFreq[token] = (termFreq[token] || 0) + 1;
  }
  
  // 5. Sort by frequency and take top 20
  const sorted = Object.entries(termFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
  
  // 6. Group multi-word phrases using Gemini
  const grouped = await groupKeywords(sorted, jdText);
  
  return grouped.slice(0, 10);
}

async function groupKeywords(keywords: string[], context: string): Promise<string[]> {
  const prompt = `
Given these keywords from a job description:
${keywords.join(', ')}

And this context:
${context.slice(0, 500)}...

Group related words into meaningful skills/phrases. Return top 10 most important skills.

Example:
Input: ["sql", "database", "query", "python", "data"]
Output: ["SQL", "Database Management", "Python", "Data Analysis"]

Return JSON array only.
  `;
  
  const response = await callGemini(prompt);
  return JSON.parse(response);
}
```

---

### 12.2) Match Score Calculation

See Section 7.8 (match-scorer-skill) for full algorithm.

**Summary**:
- **50%**: Skill Overlap (user skills ∩ top 10 JD skills)
- **20%**: Must-Have Coverage (% of requirements met)
- **15%**: Seniority Fit (years of experience vs. role level)
- **15%**: Evidence Score (quantified bullets mentioning JD topics)

---

### 12.3) Line Budget Calculation

```typescript
const CHARS_PER_LINE_AT_11PT = 90;
const MAX_LINES_PER_PAGE = 52; // With 0.5" margins

function calculateLineCount(sections: ResumeSections): number {
  let lines = 0;
  
  // Header (name + contact)
  lines += 3;
  
  // Summary
  if (sections.summary) {
    lines += Math.ceil(sections.summary.length / CHARS_PER_LINE_AT_11PT);
  }
  
  // Experience
  for (const exp of sections.experience) {
    lines += 3; // Title + company + dates
    for (const bullet of exp.bullets) {
      lines += Math.ceil(bullet.length / CHARS_PER_LINE_AT_11PT);
    }
    lines += 0.5; // Section spacing
  }
  
  // Projects
  for (const proj of sections.projects) {
    lines += 2; // Title + link
    for (const bullet of proj.bullets) {
      lines += Math.ceil(bullet.length / CHARS_PER_LINE_AT_11PT);
    }
    lines += 0.5;
  }
  
  // Education
  for (const edu of sections.education) {
    lines += 2.5;
  }
  
  // Skills (estimate based on count)
  lines += Math.ceil(sections.skills.length * 12 / 540); // ~12 chars per skill, 540 chars per line
  
  // Certifications
  if (sections.certifications) {
    lines += sections.certifications.length;
  }
  
  return Math.ceil(lines);
}

function enforceOnePageLimit(sections: ResumeSections, jdKeywords: string[]): ResumeSections {
  let lines = calculateLineCount(sections);
  
  if (lines <= MAX_LINES_PER_PAGE) {
    return sections;
  }
  
  // Score all bullets
  const bulletScores: Array<{section: string, index: number, score: number}> = [];
  
  sections.experience.forEach((exp, expIdx) => {
    exp.bullets.forEach((bullet, bulletIdx) => {
      bulletScores.push({
        section: `experience.${expIdx}`,
        index: bulletIdx,
        score: scoreBullet(bullet, jdKeywords)
      });
    });
  });
  
  sections.projects.forEach((proj, projIdx) => {
    proj.bullets.forEach((bullet, bulletIdx) => {
      bulletScores.push({
        section: `projects.${projIdx}`,
        index: bulletIdx,
        score: scoreBullet(bullet, jdKeywords)
      });
    });
  });
  
  // Sort by score (lowest first)
  bulletScores.sort((a, b) => a.score - b.score);
  
  // Remove bullets until under limit
  while (lines > MAX_LINES_PER_PAGE && bulletScores.length > 0) {
    const toRemove = bulletScores.shift()!;
    removeBulletFromSection(sections, toRemove.section, toRemove.index);
    lines = calculateLineCount(sections);
  }
  
  // Ensure minimum 5 bullets total
  const totalBullets = countTotalBullets(sections);
  if (totalBullets < 5) {
    throw new Error('Cannot reduce to 1 page without losing critical content');
  }
  
  return sections;
}
```

---

## 13) DATA MODELS

### User Profile

```typescript
interface UserProfile {
  id?: string;
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    links: string[]; // LinkedIn, GitHub, Portfolio, etc.
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    start_date: string; // "Jan 2020"
    end_date: string; // "Present" or "Dec 2023"
    bullets: string[];
    tech?: string[]; // Technologies used
    impact?: string; // Overall impact statement
  }>;
  projects: Array<{
    name: string;
    link?: string;
    bullets: string[];
    tech?: string[];
    impact?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    graduation_year: string;
    gpa?: string;
    highlights?: string[]; // Dean's list, etc.
  }>;
  skills: string[]; // Flat list of skills
  certifications?: Array<{
    name: string;
    org: string;
    year: string;
  }>;
  activities?: Array<{
    org: string;
    role: string;
    bullets: string[];
  }>;
  baseline_salary?: number; // For ROI calculations
  created_at?: string;
  updated_at?: string;
}
```

---

### Job Description Insights

```typescript
interface JDInsights {
  id?: string;
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
  salary_range: {
    low: number;
    high: number;
    currency: string;
    geo: string;
    percentile_25?: number;
    percentile_50?: number;
    percentile_75?: number;
  };
  keywords_top_10: string[];
  recruiter_tldr: string;
  jd_text?: string; // Original text
  jd_url?: string; // Original URL
  metadata?: {
    jd_length: number;
    confidence_score: number;
    extracted_at: string;
  };
}
```

---

### Tailored Resume

```typescript
interface TailoredResume {
  id?: string;
  user_id?: string;
  job_id?: string;
  resume_sections: {
    name: string;
    contact: ContactInfo;
    summary?: string;
    experience: ExperienceItem[];
    projects: ProjectItem[];
    education: EducationItem[];
    skills: string[];
    certifications?: CertificationItem[];
    activities?: ActivityItem[];
  };
  metadata: {
    match_score: number;
    ats_score: number;
    keyword_coverage: Record<string, number>;
    line_count: number;
    page_count: number;
    mode: 'hybrid' | 'manual' | 'full-auto';
  };
  ats_checklist: ATSChecklistResult;
  recruiter_tldr: string;
  must_have_matrix: Array<{
    requirement: string;
    evidence: string;
  }>;
  pdf_url?: string;
  live_url?: string;
  created_at: string;
  expires_at?: string; // For ephemeral mode
}
```

---

### STAR Answer

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
  word_count: number;
}

interface STARAnswerSet {
  id?: string;
  user_id?: string;
  job_id?: string;
  answers: STARAnswer[];
  created_at: string;
  expires_at?: string;
}
```

---

## 14) ATS COMPLIANCE RULES

### Layout Requirements

✅ **DO:**
- Single column layout
- Standard section headings (Experience, Education, Skills)
- Clear visual hierarchy
- Consistent spacing
- Left-aligned text

❌ **DON'T:**
- Multiple columns
- Tables
- Text boxes
- Headers/footers (except minimal footer)
- Graphics, images, icons
- Fancy shapes or borders

---

### Font Requirements

✅ **APPROVED FONTS:**
- Arial
- Calibri
- Helvetica
- Times New Roman

✅ **FONT SIZES:**
- Body text: 10.5 - 11.5pt
- Headers: 12 - 14pt
- Name: 14 - 16pt

❌ **DON'T USE:**
- Decorative fonts
- Script fonts
- Fonts < 10pt or > 16pt
- Multiple font families in one resume

---

### Section Requirements

✅ **REQUIRED SECTIONS:**
- Experience
- Education
- Skills

✅ **OPTIONAL SECTIONS:**
- Summary / Objective
- Projects
- Certifications
- Activities / Leadership

✅ **SECTION NAMING:**
- Use standard names (not "My Work History" or "Where I've Been")
- Examples: "Professional Experience", "Work Experience", "Education", "Technical Skills"

---

### Keyword Requirements

✅ **BEST PRACTICES:**
- Include 8-10 top JD keywords naturally
- Place keywords in: summary, experience bullets, skills section
- Use exact keyword phrases from JD when possible
- Balance keyword usage (don't stuff)

❌ **DON'T:**
- Keyword stuff (>3% keyword density)
- Hide keywords in white text
- Repeat same keyword excessively
- Use unnatural phrasing just for keywords

---

### File Requirements

✅ **FILE FORMAT:**
- True PDF (text-based, not scanned image)
- File size < 2MB
- Naming: `FirstName_LastName_Role_Company.pdf`

❌ **DON'T:**
- .docx or .doc (can have formatting issues)
- Image-based PDFs
- Files > 2MB

---

### Content Requirements

✅ **DO:**
- Use action verbs to start bullets
- Quantify achievements with numbers
- Keep bullets to 1-2 lines each
- Include relevant keywords naturally
- Show impact and results

❌ **DON'T:**
- Use personal pronouns (I, me, my)
- Include photos
- List references
- Include irrelevant information
- Exceed 1 page (for most roles)

---

## 15) CHROME EXTENSION ARCHITECTURE

See Section 7.9 (extension-builder-skill) for implementation details.

### Key Components

1. **Manifest V3** (manifest.json)
2. **Background Service Worker** (background/service-worker.ts)
3. **Content Scripts** (content/greenhouse.ts, content/lever.ts)
4. **Popup UI** (popup/popup.tsx)
5. **API Client** (utils/api.ts)

### Security Considerations

- **CSP**: Content Security Policy in manifest
- **Host Permissions**: Limit to specific ATS platforms only
- **No Eval**: No dynamic code execution
- **HTTPS Only**: All API calls over HTTPS
- **User Control**: User clicks final Submit, not extension

---

## 16) SECURITY & PRIVACY

### Data Privacy

1. **Ephemeral Mode (Default)**
   - No user accounts
   - No data stored on server beyond session
   - Auto-delete artifacts after 30 minutes
   - Session-only storage (browser localStorage)

2. **Data Minimization**
   - Don't send PII to AI APIs (redact phone/email from prompts)
   - No resume storage unless user explicitly saves
   - No analytics beyond aggregate metrics

3. **GDPR Compliance**
   - No personal data collection
   - No cookies beyond essential session
   - User can clear all data instantly

### API Security

1. **Rate Limiting**
   - Per-IP: 100 requests/hour
   - Per-session: 20 requests/hour

2. **Input Validation**
   - Sanitize all inputs
   - Max payload sizes
   - Content-type checking

3. **HTTPS Only**
   - All traffic encrypted
   - HSTS headers
   - Secure cookies

### Extension Security

1. **Permissions**
   - Minimal permissions (only activeTab, scripting, storage)
   - Limited host_permissions (only Greenhouse & Lever)

2. **Content Script Isolation**
   - No access to extension APIs
   - Communication via messages only

3. **No Auto-Submit**
   - User MUST click final Submit button
   - Extension only fills, never submits

---

## 17) TESTING STRATEGY

### Unit Tests

**Framework**: Jest + React Testing Library

**Coverage**: 80%+ target

**Examples**:

```typescript
// tests/unit/lib/scoring.test.ts

describe('Match Score Calculator', () => {
  it('should calculate skill overlap correctly', () => {
    const userSkills = ['Python', 'SQL', 'React'];
    const jdSkills = ['python', 'sql', 'javascript'];
    const overlap = calculateSkillOverlap(userSkills, jdSkills);
    expect(overlap).toBe(66.67); // 2 out of 3 match
  });
  
  it('should handle case-insensitive matching', () => {
    const userSkills = ['python', 'SQL'];
    const jdSkills = ['Python', 'sql'];
    const overlap = calculateSkillOverlap(userSkills, jdSkills);
    expect(overlap).toBe(100);
  });
});

// tests/unit/components/ResumePreview.test.tsx

describe('ResumePreview', () => {
  it('should render all sections', () => {
    const resume = mockResumeData();
    render(<ResumePreview resume={resume} />);
    
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });
  
  it('should highlight keywords when clicked', () => {
    const resume = mockResumeData();
    const { getByText } = render(<ResumePreview resume={resume} keywords={['Python']} />);
    
    fireEvent.click(getByText('Python'));
    expect(getByText('Python')).toHaveClass('highlighted');
  });
});
```

---

### Integration Tests

**Framework**: Jest + Supertest (API testing)

**Examples**:

```typescript
// tests/integration/api/analyze-jd.test.ts

describe('POST /api/analyze-jd', () => {
  it('should parse JD successfully', async () => {
    const response = await request(app)
      .post('/api/analyze-jd')
      .send({
        jd_text: 'We are seeking a Senior PM with 5+ years experience...'
      })
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.title).toBe('Senior Product Manager');
    expect(response.body.data.skills_extracted).toHaveLength(10);
  });
  
  it('should handle invalid input', async () => {
    const response = await request(app)
      .post('/api/analyze-jd')
      .send({
        jd_text: '' // Empty
      })
      .expect(400);
    
    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });
});
```

---

### E2E Tests

**Framework**: Playwright

**Examples**:

```typescript
// tests/e2e/full-workflow.spec.ts

test('full workflow: JD → tailored resume → download', async ({ page }) => {
  // 1. Navigate to home
  await page.goto('http://localhost:3000');
  
  // 2. Paste JD
  await page.fill('textarea[name="jd"]', mockJobDescription);
  await page.click('button:has-text("Analyze")');
  
  // 3. Wait for analysis
  await page.waitForSelector('.match-score-card');
  const matchScore = await page.textContent('.match-score-card .score');
  expect(parseInt(matchScore!)).toBeGreaterThan(70);
  
  // 4. Click Tailor
  await page.click('button:has-text("Tailor Resume")');
  
  // 5. Wait for preview
  await page.waitForSelector('.resume-preview');
  
  // 6. Verify ATS checklist
  const checkslistItems = await page.$$('.ats-checklist-item.checked');
  expect(checkslistItems.length).toBeGreaterThanOrEqual(4);
  
  // 7. Download PDF
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Download PDF")');
  const download = await downloadPromise;
  
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});

// tests/e2e/extension.spec.ts

test('extension: autofill Greenhouse form', async ({ page, context }) => {
  // Load extension
  const extensionPath = './extension/dist';
  await context.addInitScript({ path: extensionPath });
  
  // Navigate to Greenhouse job posting
  await page.goto('https://boards.greenhouse.io/example/jobs/123456');
  
  // Click extension icon (simulate)
  await page.evaluate(() => {
    chrome.runtime.sendMessage({ action: 'extractJD' });
  });
  
  // Wait for autofill
  await page.waitForTimeout(2000);
  
  // Verify fields filled
  const firstName = await page.inputValue('input[name*="first_name"]');
  expect(firstName).not.toBe('');
  
  const email = await page.inputValue('input[type="email"]');
  expect(email).toMatch(/@.+\..+/);
  
  // Verify overlay shown
  const overlay = await page.$('#hustlerai-overlay');
  expect(overlay).not.toBeNull();
});
```

---

### Test Data

**Location**: `tests/fixtures/`

```typescript
// tests/fixtures/mock-data.ts

export const mockUserProfile: UserProfile = {
  name: "Alex Johnson",
  contact: {
    email: "alex@example.com",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    links: ["linkedin.com/in/alexj", "github.com/alexj"]
  },
  experience: [
    {
      title: "Product Manager",
      company: "TechCo",
      location: "SF, CA",
      start_date: "Jan 2020",
      end_date: "Present",
      bullets: [
        "Led product roadmap for B2B SaaS platform serving 10K+ users",
        "Managed cross-functional team of 8 engineers and designers",
        "Increased user engagement by 35% through data-driven features"
      ]
    }
  ],
  education: [
    {
      school: "UC Berkeley",
      degree: "BS Computer Science",
      graduation_year: "2018"
    }
  ],
  skills: ["Product Strategy", "Agile", "SQL", "Python", "Jira", "Figma"]
};

export const mockJobDescription = `
Senior Product Manager - B2B SaaS

We're seeking a Senior Product Manager with 5+ years of experience to lead our B2B SaaS product strategy. 

Requirements:
- 5+ years of product management experience
- Strong background in B2B SaaS
- Experience with agile methodologies
- Excellent stakeholder management skills
- Data-driven decision making

Preferred:
- Technical background
- MBA or equivalent
- Prior startup experience

Salary: $120K - $160K
`;
```

---

## 18) DEPLOYMENT STRATEGY

### Environments

1. **Development**: `http://localhost:3000`
2. **Staging**: `https://staging.hustlerai.tech`
3. **Production**: `https://hustlerai.tech`

---

### Deployment Platforms

#### Next.js Web App → Vercel

```yaml
# .github/workflows/deploy-web.yml

name: Deploy Web to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Process knowledge base
        run: pnpm run process-knowledge
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Cloudflare Workers

```yaml
# .github/workflows/deploy-workers.yml

name: Deploy Workers to Cloudflare

on:
  push:
    branches: [main]
    paths:
      - 'workers/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: cd workers && npm install
      
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: 'workers'
          command: deploy --env production
```

#### Chrome Extension

```yaml
# .github/workflows/deploy-extension.yml

name: Build Extension

on:
  push:
    branches: [main]
    paths:
      - 'extension/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: cd extension && npm install
      
      - name: Build extension
        run: cd extension && npm run build
      
      - name: Package extension
        run: cd extension/dist && zip -r ../hustlerai-extension.zip .
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: extension
          path: extension/hustlerai-extension.zip
```

---

### Environment Variables

```bash
# .env.example

# AI APIs
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Database (optional)
MONGODB_URI=mongodb+srv://...

# Domain
NEXT_PUBLIC_API_URL=https://hustlerai.tech
NEXT_PUBLIC_LIVE_URL=https://hustlerai.tech

# ElevenLabs (optional)
ELEVENLABS_API_KEY=your_key
```

---

### Domain Setup (GoDaddy)

1. Purchase domain: `hustlerai.tech`
2. Configure DNS:
   ```
   A Record: @ → 76.76.21.21 (Vercel)
   CNAME Record: www → cname.vercel-dns.com
   ```
3. Add to Vercel project:
   - Project Settings → Domains → Add `hustlerai.tech`

---

### Monitoring & Alerts

**Vercel Analytics**: Automatic (included)

**Error Tracking**: Sentry (optional)

```typescript
// src/lib/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## 19) DEVELOPMENT WORKFLOW

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/hustler-ai.git
cd hustler-ai

# 2. Install pnpm (if not installed)
npm install -g pnpm

# 3. Install dependencies
pnpm install

# 4. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 5. Process knowledge base
pnpm run process-knowledge

# 6. Seed demo data
pnpm run seed-demo

# 7. Start dev server
pnpm dev
```

---

### Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "process-knowledge": "tsx scripts/process-knowledge.ts",
    "seed-demo": "tsx scripts/seed-demo-data.ts",
    "build:extension": "cd extension && npm run build",
    "deploy:workers": "cd workers && wrangler deploy",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

---

### Git Workflow

**Branches**:
- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — Feature branches
- `fix/*` — Bug fix branches

**Commit Convention**: Conventional Commits

```bash
feat: add keyword dial component
fix: correct ATS validation logic
docs: update README with setup instructions
test: add tests for match scorer
chore: update dependencies
```

**Pre-commit Hooks**:

```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint
pnpm typecheck
pnpm test
```

---

### Code Style

**ESLint**: `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**Prettier**: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 20) IMPLEMENTATION TIMELINE

### Phase 1: Foundation (0-6 hours)

**Hour 0-2: Setup & Infrastructure**
- ✅ Initialize Next.js project with TypeScript
- ✅ Configure Tailwind CSS + shadcn/ui
- ✅ Set up repository structure
- ✅ Create Claude Skills scaffolding
- ✅ Process knowledge base (run script)
- ✅ Seed demo data

**Hour 2-4: Core Skills Development**
- ✅ Build `knowledge-processor-skill`
- ✅ Build `jd-analyzer-skill` (Gemini integration)
- ✅ Build `match-scorer-skill`
- ✅ Create API route: `/api/analyze-jd`

**Hour 4-6: Resume Generation**
- ✅ Build `bullet-rewriter-skill`
- ✅ Build `ats-validator-skill`
- ✅ Create API route: `/api/tailor`

---

### Phase 2: Resume Builder (6-12 hours)

**Hour 6-8: UI Components**
- ✅ Build Home page (JD paste form)
- ✅ Build JD Analyzer components (Match Score, Salary Fit)
- ✅ Build Resume Editor components (Bullet Editor, Preview)

**Hour 8-10: Advanced UI**
- ✅ Build ATS Checklist component
- ✅ Build Keyword Dial component
- ✅ Build Must-Have Matrix component
- ✅ Build Line Budget Meter component

**Hour 10-12: PDF Generation**
- ✅ Build `pdf-generator-skill`
- ✅ Create ATS-clean template with React-PDF
- ✅ Add QR code to footer
- ✅ Create API route: `/api/generate-pdf`

---

### Phase 3: Interview Prep (12-15 hours)

**Hour 12-14: STAR Answers**
- ✅ Build `star-generator-skill`
- ✅ Create API route: `/api/star`
- ✅ Build STAR Answers UI component
- ✅ Add export functionality (txt, md, json)

**Hour 14-15: Financial Lens**
- ✅ Add Career ROI calculator to `match-scorer-skill`
- ✅ Build Salary Fit Card component
- ✅ Build Career ROI Card component

---

### Phase 4: Chrome Extension (15-20 hours)

**Hour 15-17: Extension Core**
- ✅ Create manifest.json (MV3)
- ✅ Build background service worker
- ✅ Build popup UI

**Hour 17-19: Content Scripts**
- ✅ Build Greenhouse content script
- ✅ Build Lever content script
- ✅ Implement autofill logic
- ✅ Implement file upload

**Hour 19-20: Testing & Polish**
- ✅ Test on real Greenhouse/Lever pages
- ✅ Add completion overlay
- ✅ Handle edge cases

---

### Phase 5: Deployment (20-22 hours)

**Hour 20-21: Cloudflare Workers**
- ✅ Deploy `/analyze-jd` endpoint to Cloudflare
- ✅ Configure wrangler.toml
- ✅ Test Worker endpoint

**Hour 21-22: Domain & Final Deploy**
- ✅ Configure GoDaddy domain
- ✅ Deploy to Vercel (production)
- ✅ Test full workflow end-to-end
- ✅ Enable Offline Demo mode

---

### Phase 6: Polish & Demo (22-24 hours)

**Hour 22-23: Final Polish**
- ✅ Fix any bugs
- ✅ Optimize performance
- ✅ Add loading states
- ✅ Add error handling
- ✅ Test accessibility

**Hour 23-24: Demo Preparation**
- ✅ Rehearse 90-second pitch
- ✅ Prepare demo account
- ✅ Test offline mode
- ✅ Create demo video backup
- ✅ Write README

---

## 21) DEMO SCRIPT

**Duration**: 90 seconds

**Judges**: 3 judges, 1 laptop/screen

---

### Script

**[0:00 - 0:10] Hook**

"Applying to jobs is broken. People spend 3 hours per application and still get rejected by ATS bots 75% of the time. HustlerAI fixes this in under 60 seconds."

---

**[0:10 - 0:25] JD Analysis**

*[Paste a Senior PM job description]*

"Watch this: I paste any job description—let's use this Senior PM role at Acme Corp."

*[Click "Analyze"]*

"In 2 seconds, HustlerAI analyzes the JD, extracts top skills, identifies must-haves, and shows me a match score: 87 out of 100."

*[Point to Match Score Card, Salary Fit Card]*

"It also tells me the salary range—$120K to $160K—and that this role would give me a 35% salary lift."

---

**[0:25 - 0:45] Tailored Resume**

*[Click "Tailor Resume"]*

"Now, one click to generate a tailored, ATS-optimized resume."

*[Show live preview]*

"Here's the magic: HustlerAI automatically rewrites my top bullets to include JD keywords—'product strategy,' 'roadmap,' 'agile'—without faking anything."

*[Point to Must-Have Matrix]*

"This matrix proves I meet every requirement. 5 years PM experience? Check. B2B SaaS? Check."

*[Point to ATS Checklist]*

"ATS Checklist: single column, approved fonts, 9 out of 10 keywords present. Perfect."

---

**[0:45 - 1:00] STAR Answers + Extension**

*[Click "STAR Answers"]*

"It even generates interview answers using the STAR framework, tailored to this role."

*[Show extension demo]*

"But here's where it gets really powerful: I install the Chrome extension, go to the actual Greenhouse job posting, click the HustlerAI icon..."

*[Extension autofills form]*

"...and it auto-fills my name, email, experience, and uploads the PDF. I just review and hit Submit."

---

**[1:00 - 1:15] Financial Impact**

*[Point to Career ROI card]*

"HustlerAI doesn't just save time—it shows financial impact. This role has an ROI score of $280K per hour invested because of the salary lift and skill growth."

"Instead of applying to 100 random jobs, I can prioritize the 10 that maximize my career mobility."

---

**[1:15 - 1:30] Close**

"HustlerAI turns 3 hours of work into 60 seconds. It's built with Claude Skills—specialized AI agents for every step. It uses Gemini for smart analysis, runs on Cloudflare Workers for speed, and has a domain from GoDaddy."

"This isn't just a resume tool—it's a career optimizer that helps people land better jobs faster and earn more."

*[Show QR code on resume]*

"And by the way, every resume has a QR code linking back to a live version with all the STAR answers."

---

**[1:30] Call to Action**

"Try it yourself. Go to hustlerai.tech. Thank you."

---

## 22) APPENDIX: PROMPT LIBRARY

### JD Analysis Prompt

```
You are an expert recruiter analyzing a job description.

Extract the following information and return ONLY valid JSON:

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
  "recruiter_tldr": "1-2 sentence summary for recruiter"
}

RULES:
- Be precise with skills extraction
- Weight skills 1-10 based on emphasis in JD
- Distinguish must-haves (required) from nice-to-haves (preferred) carefully
- Seniority based on years required and scope of role
- Keywords should be nouns/skills/tools, not generic verbs
- Recruiter TL;DR should be concise and highlight role essence

JOB DESCRIPTION:
{jd_text}

Return ONLY the JSON object, no additional text.
```

---

### Bullet Rewrite Prompt

```
You are an expert resume writer. Rewrite these bullets to align with the job description while maintaining absolute truth.

APPROVED ACTION VERBS (use these to start bullets):
{action_verbs}

EXAMPLE BULLETS (for style reference):
{bullet_examples}

JD TOP KEYWORDS (integrate 1-2 per bullet):
{jd_keywords}

JD MUST-HAVES (evidence these if possible):
{must_haves}

USER BULLETS TO REWRITE:
{user_bullets}

STRICT RULES:
1. Start each bullet with a strong action verb from the approved list
2. Naturally integrate 1-2 JD keywords per bullet
3. Keep quantified results EXACTLY as provided - NEVER invent metrics
4. If a bullet lacks a metric, add [ADD METRIC] placeholder
5. Each bullet must be 60-120 characters (single line)
6. Maintain domain truth - don't fabricate achievements or exaggerate
7. Use past tense for completed roles, present tense for current role

EXAMPLE:

Input bullet:
"Built a web app for inventory management"

JD keywords: ["React", "reduced", "tracking", "efficiency"]

Output bullet:
"Developed React-based inventory tracking system that reduced manual entry time by [ADD METRIC]%, increasing warehouse efficiency"

Now rewrite the bullets above. Return ONLY JSON in this exact format:
{
  "rewritten": [
    "Rewritten bullet 1",
    "Rewritten bullet 2",
    ...
  ],
  "keyword_hits": {
    "keyword1": 3,
    "keyword2": 2,
    ...
  }
}

No additional commentary.
```

---

### STAR Generation Prompt

```
You are a career coach preparing a candidate for behavioral interviews.

ROLE: {jd_title} at {jd_company}

JD MUST-HAVES:
{must_haves}

JD TOP SKILLS:
{top_skills}

CANDIDATE EXPERIENCE (use ONLY this information):
{user_experience_bullets}

Generate 5 STAR behavioral interview answers tailored to this role.

STRICT RULES:
1. Each answer must be ≤ 120 words total
2. Format: S (Situation), T (Task), A (Action), R (Result) - clearly labeled
3. Integrate 1-2 JD keywords naturally in Action section
4. Use ONLY real experiences from candidate's profile - never fabricate
5. Quantify results when possible; if metrics unavailable, use [ADD METRIC]
6. Keep tone professional but conversational
7. Ensure clear cause-effect relationship between Action and Result

EXAMPLE OUTPUT:

{
  "answers": [
    {
      "question": "Tell me about a time you led a cross-functional project",
      "star": {
        "situation": "At TechCo, our Q3 product launch was delayed due to design-eng misalignment (Sept 2023).",
        "task": "I was tasked with aligning both teams on a unified 6-week sprint timeline.",
        "action": "I facilitated 3 design sprints using Figma, created a shared Jira board with daily standups, and implemented agile ceremonies. Leveraged my product strategy skills to align priorities.",
        "result": "Delivered launch 2 weeks ahead of schedule, improved cross-team satisfaction from 6.2 to 8.5, shipped 4 features that drove 35% engagement increase."
      },
      "keywords_used": ["cross-functional", "agile", "product strategy"]
    }
  ]
}

Now generate 5 STAR answers. Return ONLY the JSON array, no additional text.
```

---

### ATS Validation Prompt (for edge cases)

```
You are an ATS compliance expert. Review this resume content and identify any issues.

RESUME CONTENT:
{resume_text}

ATS RULES:
- Single column layout only
- No tables, text boxes, images, or graphics
- Approved fonts: Arial, Calibri, Helvetica, Times New Roman
- Body text: 10.5-11.5pt
- Standard section headings: Experience, Education, Skills
- Keywords naturally integrated (not stuffed)
- 1 page maximum

Return JSON:
{
  "issues": [
    "Issue 1",
    "Issue 2"
  ],
  "warnings": [
    "Warning 1"
  ],
  "compliant": true/false
}
```

---

## 🚀 READY FOR CLAUDE CODE

This PRD is now complete and ready to be pasted directly into Claude Code. 

**Next Steps:**

1. **Paste this entire PRD into Claude Code**
2. **Run**: "Initialize the HustlerAI project following the PRD. Start with repository setup and knowledge base processing."
3. **Claude will**:
   - Create all directory structures
   - Initialize Claude Skills in `.claude/skills/`
   - Set up Next.js with TypeScript and Tailwind
   - Process knowledge base PDFs
   - Scaffold API routes
   - Build UI components step-by-step
   - Create Chrome extension
   - Deploy to Vercel + Cloudflare

**Total Implementation Time**: ~24 hours of focused work

---

**Key Features of This PRD:**

✅ **Agent-First Architecture**: Every major component is a Claude Skill
✅ **Industry Standards**: TypeScript, testing, CI/CD, clean architecture
✅ **Knowledge-Grounded**: All outputs based on reference PDFs
✅ **Production-Ready**: Security, privacy, error handling, monitoring
✅ **Hackathon-Optimized**: Clear timeline, demo script, sponsor integrations

---

**Let's build something amazing.** 🚀
