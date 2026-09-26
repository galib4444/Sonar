# HustlerAI — Ultimate Product Requirements Document (PRD) v2.0

**Version**: 2.0 (Simplify-Inspired UX + Claude Skills Architecture)  
**Owner**: Project owner  
**Built With**: Claude Skills (Agent-First Architecture)  
**Tracks**: Best Financial Hack, Best Use of Gemini API, Best AI App Built with Cloudflare, Best Domain Name (GoDaddy)

---

## 🎯 EXECUTIVE SUMMARY

**HustlerAI** is a financial-first AI career optimizer that helps job seekers maximize income mobility. Unlike generic application tools, HustlerAI combines Simplify's seamless UX with unique career intelligence: salary ROI scoring, STAR interview prep, and financial impact analysis—helping users apply smarter, not just faster.

**Core Innovation**: Extension-first architecture with Claude Skills agents that automatically tracks applications, optimizes resumes for ATS, and shows financial impact of every opportunity.

**Key Differentiator**: While Simplify helps you apply faster, **HustlerAI helps you earn more** by prioritizing high-ROI roles and preparing you to win them.

---

## 📋 KEY LEARNINGS FROM SIMPLIFY

### What Simplify Does Well (Adopt):
1. ✅ **Extension-first UX** - Seamless integration into job search flow
2. ✅ **Auto-save applications** - No manual tracking required
3. ✅ **Visual analytics** - Application stats and insights
4. ✅ **Resume score** - Clear 0-100 score with breakdown
5. ✅ **Keyword highlighting** - Visual keyword coverage
6. ✅ **1-click autofill** - Frictionless application experience
7. ✅ **Bookmarking** - Save jobs for later
8. ✅ **Social proof** - Real testimonials with names/companies

### What HustlerAI Does Better (Differentiate):
1. 🚀 **Financial Intelligence** - Salary ROI, income mobility tracking
2. 🚀 **Interview Prep** - STAR answers automatically generated
3. 🚀 **Must-Have Matrix** - Explicit requirement-to-evidence mapping
4. 🚀 **Deep JD Analysis** - Seniority fit, skill gap analysis
5. 🚀 **Recruiter TL;DR** - Auto-generated resume pitch
6. 🚀 **Knowledge-Grounded** - Based on proven resume frameworks
7. 🚀 **Career Strategy** - Prioritize by financial impact, not just ease

---

## 📋 TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Competitive Analysis](#2-competitive-analysis)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Feature Requirements](#5-feature-requirements)
6. [User Flows (Simplify-Inspired)](#6-user-flows-simplify-inspired)
7. [Claude Skills Architecture](#7-claude-skills-architecture)
8. [Agent System Design](#8-agent-system-design)
9. [Repository Structure](#9-repository-structure)
10. [Tech Stack](#10-tech-stack)
11. [Knowledge Base System](#11-knowledge-base-system)
12. [API Design](#12-api-design)
13. [Algorithms & Scoring](#13-algorithms--scoring)
14. [Data Models](#14-data-models)
15. [ATS Compliance Rules](#15-ats-compliance-rules)
16. [Chrome Extension Architecture](#16-chrome-extension-architecture)
17. [Job Tracker System](#17-job-tracker-system)
18. [Analytics & Insights](#18-analytics--insights)
19. [Security & Privacy](#19-security--privacy)
20. [Testing Strategy](#20-testing-strategy)
21. [Deployment Strategy](#21-deployment-strategy)
22. [Development Workflow](#22-development-workflow)
23. [Implementation Timeline](#23-implementation-timeline)
24. [Demo Script](#24-demo-script)
25. [Appendix: Prompt Library](#25-appendix-prompt-library)

---

## 1) PRODUCT VISION

### One-Liner
**HustlerAI** is your financial-first AI copilot that turns any job post into a complete application package with salary ROI insights, ATS-optimized resumes, and interview prep—in under 60 seconds.

### Vision Statement
Democratize financial mobility by making world-class career optimization available to everyone. While other tools help you apply faster, HustlerAI helps you **earn more** by showing which roles maximize income growth and preparing you to win them.

### Positioning vs. Simplify

| Feature | Simplify | HustlerAI |
|---------|----------|-----------|
| **Core Value** | Apply faster | **Earn more** |
| **Primary Focus** | Autofill & track | **Financial intelligence** |
| **Resume Optimization** | Keyword matching | Keyword + **requirement mapping** |
| **Interview Prep** | ❌ None | ✅ **STAR answers** |
| **Financial Insights** | ❌ None | ✅ **Salary ROI, career mobility** |
| **Resume Output** | Score only | **PDF + Recruiter TL;DR** |
| **Decision Support** | Apply to all | **Prioritize by ROI** |

### Success Definition
- **TTV**: < 60 seconds from job detection → optimized application
- **Financial Impact**: Users increase average accepted salary by 15%+
- **Interview Success**: 3x more interview invitations vs. generic applications
- **Scale**: 10,000+ applications in first month

---

## 2) COMPETITIVE ANALYSIS

### Direct Competitors

#### **Simplify (Primary Competitor)**

**Strengths:**
- Massive scale (200M+ applications, 1M+ users)
- Excellent extension UX (seamless autofill)
- Auto-tracking across many ATS platforms
- Strong social proof and testimonials
- Free tier with good functionality

**Weaknesses:**
- ❌ No financial intelligence or ROI analysis
- ❌ No interview preparation features
- ❌ Resume scoring only (no PDF generation)
- ❌ No requirement-to-evidence mapping
- ❌ No career strategy/prioritization guidance

**HustlerAI's Advantage:**
- Financial-first positioning (salary ROI)
- Built-in STAR interview prep
- Complete application package (PDF + prep)
- Strategic job prioritization by earning potential

---

#### **Resume.io / Zety / Novoresume**

**Strengths:**
- Beautiful resume templates
- Easy-to-use builders
- Export to PDF

**Weaknesses:**
- ❌ Not ATS-focused
- ❌ No job-specific tailoring
- ❌ No autofill or application tracking
- ❌ Generic, not intelligent

**HustlerAI's Advantage:**
- ATS-first design
- Job-specific optimization
- Full application workflow (not just resume)

---

#### **Teal / Huntr**

**Strengths:**
- Job tracking
- Resume builders
- Chrome extensions

**Weaknesses:**
- ❌ Limited AI intelligence
- ❌ No financial insights
- ❌ No interview prep
- ❌ Clunky UX compared to Simplify

**HustlerAI's Advantage:**
- Simplify-quality UX + financial intelligence
- Claude Skills architecture (smarter AI)
- Interview prep built-in

---

### Market Positioning

```
              High Financial Intelligence
                        ↑
                        |
                   HUSTLERAI 🚀
                   (We are here)
                        |
        ←───────────────┼───────────────→
    Slow/Manual         |        Fast/Automated
                        |
                    Simplify
                  (Fast but no $)
                        |
                        ↓
              Low Financial Intelligence
```

**Tagline**: "Apply smarter. Earn more."

---

## 3) GOALS & SUCCESS METRICS

### MVP Goals

#### Functional Goals
1. ✅ **Extension-First UX**: Install extension → automatically detect jobs → 1-click optimize
2. ✅ **Auto-Tracking**: Every application auto-saved with full context
3. ✅ **Financial Intelligence**: Salary ROI, career mobility scoring
4. ✅ **ATS-Perfect Resume**: One-page PDF with recruiter TL;DR
5. ✅ **Interview Prep**: 5 STAR answers per application
6. ✅ **Visual Analytics**: Application stats, success rates, financial projections
7. ✅ **Autofill & Apply**: One-click autofill across major ATS platforms
8. ✅ **Job Bookmarking**: Save interesting jobs for later

#### Technical Goals
1. ✅ **Claude Skills Architecture**: All components as autonomous agents
2. ✅ **< 3s Response Time**: Fast enough for seamless UX
3. ✅ **Multi-ATS Support**: Greenhouse, Lever, Workday, Ashby (top 4)
4. ✅ **Knowledge-Grounded**: All outputs based on reference materials
5. ✅ **Production-Ready**: CI/CD, monitoring, error handling

### Success Metrics

#### User Metrics
- **Extension Installs**: > 1,000 in first week
- **Applications Tracked**: > 10,000 in first month
- **Resume Downloads**: > 5,000 in first week
- **Daily Active Users**: > 500 after 2 weeks

#### Quality Metrics
- **ATS Compliance**: 100% pass rate
- **Match Score Accuracy**: Correlates with interview rates
- **Financial Projection Accuracy**: ± 15% of actual salaries
- **User Satisfaction**: > 4.5/5 stars on Chrome store

#### Business Metrics
- **Wow Factor**: Judges see complete demo in 90 seconds
- **Sponsor Integration**: All 4 sponsors integrated
- **Media Coverage**: Featured on Product Hunt / Hacker News

### Anti-Goals (Out of Scope for MVP)

- ❌ Job search marketplace (not competing with LinkedIn/Indeed)
- ❌ Multi-page resumes or design templates
- ❌ User accounts with authentication (ephemeral only for MVP)
- ❌ Mobile apps (web + extension only)
- ❌ Real-time salary APIs (static dataset is fine)

---

## 4) USER PERSONAS

### Primary Persona: Career-Savvy Student

**Name**: Alex (22, Recent CS Graduate)

**Quote**: *"I want to know which jobs will actually advance my career, not just which ones are easy to apply to."*

**Demographics**:
- New grad or < 2 years experience
- Applying to 50-100 jobs
- Budget-conscious
- Salary-focused (student loans)

**Goals**:
- Land first high-paying job
- Maximize starting salary
- Build resume efficiently
- Track all applications

**Pain Points**:
- "I waste time applying to low-quality jobs"
- "I don't know how to tailor my resume"
- "I never hear back—am I doing something wrong?"
- "Which jobs should I prioritize?"

**How HustlerAI Helps**:
- **Financial ROI**: See which jobs offer best salary growth
- **Auto-Optimization**: Tailored resume in 60 seconds
- **Interview Prep**: STAR answers ready to go
- **Strategic Tracking**: Prioritize by earning potential

---

### Secondary Persona: Career Switcher

**Name**: Jamie (32, Switching to Tech)

**Quote**: *"I need to translate my experience and maximize my new career's earning potential."*

**Demographics**:
- 5-10 years in different field
- Bootcamp grad or self-taught
- Family to support
- Time-constrained (has current job)

**Goals**:
- Show transferable skills
- Overcome "no experience" perception
- Maximize career ROI
- Apply efficiently (limited time)

**Pain Points**:
- "How do I make retail experience relevant?"
- "I don't have the keywords they want"
- "Applications take 3+ hours each"
- "Am I taking a pay cut to switch?"

**How HustlerAI Helps**:
- **Keyword Translation**: AI rewrites bullets with relevant terms
- **Salary Comparison**: See if role is worth the switch
- **Efficiency**: 60-second applications
- **Evidence Mapping**: Shows how experience matches requirements

---

### Tertiary Persona: Recruiter/Judge (Demo Audience)

**Name**: Sam (38, Technical Recruiter)

**Quote**: *"Show me you understand the role and can do the job."*

**Goals**:
- Quickly assess candidate fit
- See relevant experience
- Verify ATS compatibility
- Identify standout candidates

**How HustlerAI Helps**:
- **Recruiter TL;DR**: 3-line executive summary
- **Must-Have Matrix**: Explicit requirement matching
- **ATS Verified**: Guaranteed compatibility
- **Professional Output**: Clean, scannable resume

---

## 5) FEATURE REQUIREMENTS

### 5.1) Chrome Extension (Primary Interface)

**Inspiration**: Simplify's seamless 1-click experience

**Purpose**: Detect jobs, autofill applications, track everything automatically.

**Supported Platforms (MVP)**:
- ✅ Greenhouse (boards.greenhouse.io)
- ✅ Lever (jobs.lever.co)
- ✅ Workday (*.myworkdayjobs.com)
- ✅ Ashby (jobs.ashbyhq.com)

**User Flow**:
1. User installs extension
2. User browses jobs naturally (LinkedIn, Indeed, company sites)
3. Extension icon shows badge when job detected
4. User clicks extension icon
5. Popup shows: "Senior PM @ Acme Corp detected. Optimize & Apply?"
6. User clicks "Optimize"
7. Extension:
   - Analyzes JD (2 seconds)
   - Shows Match Score + Salary ROI
   - Generates optimized resume
   - Offers to autofill form
8. User clicks "Autofill & Apply"
9. Extension fills all fields + uploads PDF
10. Application auto-saved to dashboard
11. User clicks "Submit" (extension doesn't auto-submit)

**Features**:
- **Auto-Detection**: Detect jobs on any ATS platform
- **Badge Notifications**: Show when job detected
- **Quick Actions**: Bookmark, optimize, autofill
- **Keyboard Shortcuts**: `Cmd+Shift+H` to trigger
- **Offline Mode**: Works with cached data

---

### 5.2) Dashboard (Web App)

**Inspiration**: Simplify's clean tracker interface

**Purpose**: Central hub for tracking applications, viewing analytics, managing strategy.

**Pages**:

#### A) **Home Dashboard**
- **Applications Overview**: Cards view or table view
- **Stats**: Total applied, interview invites, average match score
- **Financial Tracking**: Total potential earnings, ROI by application
- **Quick Actions**: Bookmark job, bulk edit status

#### B) **Job Tracker**
```
┌─────────────────────────────────────────────────────────────┐
│  Filters: [Status ▼] [Company ▼] [Salary ▼] [Match Score ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Applications: 47  |  💼 Interviews: 8  |  💰 Avg ROI: $145K │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Role              Company    Match  Salary     Status  ROI │
│  ──────────────────────────────────────────────────────────│
│  Senior PM         Acme       87%    $140K      Applied  🔥  │
│  Product Manager   TechCo     82%    $125K      Phone     ⭐  │
│  PM                StartupX   91%    $110K      Offer     🎉  │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- **Auto-Save**: Every application automatically tracked
- **Status Tracking**: Applied → Phone → Onsite → Offer → Rejected
- **Notes**: Interview notes, recruiter contacts, follow-ups
- **Reminders**: Auto-generate follow-up dates
- **Bulk Actions**: Update status, export, delete
- **Search/Filter**: By company, role, salary, match score

#### C) **Analytics Page**
- **Application Funnel**: Visual funnel (applied → interview → offer)
- **Match Score vs. Success**: Scatter plot showing correlation
- **Financial Projections**: Total potential earnings
- **Time Saved**: Hours saved vs. manual applications
- **Success Rate**: Interview rate by match score bracket

#### D) **Bookmarks**
- **Saved Jobs**: Jobs bookmarked for later
- **Quick Apply**: Apply to bookmarked job in 1 click

#### E) **Settings**
- **Profile**: Name, contact, resume baseline
- **Preferences**: Auto-apply threshold, notification settings
- **Integrations**: API keys, export options

---

### 5.3) JD Analyzer (Gemini Agent)

**Same as PRD v1.0** - No changes needed.

**Outputs**:
- Match Score (0-100)
- Skills extracted (ranked)
- Must-haves vs. nice-to-haves
- Salary range + ROI score
- Keyword analysis
- Seniority fit

---

### 5.4) Resume Generator (Multi-Agent)

**Enhancement**: Add visual resume score like Simplify

**Process**:
1. Analyze JD
2. Score existing resume bullets
3. Rewrite top bullets with keywords
4. Generate ATS-compliant PDF
5. Show visual score breakdown

**Resume Score Visualization**:
```
┌────────────────────────────────────┐
│  Your Resume Score: 87/100    ⭐⭐⭐⭐  │
├────────────────────────────────────┤
│  ✓ ATS Compliance      100/100     │
│  ✓ Keyword Coverage     85/100     │
│  ⚠ Quantified Results   70/100     │
│  ✓ Must-Have Match      95/100     │
├────────────────────────────────────┤
│  [View Optimization Tips]          │
└────────────────────────────────────┘
```

**Features**:
- **Live Preview**: See changes in real-time
- **Keyword Highlighting**: Visual keyword coverage
- **ATS Checklist**: Green checkmarks for compliance
- **Must-Have Matrix**: Requirement-to-evidence mapping
- **Recruiter TL;DR**: Auto-generated pitch
- **One-Click Download**: PDF with QR code

---

### 5.5) STAR Interview Prep

**Same as PRD v1.0** - No changes needed.

**Enhancement**: Add to dashboard view

**Features**:
- Generate 5 STAR answers per application
- Save to application record
- Export to text/PDF
- Practice mode (optional: voice playback)

---

### 5.6) Financial Intelligence (Unique Differentiator)

**Purpose**: Show salary ROI and career mobility for every opportunity.

**Components**:

#### A) **Salary Fit Card**
```
┌────────────────────────────────────┐
│  💰 Salary Fit                     │
├────────────────────────────────────┤
│  Role Range: $120K - $160K         │
│  Your Current: $100K               │
│  Potential Lift: +20% to +60%      │
│  Market Percentile: 65th           │
│                                     │
│  [$120K ●━━━━━━━━━━━━━━● $160K]    │
│         You: ↑                      │
└────────────────────────────────────┘
```

#### B) **Career ROI Score**
```
ROI Score = (Avg Salary × Match Score × Skill Factor) ÷ Est. App Time

Example:
  Avg Salary: $140K
  Match Score: 87% (0.87)
  Skill Factor: 1.15 (will learn 3 new skills)
  App Time: 0.5 hours (with HustlerAI)
  
  ROI = ($140K × 0.87 × 1.15) ÷ 0.5 = $280K per hour invested 🔥
```

#### C) **Career Mobility Tracker**
```
┌────────────────────────────────────┐
│  📈 Career Trajectory              │
├────────────────────────────────────┤
│  Current: $100K (PM, 3 years)      │
│  Target: $140K (Senior PM)         │
│  Gap: $40K (+40%)                  │
│                                     │
│  New Skills to Acquire:             │
│  • Product Strategy                 │
│  • Roadmap Planning                 │
│  • Cross-functional Leadership      │
│                                     │
│  Time to Role: 12-18 months         │
└────────────────────────────────────┘
```

#### D) **Application Prioritization**
Sort tracked applications by:
1. **ROI Score** (highest earning potential per time invested)
2. **Match Score** (best fit)
3. **Salary** (highest paying)
4. **Skill Growth** (most new skills to learn)

---

### 5.7) Job Bookmarking

**Inspiration**: Simplify's save-for-later feature

**Features**:
- **Quick Save**: Bookmark job from extension popup
- **Organize**: Tags, folders (optional)
- **Apply Later**: When ready, 1-click to apply
- **Expiration Tracking**: Warning if job posting closing soon

---

### 5.8) Follow-Up System

**New Feature (Inspired by Simplify)**

**Purpose**: Auto-generate follow-up emails to recruiters.

**Triggers**:
- 1 week after application (no response)
- 3 days after interview
- Post-rejection (request feedback)

**Example**:
```
Subject: Following up on Senior PM application

Hi [Recruiter Name],

I wanted to follow up on my application for the Senior Product Manager 
role at Acme Corp submitted on [Date]. I'm very excited about the 
opportunity to bring my 6 years of B2B SaaS experience to your team.

I'd love to discuss how my background in product strategy and 
cross-functional leadership aligns with your needs.

Would you have 15 minutes for a brief call this week?

Best regards,
Alex Johnson
```

**Features**:
- Auto-generate based on application context
- Customize before sending
- Track send dates

---

## 6) USER FLOWS (SIMPLIFY-INSPIRED)

### Flow A: First-Time User (Extension Install → First Application)

**Goal**: Go from install to first optimized application in < 2 minutes.

```
1. [User installs extension from Chrome Web Store]
   ↓
2. [Onboarding: "Welcome! Let's optimize your first application."]
   ↓
3. [User fills basic profile: name, email, current role, salary]
   ↓
4. [Extension: "Great! Now browse to any job posting."]
   ↓
5. [User navigates to Greenhouse job]
   ↓
6. [Extension badge shows "1" - job detected]
   ↓
7. [User clicks extension icon]
   ↓
8. [Popup shows:
    "Senior PM @ Acme Corp
     Match: 87% | Salary: $120-160K | ROI: $280K/hr
     [Optimize & Apply]"]
   ↓
9. [User clicks "Optimize & Apply"]
   ↓
10. [Loading: "Analyzing JD... Optimizing resume... Generating STAR answers..."]
    ↓
11. [Success screen:
     "✓ Resume optimized (87/100 score)
      ✓ 5 STAR answers ready
      ✓ Application autofilled
      
      [Review Resume] [View STAR Answers] [Submit Application]"]
    ↓
12. [User clicks "Submit Application"]
    ↓
13. [Extension: "Application submitted! Saved to your dashboard."]
    ↓
14. [Done! Application tracked, ready for next job.]
```

**Time**: < 2 minutes from install to submit

---

### Flow B: Experienced User (Daily Use)

**Goal**: Apply to 5 jobs in 15 minutes.

```
1. [User browses LinkedIn job board]
   ↓
2. [Extension detects 3 jobs, badge shows "3"]
   ↓
3. [User clicks on first job]
   ↓
4. [Quick popup shows: "Match: 82% | $125K | [Apply]"]
   ↓
5. [User clicks "Apply" → autofills → submits in 30 seconds]
   ↓
6. [Repeat for jobs 2-5]
   ↓
7. [15 minutes later: 5 applications submitted, all tracked]
```

---

### Flow C: Strategic User (Prioritize by ROI)

**Goal**: Review applications, prioritize high-ROI opportunities.

```
1. [User opens dashboard]
   ↓
2. [Sees 47 tracked applications]
   ↓
3. [Sorts by "ROI Score" (descending)]
   ↓
4. [Top 3 jobs:
    - Senior PM @ Acme: $280K ROI, 87% match
    - Staff PM @ TechCo: $310K ROI, 91% match
    - PM @ StartupX: $180K ROI, 78% match]
   ↓
5. [User focuses on Staff PM @ TechCo (highest ROI)]
   ↓
6. [Clicks "View Details"]
   ↓
7. [Sees: Match breakdown, STAR answers, follow-up due date]
   ↓
8. [Clicks "Generate Follow-Up Email"]
   ↓
9. [Reviews AI-generated email, edits, sends]
   ↓
10. [Status updated: "Follow-up sent"]
```

---

### Flow D: Bookmark → Apply Later

**Goal**: Save interesting jobs, apply when ready.

```
1. [User browsing Greenhouse, finds interesting PM role]
   ↓
2. [Not ready to apply yet]
   ↓
3. [Clicks extension → "Bookmark Job"]
   ↓
4. [Job saved to "Bookmarks" with expiration warning if closing soon]
   ↓
5. [Later: User opens dashboard → "Bookmarks" tab]
   ↓
6. [Clicks job → "Apply Now"]
   ↓
7. [Standard optimize → autofill → submit flow]
```

---

## 7) CLAUDE SKILLS ARCHITECTURE

**Same as PRD v1.0** with additions:

### Additional Skills Needed:

```
hustler-ai/
└── .claude/skills/
    ├── orchestrator-skill
    ├── knowledge-processor-skill
    ├── jd-analyzer-skill
    ├── bullet-rewriter-skill
    ├── ats-validator-skill
    ├── pdf-generator-skill
    ├── star-generator-skill
    ├── match-scorer-skill
    ├── extension-builder-skill
    ├── api-builder-skill
    ├── testing-skill
    ├── deployment-skill
    │
    ├── job-tracker-skill        ← NEW
    ├── analytics-skill           ← NEW
    ├── follow-up-skill           ← NEW
    ├── bookmark-skill            ← NEW
    └── financial-scorer-skill    ← NEW (expanded from match-scorer)
```

---

### 7.1) job-tracker-skill

**Responsibility**: Manage application lifecycle tracking and status updates.

**Inputs**:
```typescript
interface JobTrackerInput {
  action: 'save' | 'update' | 'delete' | 'list' | 'search';
  application?: ApplicationRecord;
  filters?: {
    status?: ApplicationStatus[];
    company?: string;
    min_match_score?: number;
    min_salary?: number;
    date_range?: { start: Date; end: Date };
  };
}
```

**Outputs**:
```typescript
interface JobTrackerOutput {
  applications: ApplicationRecord[];
  stats: {
    total: number;
    by_status: Record<ApplicationStatus, number>;
    avg_match_score: number;
    total_potential_earnings: number;
  };
}
```

**Features**:
- Auto-save applications from extension
- Update status (applied → phone → onsite → offer)
- Track recruiter contacts and notes
- Generate follow-up reminders
- Search and filter

**SKILL.md Location**: `.claude/skills/job-tracker/SKILL.md`

---

### 7.2) analytics-skill

**Responsibility**: Generate insights and visualizations from application data.

**Inputs**:
```typescript
interface AnalyticsInput {
  user_id: string;
  time_range?: { start: Date; end: Date };
  metric_type: 'funnel' | 'success_rate' | 'financial' | 'time_saved';
}
```

**Outputs**:
```typescript
interface AnalyticsOutput {
  funnel?: {
    applied: number;
    phone_screen: number;
    onsite: number;
    offer: number;
  };
  success_rate?: {
    by_match_score: Array<{ score_range: string; interview_rate: number }>;
    by_company_size: Array<{ size: string; success_rate: number }>;
  };
  financial?: {
    total_potential_earnings: number;
    avg_salary_target: number;
    highest_offer: number;
  };
  time_saved?: {
    hours_saved: number;
    avg_time_per_app: number;
  };
}
```

**Visualizations**:
- Application funnel chart
- Match score vs. success scatter plot
- Financial projections bar chart
- Time saved counter

**SKILL.md Location**: `.claude/skills/analytics/SKILL.md`

---

### 7.3) follow-up-skill

**Responsibility**: Generate personalized follow-up emails for recruiters.

**Inputs**:
```typescript
interface FollowUpInput {
  application: ApplicationRecord;
  follow_up_type: 'post_application' | 'post_interview' | 'post_rejection';
  days_since_last_contact: number;
}
```

**Outputs**:
```typescript
interface FollowUpOutput {
  email: {
    subject: string;
    body: string;
    to: string; // Recruiter email
  };
  suggested_send_date: Date;
}
```

**Gemini Prompt**:
```
Generate a professional follow-up email.

Application Context:
- Role: {role_title}
- Company: {company}
- Applied: {date_applied}
- Last Contact: {days_ago} days ago
- Match Score: {match_score}%

User Profile:
- Name: {name}
- Top Skills: {skills}
- Years Experience: {years}

Follow-Up Type: {type}

Rules:
- Professional but warm tone
- Reference specific details (role, company)
- Highlight 1-2 relevant qualifications
- Clear call-to-action (request call, update)
- Keep under 150 words
- Subject line should be compelling

Return JSON:
{
  "subject": "...",
  "body": "..."
}
```

**SKILL.md Location**: `.claude/skills/follow-up/SKILL.md`

---

### 7.4) bookmark-skill

**Responsibility**: Manage bookmarked jobs for future application.

**Inputs**:
```typescript
interface BookmarkInput {
  action: 'save' | 'remove' | 'list';
  job?: {
    title: string;
    company: string;
    url: string;
    jd_text: string;
    posted_date: Date;
    closing_date?: Date;
  };
}
```

**Outputs**:
```typescript
interface BookmarkOutput {
  bookmarks: Array<{
    id: string;
    job: JobInfo;
    saved_date: Date;
    days_until_closing?: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}
```

**Features**:
- Save jobs from any page
- Track expiration dates
- Priority ranking
- Bulk apply

**SKILL.md Location**: `.claude/skills/bookmark/SKILL.md`

---

### 7.5) financial-scorer-skill (Enhanced)

**Responsibility**: Calculate comprehensive financial metrics for each opportunity.

**Inputs**:
```typescript
interface FinancialScorerInput {
  job: JobInfo;
  user_profile: UserProfile;
  match_score: number;
}
```

**Outputs**:
```typescript
interface FinancialScorerOutput {
  roi_score: number; // Earnings per hour invested
  salary_fit: {
    role_range: { low: number; high: number };
    user_current: number;
    potential_lift_pct: number;
    market_percentile: number;
  };
  skill_growth: {
    new_skills: string[];
    growth_factor: number;
  };
  career_trajectory: {
    current_level: string;
    target_level: string;
    time_to_target_months: number;
  };
  priority_score: number; // 0-100 overall priority
}
```

**Priority Score Algorithm**:
```typescript
Priority = (
  0.40 × ROI Score (normalized) +
  0.30 × Match Score +
  0.20 × Skill Growth Factor +
  0.10 × Company Brand Score
)
```

**SKILL.md Location**: `.claude/skills/financial-scorer/SKILL.md`

---

## 8) AGENT SYSTEM DESIGN

Same as PRD v1.0 with expansions for new skills. Key addition:

### Extended Orchestrator Workflow

```typescript
async function handleJobDetection(jobUrl: string, user: UserProfile) {
  // Step 1: Extract JD
  const jdText = await invoke('extension', 'extractJD', { url: jobUrl });
  
  // Step 2: Analyze JD
  const jdInsights = await invoke('jd-analyzer', 'parse', { jd_text: jdText });
  
  // Step 3: Calculate financial metrics
  const financialMetrics = await invoke('financial-scorer', 'calculate', {
    job: jdInsights,
    user_profile: user,
    match_score: 0 // Will be calculated next
  });
  
  // Step 4: Calculate match score
  const matchScore = await invoke('match-scorer', 'calculate', {
    user_profile: user,
    jd_insights: jdInsights
  });
  
  // Step 5: Show decision card to user
  return {
    job: jdInsights,
    match_score: matchScore,
    financial: financialMetrics,
    actions: ['bookmark', 'optimize', 'skip']
  };
}

async function handleOptimizeAndApply(
  job: JDInsights,
  user: UserProfile
) {
  // Parallel execution for speed
  const [resume, starAnswers] = await Promise.all([
    invoke('resume-generator', 'create', { user_profile: user, jd_insights: job }),
    invoke('star-generator', 'generate', { user_profile: user, jd_insights: job })
  ]);
  
  // Save to tracker
  await invoke('job-tracker', 'save', {
    application: {
      job: job,
      resume: resume,
      star_answers: starAnswers,
      status: 'ready_to_submit',
      created_at: new Date()
    }
  });
  
  return { resume, starAnswers };
}
```

---

## 9) REPOSITORY STRUCTURE

**Updated structure** with new components:

```
hustler-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       ├── deploy-workers.yml
│       └── deploy-extension.yml
│
├── .claude/
│   └── skills/
│       ├── orchestrator/
│       ├── knowledge-processor/
│       ├── jd-analyzer/
│       ├── bullet-rewriter/
│       ├── ats-validator/
│       ├── pdf-generator/
│       ├── star-generator/
│       ├── match-scorer/
│       ├── financial-scorer/      ← NEW
│       ├── job-tracker/            ← NEW
│       ├── analytics/              ← NEW
│       ├── follow-up/              ← NEW
│       ├── bookmark/               ← NEW
│       ├── extension-builder/
│       ├── api-builder/
│       ├── testing-skill/
│       └── deployment-skill/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-jd/route.ts
│   │   │   ├── tailor/route.ts
│   │   │   ├── generate-pdf/route.ts
│   │   │   ├── star/route.ts
│   │   │   ├── tracker/             ← NEW
│   │   │   │   ├── save/route.ts
│   │   │   │   ├── update/route.ts
│   │   │   │   └── list/route.ts
│   │   │   ├── analytics/route.ts   ← NEW
│   │   │   ├── follow-up/route.ts   ← NEW
│   │   │   └── bookmarks/route.ts   ← NEW
│   │   │
│   │   ├── (routes)/
│   │   │   ├── page.tsx            # Home
│   │   │   ├── dashboard/          ← NEW (main dashboard)
│   │   │   │   └── page.tsx
│   │   │   ├── tracker/            ← NEW
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/          ← NEW
│   │   │   │   └── page.tsx
│   │   │   ├── bookmarks/          ← NEW
│   │   │   │   └── page.tsx
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   └── result/
│   │   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── resume/
│   │   ├── jd/
│   │   ├── tracker/                 ← NEW
│   │   │   ├── ApplicationCard.tsx
│   │   │   ├── ApplicationTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── NotesPanel.tsx
│   │   │   └── FollowUpButton.tsx
│   │   ├── analytics/               ← NEW
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── SuccessRateChart.tsx
│   │   │   └── FinancialProjections.tsx
│   │   └── financial/               ← NEW
│   │       ├── ROICard.tsx
│   │       ├── SalaryFitCard.tsx
│   │       └── CareerTrajectory.tsx
│   │
│   ├── lib/
│   │   ├── tracker/                 ← NEW
│   │   │   ├── storage.ts
│   │   │   └── sync.ts
│   │   ├── analytics/               ← NEW
│   │   │   └── calculations.ts
│   │   └── financial/               ← NEW
│   │       └── roi-calculator.ts
│
├── extension/
│   ├── manifest.json
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── greenhouse.ts
│   │   ├── lever.ts
│   │   ├── workday.ts               ← NEW
│   │   ├── ashby.ts                 ← NEW
│   │   └── shared.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.tsx
│   │   └── components/              ← NEW
│   │       ├── JobCard.tsx
│   │       ├── ActionButtons.tsx
│   │       └── QuickStats.tsx
│
├── knowledge-base/
│   ├── raw/
│   └── processed/
│
├── public/
│   ├── demo-data/
│   └── salary-data.json
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 10) TECH STACK

Same as PRD v1.0 with additions:

### Additional Dependencies

**Data Visualization**:
- **Recharts** (charts for analytics)
- **D3.js** (advanced visualizations)

**State Management**:
- **Zustand** (lightweight state for extension + web)

**Database** (if needed beyond ephemeral):
- **Vercel KV** (Redis) for session storage
- **MongoDB Atlas** (optional for persistent tracking)

---

## 11) KNOWLEDGE BASE SYSTEM

Same as PRD v1.0 - No changes.

---

## 12) API DESIGN

### New Endpoints

#### `POST /api/tracker/save`

**Request**:
```json
{
  "application": {
    "job": {
      "title": "Senior PM",
      "company": "Acme Corp",
      "url": "https://...",
      "jd_text": "..."
    },
    "resume": {
      "pdf_url": "...",
      "match_score": 87
    },
    "star_answers": [...],
    "status": "applied",
    "applied_date": "2025-01-15"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "application_id": "app_abc123",
    "saved_at": "2025-01-15T10:30:00Z"
  }
}
```

---

#### `GET /api/tracker/list`

**Query Params**: `?status=applied&min_match=80&limit=50`

**Response**:
```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "id": "app_abc123",
        "job": {...},
        "match_score": 87,
        "salary_range": { "low": 120000, "high": 160000 },
        "status": "applied",
        "applied_date": "2025-01-15",
        "last_updated": "2025-01-15"
      }
    ],
    "stats": {
      "total": 47,
      "by_status": { "applied": 20, "phone": 8, "onsite": 3, "offer": 2 }
    }
  }
}
```

---

#### `POST /api/analytics`

**Request**:
```json
{
  "user_id": "user_xyz",
  "metric_type": "funnel",
  "time_range": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "funnel": {
      "applied": 47,
      "phone_screen": 12,
      "onsite": 5,
      "offer": 2
    },
    "conversion_rates": {
      "applied_to_phone": 25.5,
      "phone_to_onsite": 41.7,
      "onsite_to_offer": 40.0
    }
  }
}
```

---

#### `POST /api/follow-up`

**Request**:
```json
{
  "application_id": "app_abc123",
  "follow_up_type": "post_application"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "email": {
      "subject": "Following up on Senior PM application",
      "body": "Hi [Recruiter],\n\nI wanted to follow up...",
      "to": "recruiter@acme.com"
    },
    "suggested_send_date": "2025-01-22"
  }
}
```

---

#### `POST /api/bookmarks`

**Request**:
```json
{
  "action": "save",
  "job": {
    "title": "Product Manager",
    "company": "TechCo",
    "url": "https://...",
    "jd_text": "...",
    "closing_date": "2025-02-01"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "bookmark_id": "bm_xyz789",
    "days_until_closing": 15,
    "priority": "high"
  }
}
```

---

## 13) ALGORITHMS & SCORING

### 13.1) Priority Score (for Application Ranking)

```typescript
function calculatePriorityScore(
  application: ApplicationRecord
): number {
  const weights = {
    roi: 0.40,
    match: 0.30,
    skill_growth: 0.20,
    brand: 0.10
  };
  
  // Normalize ROI (0-100)
  const roiNormalized = Math.min(application.roi_score / 500000 * 100, 100);
  
  // Match score (already 0-100)
  const matchScore = application.match_score;
  
  // Skill growth (0-100)
  const skillGrowth = application.financial.skill_growth.growth_factor * 20;
  
  // Brand score (company tier)
  const brandScore = getBrandScore(application.job.company); // 0-100
  
  const priority = (
    weights.roi * roiNormalized +
    weights.match * matchScore +
    weights.skill_growth * skillGrowth +
    weights.brand * brandScore
  );
  
  return Math.round(priority);
}

function getBrandScore(company: string): number {
  // FAANG/Tier-1: 100
  // Unicorn/Hot Startup: 80
  // Established Tech: 60
  // Other: 40
  
  const tier1 = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Netflix'];
  const tier2 = ['OpenAI', 'Stripe', 'Airbnb', 'Databricks', 'Figma'];
  
  if (tier1.some(t => company.includes(t))) return 100;
  if (tier2.some(t => company.includes(t))) return 80;
  
  return 60; // Default
}
```

---

### 13.2) Success Prediction (Interview Likelihood)

```typescript
function predictInterviewLikelihood(
  matchScore: number,
  historicalData: ApplicationRecord[]
): number {
  // Build correlation from historical data
  const scoreBuckets = {
    '90-100': { applied: 0, interviewed: 0 },
    '80-89': { applied: 0, interviewed: 0 },
    '70-79': { applied: 0, interviewed: 0 },
    '60-69': { applied: 0, interviewed: 0 }
  };
  
  for (const app of historicalData) {
    const bucket = getScoreBucket(app.match_score);
    scoreBuckets[bucket].applied++;
    if (['phone', 'onsite', 'offer'].includes(app.status)) {
      scoreBuckets[bucket].interviewed++;
    }
  }
  
  // Calculate rates
  const bucket = getScoreBucket(matchScore);
  const { applied, interviewed } = scoreBuckets[bucket];
  
  if (applied === 0) return 0.25; // Default 25% if no data
  
  return interviewed / applied;
}
```

---

## 14) DATA MODELS

### Application Record

```typescript
interface ApplicationRecord {
  id: string;
  user_id: string;
  
  // Job info
  job: {
    title: string;
    company: string;
    url: string;
    jd_text: string;
    posted_date: Date;
    closing_date?: Date;
  };
  
  // Application materials
  resume: {
    pdf_url: string;
    match_score: number;
    ats_score: number;
  };
  star_answers: STARAnswer[];
  
  // Financial metrics
  financial: {
    salary_range: { low: number; high: number };
    roi_score: number;
    priority_score: number;
    skill_growth_factor: number;
  };
  
  // Tracking
  status: ApplicationStatus;
  applied_date: Date;
  last_updated: Date;
  
  // Follow-up
  recruiter_contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  follow_ups: Array<{
    date: Date;
    type: 'email' | 'call' | 'linkedin';
    content: string;
  }>;
  
  // Notes
  notes: string;
  interview_notes?: Array<{
    date: Date;
    type: 'phone' | 'onsite' | 'final';
    notes: string;
  }>;
  
  // Outcomes
  offer?: {
    received_date: Date;
    salary: number;
    equity?: string;
    deadline: Date;
  };
  rejection?: {
    date: Date;
    reason?: string;
  };
}

type ApplicationStatus = 
  | 'bookmarked'
  | 'ready_to_submit'
  | 'applied'
  | 'phone_screen'
  | 'onsite'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';
```

---

### Bookmark Record

```typescript
interface BookmarkRecord {
  id: string;
  user_id: string;
  job: JobInfo;
  saved_date: Date;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}
```

---

### Analytics Snapshot

```typescript
interface AnalyticsSnapshot {
  user_id: string;
  time_range: { start: Date; end: Date };
  
  funnel: {
    applied: number;
    phone_screen: number;
    onsite: number;
    offer: number;
  };
  
  conversion_rates: {
    applied_to_phone: number;
    phone_to_onsite: number;
    onsite_to_offer: number;
  };
  
  financial: {
    total_potential_earnings: number;
    avg_target_salary: number;
    highest_offer?: number;
  };
  
  time_saved: {
    hours_saved: number;
    avg_time_per_app: number;
  };
  
  success_by_match_score: Array<{
    score_range: string;
    interview_rate: number;
  }>;
}
```

---

## 15) ATS COMPLIANCE RULES

Same as PRD v1.0 - No changes.

---

## 16) CHROME EXTENSION ARCHITECTURE

### Enhanced Extension with Multi-ATS Support

**manifest.json** (updated):

```json
{
  "manifest_version": 3,
  "name": "HustlerAI - Financial-First Job Copilot",
  "version": "1.0.0",
  "description": "Apply smarter, earn more. Auto-optimize resumes, track applications, and maximize salary ROI.",
  
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "notifications"
  ],
  
  "host_permissions": [
    "https://*.greenhouse.io/*",
    "https://boards.greenhouse.io/*",
    "https://*.lever.co/*",
    "https://jobs.lever.co/*",
    "https://*.myworkdayjobs.com/*",
    "https://*.wd1.myworkdayjobs.com/*",
    "https://*.wd5.myworkdayjobs.com/*",
    "https://jobs.ashbyhq.com/*",
    "https://*.ashbyhq.com/*",
    "https://linkedin.com/jobs/*",
    "https://indeed.com/viewjob/*",
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
        "https://*.lever.co/*",
        "https://jobs.lever.co/*/*"
      ],
      "js": ["content/lever.js"],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://*.myworkdayjobs.com/*"
      ],
      "js": ["content/workday.js"],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://jobs.ashbyhq.com/*",
        "https://*.ashbyhq.com/*"
      ],
      "js": ["content/ashby.js"],
      "run_at": "document_idle"
    }
  ],
  
  "web_accessible_resources": [
    {
      "resources": ["assets/*", "popup/*"],
      "matches": ["<all_urls>"]
    }
  ],
  
  "commands": {
    "trigger-optimize": {
      "suggested_key": {
        "default": "Ctrl+Shift+H",
        "mac": "Command+Shift+H"
      },
      "description": "Trigger HustlerAI optimization"
    }
  }
}
```

---

### Enhanced Popup (React)

**popup/popup.tsx**:

```typescript
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface JobDetection {
  detected: boolean;
  job?: {
    title: string;
    company: string;
    url: string;
  };
  analysis?: {
    match_score: number;
    salary_range: { low: number; high: number };
    roi_score: number;
  };
}

const Popup: React.FC = () => {
  const [state, setState] = useState<JobDetection>({ detected: false });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    detectJob();
  }, []);
  
  async function detectJob() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) return;
    
    try {
      // Check if job detected
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectJob' });
      
      if (response.detected) {
        // Quick analysis
        const analysis = await analyzeJob(response.jdText);
        
        setState({
          detected: true,
          job: response.job,
          analysis
        });
      } else {
        setState({ detected: false });
      }
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function analyzeJob(jdText: string) {
    const res = await fetch('https://hustlerai.tech/api/analyze-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text: jdText })
    });
    
    const data = await res.json();
    return {
      match_score: 85, // From match-scorer
      salary_range: data.data.salary_range,
      roi_score: 280000 // From financial-scorer
    };
  }
  
  async function handleOptimize() {
    setLoading(true);
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Trigger full optimization
    await chrome.tabs.sendMessage(tab.id!, { action: 'optimize' });
    
    setLoading(false);
  }
  
  async function handleBookmark() {
    await fetch('https://hustlerai.tech/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        job: state.job
      })
    });
    
    alert('Job bookmarked!');
  }
  
  if (loading) {
    return (
      <div className="popup w-80 p-4">
        <div className="animate-pulse">Detecting job...</div>
      </div>
    );
  }
  
  if (!state.detected) {
    return (
      <div className="popup w-80 p-4">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">No Job Detected</h3>
          <p className="text-sm text-gray-600">
            Navigate to a job posting on Greenhouse, Lever, Workday, or Ashby.
          </p>
        </div>
      </div>
    );
  }
  
  const { job, analysis } = state;
  
  return (
    <div className="popup w-96 p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold">{job!.title}</h3>
        <p className="text-sm text-gray-600">{job!.company}</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analysis!.match_score}
          </div>
          <div className="text-xs text-gray-600">Match</div>
        </div>
        
        <div className="bg-green-50 p-2 rounded text-center">
          <div className="text-sm font-bold text-green-600">
            ${(analysis!.salary_range.low / 1000).toFixed(0)}-
            {(analysis!.salary_range.high / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-600">Salary</div>
        </div>
        
        <div className="bg-purple-50 p-2 rounded text-center">
          <div className="text-sm font-bold text-purple-600">
            ${(analysis!.roi_score / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-gray-600">ROI/hr</div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleOptimize}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
        >
          Optimize & Apply
        </button>
        
        <button
          onClick={handleBookmark}
          className="w-full bg-gray-100 text-gray-700 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Bookmark for Later
        </button>
        
        <button
          onClick={() => window.open('https://hustlerai.tech/dashboard', '_blank')}
          className="w-full text-blue-600 py-2 text-sm hover:underline"
        >
          Open Dashboard →
        </button>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          HustlerAI • Apply smarter, earn more
        </p>
      </div>
    </div>
  );
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
```

---

## 17) JOB TRACKER SYSTEM

### Dashboard UI

**tracker/page.tsx**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ApplicationCard } from '@/components/tracker/ApplicationCard';
import { ApplicationTable } from '@/components/tracker/ApplicationTable';
import { StatsBar } from '@/components/tracker/StatsBar';

export default function TrackerPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [view, setView] = useState<'cards' | 'table'>('table');
  const [filters, setFilters] = useState({
    status: [],
    min_match_score: 0,
    min_salary: 0,
    sort_by: 'roi_score' // or 'applied_date', 'match_score'
  });
  
  useEffect(() => {
    loadApplications();
  }, [filters]);
  
  async function loadApplications() {
    const res = await fetch('/api/tracker/list?' + new URLSearchParams({
      status: filters.status.join(','),
      min_match: filters.min_match_score.toString(),
      sort_by: filters.sort_by
    }));
    
    const data = await res.json();
    setApplications(data.data.applications);
  }
  
  return (
    <div className="container mx-auto p-6">
      {/* Stats Bar */}
      <StatsBar applications={applications} />
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.sort_by}
          onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="roi_score">Sort by ROI</option>
          <option value="match_score">Sort by Match Score</option>
          <option value="applied_date">Sort by Date</option>
          <option value="salary">Sort by Salary</option>
        </select>
        
        <select
          onChange={(e) => {
            const statuses = Array.from(e.target.selectedOptions, opt => opt.value);
            setFilters({ ...filters, status: statuses });
          }}
          multiple
          className="border rounded px-3 py-2"
        >
          <option value="applied">Applied</option>
          <option value="phone_screen">Phone Screen</option>
          <option value="onsite">Onsite</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setView('cards')}
            className={view === 'cards' ? 'font-bold' : ''}
          >
            Cards
          </button>
          <button
            onClick={() => setView('table')}
            className={view === 'table' ? 'font-bold' : ''}
          >
            Table
          </button>
        </div>
      </div>
      
      {/* Applications */}
      {view === 'table' ? (
        <ApplicationTable applications={applications} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 18) ANALYTICS & INSIGHTS

### Analytics Dashboard

**analytics/page.tsx**:

```typescript
'use client';

import { FunnelChart } from '@/components/analytics/FunnelChart';
import { SuccessRateChart } from '@/components/analytics/SuccessRateChart';
import { FinancialProjections } from '@/components/analytics/FinancialProjections';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  async function loadAnalytics() {
    const res = await fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        metric_type: 'all',
        time_range: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date()
        }
      })
    });
    
    const data = await res.json();
    setAnalytics(data.data);
  }
  
  if (!analytics) return <div>Loading...</div>;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Job Search Analytics</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-3xl font-bold text-blue-600">
            {analytics.funnel.applied}
          </div>
          <div className="text-sm text-gray-600">Applications</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded">
          <div className="text-3xl font-bold text-green-600">
            {analytics.funnel.phone_screen}
          </div>
          <div className="text-sm text-gray-600">Interviews</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded">
          <div className="text-3xl font-bold text-purple-600">
            {analytics.funnel.offer}
          </div>
          <div className="text-sm text-gray-600">Offers</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <div className="text-3xl font-bold text-yellow-600">
            {analytics.time_saved.hours_saved}h
          </div>
          <div className="text-sm text-gray-600">Time Saved</div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <FunnelChart data={analytics.funnel} />
        <SuccessRateChart data={analytics.success_by_match_score} />
      </div>
      
      {/* Financial Projections */}
      <FinancialProjections data={analytics.financial} />
    </div>
  );
}
```

---

## 19) SECURITY & PRIVACY

Same as PRD v1.0 with additions:

### Data Retention Policy

**Ephemeral Mode (Default)**:
- Applications auto-deleted after 90 days
- User can manually delete anytime
- No server-side storage beyond session

**Persistent Mode (Opt-in)**:
- User explicitly opts in
- Data stored in encrypted database
- User can export all data (GDPR compliance)
- User can delete account + all data

---

## 20) TESTING STRATEGY

Same as PRD v1.0 with additions:

### E2E Test: Full Job Search Flow

```typescript
// tests/e2e/full-job-search.spec.ts

test('complete job search workflow', async ({ page, context }) => {
  // 1. Install extension
  const extensionPath = './extension/dist';
  await context.addInitScript({ path: extensionPath });
  
  // 2. Navigate to Greenhouse job
  await page.goto('https://boards.greenhouse.io/anthropic/jobs/12345');
  
  // 3. Click extension icon
  await page.click('.extension-icon');
  
  // 4. Verify job detected
  const jobTitle = await page.textContent('.popup .job-title');
  expect(jobTitle).toContain('Senior Product Manager');
  
  // 5. Check match score displayed
  const matchScore = await page.textContent('.popup .match-score');
  expect(parseInt(matchScore!)).toBeGreaterThan(70);
  
  // 6. Click "Optimize & Apply"
  await page.click('button:has-text("Optimize & Apply")');
  
  // 7. Wait for optimization (should be < 3 seconds)
  await page.waitForSelector('.optimization-complete', { timeout: 3000 });
  
  // 8. Verify form autofilled
  const firstName = await page.inputValue('input[name*="first"]');
  expect(firstName).not.toBe('');
  
  // 9. Verify PDF uploaded
  const fileInput = await page.$('input[type="file"]');
  const files = await fileInput!.evaluate((el: any) => el.files.length);
  expect(files).toBe(1);
  
  // 10. Navigate to dashboard
  await page.goto('https://hustlerai.tech/tracker');
  
  // 11. Verify application auto-saved
  const applications = await page.$$('.application-card');
  expect(applications.length).toBeGreaterThan(0);
  
  // 12. Verify stats updated
  const totalApps = await page.textContent('.stats-bar .total');
  expect(parseInt(totalApps!)).toBeGreaterThan(0);
});
```

---

## 21) DEPLOYMENT STRATEGY

Same as PRD v1.0 with additions:

### Chrome Web Store Submission

**Listing**:
- **Name**: HustlerAI - Financial-First Job Copilot
- **Tagline**: Apply smarter, earn more. Optimize resumes, track applications, maximize salary ROI.
- **Description**: See below

```
HustlerAI is your financial-first AI copilot for the job search. Unlike generic 
application tools, HustlerAI helps you maximize income mobility by showing 
salary ROI, optimizing resumes for ATS, and preparing you with interview answers.

KEY FEATURES:
✓ Auto-detect jobs on Greenhouse, Lever, Workday, Ashby
✓ 1-click resume optimization with ATS compliance
✓ Salary ROI scoring - prioritize by earning potential
✓ STAR interview answers automatically generated
✓ Auto-track all applications with analytics
✓ Follow-up email generation

WHY HUSTLERAI?
• While Simplify helps you apply faster, HustlerAI helps you earn more
• Financial intelligence: salary ROI, career mobility, priority scoring
• Interview prep: 5 STAR answers per application
• Strategic guidance: prioritize high-ROI opportunities

100% FREE. No credit card required.

Install now and apply smarter!
```

**Screenshots**:
1. Extension popup with job detection
2. Resume score visualization
3. Dashboard with application tracker
4. Analytics page with funnel chart
5. STAR answers view

---

## 22) DEVELOPMENT WORKFLOW

Same as PRD v1.0 - No changes.

---

## 23) IMPLEMENTATION TIMELINE

### Updated Timeline with New Features

**Phase 1: Foundation (0-6 hours)**
- ✅ Setup repository, Claude Skills, knowledge base
- ✅ Build jd-analyzer, match-scorer, financial-scorer

**Phase 2: Resume System (6-12 hours)**
- ✅ Build bullet-rewriter, ats-validator, pdf-generator
- ✅ Build resume UI components (preview, checklist, keyword dial)

**Phase 3: Tracker & Analytics (12-16 hours)** ← NEW
- ✅ Build job-tracker-skill
- ✅ Build analytics-skill
- ✅ Build dashboard UI (tracker page, analytics page)
- ✅ Build follow-up-skill

**Phase 4: Extension (16-20 hours)**
- ✅ Build extension core (manifest, popup, background)
- ✅ Build content scripts (Greenhouse, Lever, Workday, Ashby)
- ✅ Implement autofill + auto-tracking

**Phase 5: Deployment (20-22 hours)**
- ✅ Deploy to Vercel + Cloudflare
- ✅ Configure domain
- ✅ Submit to Chrome Web Store

**Phase 6: Polish & Demo (22-24 hours)**
- ✅ Final testing, bug fixes
- ✅ Rehearse demo
- ✅ Prepare demo video

---

## 24) DEMO SCRIPT

**Duration**: 90 seconds

---

### Updated Script (Financial-First Angle)

**[0:00 - 0:15] Hook + Problem**

"Most people apply to jobs wrong. They waste time on low-paying roles and generic applications. The average person spends 3 hours per application and gets rejected 75% of the time by ATS bots."

"HustlerAI fixes this. We don't just help you apply faster—we help you **earn more**."

---

**[0:15 - 0:35] Solution: Extension Flow**

*[Navigate to Greenhouse job posting]*

"Watch: I'm on a Senior PM job at Acme Corp. My HustlerAI extension instantly analyzes the job..."

*[Click extension icon]*

"...and shows me three things: Match score of 87%, salary range of $120-160K, and **ROI of $280,000 per hour invested**."

"That ROI score tells me this is a high-value opportunity—35% salary lift and I'll learn 3 new must-have skills."

---

**[0:35 - 0:55] Optimization + Autofill**

*[Click "Optimize & Apply"]*

"One click. HustlerAI optimizes my resume for ATS in 2 seconds. It naturally weaves in keywords like 'product strategy' and 'roadmap planning' without faking anything."

*[Show autofill]*

"It autofills the entire application—name, email, experience—and uploads my PDF. All I do is review and hit Submit."

*[Application auto-saved to dashboard]*

"And it's automatically saved to my dashboard."

---

**[0:55 - 1:15] Dashboard + Financial Intelligence**

*[Open dashboard]*

"Here's the magic: HustlerAI doesn't just track applications—it shows me **which jobs maximize my earning potential**."

*[Point to tracker sorted by ROI]*

"See? These are sorted by ROI. The Staff PM role at TechCo has a $310K ROI—that's my top priority."

*[Show analytics]*

"And I can see my funnel: 47 applications, 12 interviews, 2 offers. My match scores above 85% have a 40% interview rate."

---

**[1:15 - 1:30] Interview Prep + Close**

*[Show STAR answers]*

"Oh, and for every job, HustlerAI generates 5 STAR interview answers tailored to the role. I'm not just applying—I'm **prepared to win**."

"So while tools like Simplify help you apply faster, HustlerAI helps you **apply smarter and earn more**."

*[Show financial projections]*

"With HustlerAI, I'm not just tracking applications. I'm building a **financial strategy** for my career."

---

**[1:30] Call to Action**

"Try it free at **hustlerai.tech**. Apply smarter. Earn more. Thank you."

---

## 25) APPENDIX: PROMPT LIBRARY

Same as PRD v1.0 with additions:

### Follow-Up Email Prompt

```
You are a professional career coach generating a follow-up email for a job application.

APPLICATION CONTEXT:
- Role: {role_title}
- Company: {company}
- Applied Date: {date_applied}
- Days Since Last Contact: {days_since}
- Match Score: {match_score}%
- Status: {status}

USER PROFILE:
- Name: {user_name}
- Current Role: {current_role}
- Top 3 Skills: {skills}
- Years Experience: {years_exp}

FOLLOW-UP TYPE: {type}
(Options: post_application, post_interview, post_rejection)

RULES:
1. Professional but warm tone
2. Keep under 150 words
3. Reference specific details about the role and company
4. Highlight 1-2 relevant qualifications naturally
5. Include clear call-to-action (request call, ask for update, etc.)
6. Subject line should be compelling and specific
7. If post_rejection, request constructive feedback politely

EXAMPLE OUTPUT (post_application):

Subject: Following up: Senior PM Application - Excited to Discuss Further

Hi [Recruiter Name],

I hope this email finds you well. I wanted to follow up on my application 
for the Senior Product Manager role at Acme Corp, which I submitted on 
January 15th.

With 6 years of B2B SaaS product experience and a proven track record of 
leading cross-functional teams, I'm genuinely excited about the opportunity 
to contribute to Acme's product strategy.

I'd love the chance to discuss how my background in roadmap planning and 
agile methodologies aligns with your team's needs. Would you have 15 minutes 
for a brief call this week?

Looking forward to hearing from you!

Best regards,
Alex Johnson

---

Now generate the follow-up email for the context above. Return ONLY JSON:
{
  "subject": "...",
  "body": "..."
}
```

---

## 🚀 READY FOR CLAUDE CODE v2.0

This updated PRD incorporates all the best practices from Simplify's proven UX while maintaining HustlerAI's unique financial-first differentiation.

**Key Improvements from v1.0:**

1. ✅ **Extension-first architecture** (like Simplify)
2. ✅ **Auto-tracking system** with full lifecycle management
3. ✅ **Visual analytics** with funnel, success rates, financial projections
4. ✅ **Job bookmarking** for later application
5. ✅ **Follow-up system** with AI-generated emails
6. ✅ **Multi-ATS support** (Greenhouse, Lever, Workday, Ashby)
7. ✅ **Priority scoring** to rank opportunities by ROI
8. ✅ **Enhanced dashboard** with comprehensive tracking

**Unique HustlerAI Advantages:**

- 💰 **Financial intelligence** (salary ROI, career mobility)
- 🎯 **Interview prep** (STAR answers)
- 📊 **Strategic prioritization** (sort by earning potential)
- ✅ **Requirement mapping** (Must-Have Matrix)
- 📄 **Complete package** (PDF + prep, not just score)

**Next Steps:**
1. Paste this entire PRD into Claude Code
2. Run: "Initialize HustlerAI v2.0 following the updated PRD"
3. Claude will build the complete system with Simplify-quality UX

**Let's build the financial-first job copilot.** 🚀
