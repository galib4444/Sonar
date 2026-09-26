# HustlerAI

AI-powered career-finance optimizer that transforms any job posting into actionable assets: ranked fit scores, ATS-optimized one-page resumes, recruiter summaries, STAR interview answers, and a Chrome extension that autofills application forms.

## 🎯 Core Innovation

Agent-first architecture using Claude Skills where each major system component is a specialized, autonomous agent that can be composed, tested, and deployed independently.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Process knowledge base PDFs → JSON
npm run process-knowledge

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📋 Prerequisites

- Node.js 18+
- npm or pnpm

## 🏗️ Project Structure

```
hustler-ai/
├── .claude/skills/          # Claude Skills (agent definitions)
│   ├── orchestrator/
│   ├── jd-analyzer/
│   ├── bullet-rewriter/
│   ├── ats-validator/
│   ├── pdf-generator/
│   ├── star-generator/
│   └── match-scorer/
│
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── analyze-jd/      # Analyze job description
│   │   ├── tailor/          # Generate tailored resume
│   │   └── health/          # Health check
│   ├── layout.tsx
│   └── page.tsx             # Home page
│
├── lib/                     # Core libraries
│   ├── types.ts             # TypeScript type definitions
│   ├── scoring/
│   │   └── match-scorer.ts  # Match scoring algorithm
│   ├── validation/
│   │   └── ats-validator.ts # ATS compliance validation
│   └── utils/
│       ├── text.ts          # Text processing utilities
│       ├── keywords.ts      # Keyword extraction
│       └── knowledge-base.ts # Knowledge base loader
│
├── knowledge-base/
│   ├── raw/                 # Original PDF files
│   └── processed/           # Extracted JSON data
│       ├── action-verbs.json
│       ├── ats-rules.json
│       ├── bullet-examples.json
│       └── templates.json
│
└── scripts/
    └── process-knowledge.ts # PDF → JSON processing script
```

## 🎯 Key Features

### 1. Job Description Analysis
- Extract structured insights (skills, requirements, salary)
- Identify must-have vs nice-to-have qualifications
- Determine seniority level and remote policy

### 2. Match Scoring (0-100)
- **Skill Overlap** (50 pts): Match user skills with JD keywords
- **Must-Have Coverage** (20 pts): Coverage of required qualifications
- **Seniority Fit** (15 pts): Years of experience alignment
- **Evidence Score** (15 pts): Quantified, relevant achievements

### 3. ATS Validation
- Layout checks (single column, no tables)
- Font compliance (approved fonts, sizes)
- Section structure validation
- Keyword coverage and density
- Page count enforcement (strict 1-page limit)

### 4. Resume Tailoring
- Rewrite bullets to incorporate JD keywords
- Use action verbs from knowledge base
- Maintain truthfulness (no hallucinations)
- Generate tailored summary

### 5. Interview Prep
- Generate 5 STAR behavioral answers
- Align answers to JD requirements
- Use only real experiences from profile

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Quality
npm run lint             # Check code with ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run typecheck        # Run TypeScript compiler

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests

# Knowledge Base
npm run process-knowledge # Extract PDFs → JSON
```

## 🔧 Configuration

Create a `.env.local` file:

```bash
# Copy template
cp .env.local.template .env.local

# Edit with your actual API keys
# Get Gemini API key: https://makersuite.google.com/app/apikey
```

**⚠️ SECURITY WARNING:**
- **NEVER** commit `.env.local` to git (it's already in `.gitignore`)
- **NEVER** share API keys in public forums or with AI agents
- Run `npm run verify-security` before committing to verify no secrets are exposed
- See `SECURITY.md` for complete security policy

## 📚 Claude Skills

This project uses an agent-first architecture with specialized Claude Skills:

- **orchestrator-skill**: Main workflow coordinator
- **jd-analyzer-skill**: Parse job descriptions (uses Gemini API)
- **match-scorer-skill**: Calculate job-resume fit scores
- **bullet-rewriter-skill**: Rewrite resume bullets for ATS
- **ats-validator-skill**: Validate ATS compliance
- **pdf-generator-skill**: Generate PDF resumes (@react-pdf/renderer)
- **star-generator-skill**: Create behavioral interview answers
- **knowledge-processor-skill**: Extract data from reference PDFs

Each skill is documented in `.claude/skills/{skill-name}/SKILL.md`

## 🧪 Testing

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📖 API Endpoints

### `POST /api/analyze-jd`
Analyze a job description and extract insights.

**Request:**
```json
{
  "jd_text": "We're seeking a Senior Product Manager...",
  "user_baseline_salary": 120000
}
```

**Response:**
```json
{
  "jd_insights": {
    "title": "Senior Product Manager",
    "skills_extracted": [...],
    "must_haves": [...],
    "keywords_top_10": [...]
  }
}
```

### `POST /api/tailor`
Generate tailored resume from JD and user profile.

**Request:**
```json
{
  "jd_text": "...",
  "user_profile": {
    "name": "John Doe",
    "experience": [...],
    "skills": [...]
  }
}
```

**Response:**
```json
{
  "resume_sections": {...},
  "pdf_url": "...",
  "match_score": {
    "total_score": 87,
    "breakdown": {...}
  },
  "ats_validation": {
    "valid": true,
    "score": 95
  }
}
```

## 🏆 Success Metrics

- **Time-to-Value**: < 60 seconds (JD paste → resume download)
- **ATS Compliance**: 100% pass rate
- **One-Page Rate**: 100% (never exceed 1 page)
- **Keyword Coverage**: ≥ 8/10 top JD keywords

## 🔒 Privacy

- **Ephemeral Mode**: No data stored permanently
- **No Authentication**: Privacy-first, no user accounts required
- **Client-Side Processing**: Where possible

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router), React 18+, TypeScript 5+
- **AI**: Google Gemini API
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **PDF**: @react-pdf/renderer, pdf-parse
- **Testing**: Jest, Playwright
- **Package Manager**: npm

## 🚢 Deployment

The app is designed to deploy to:
- **Frontend**: Vercel
- **Workers**: Cloudflare Workers (for AI endpoints)
- **Domain**: GoDaddy

## 📄 License

MIT

## 🤝 Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Built with Claude Skills** | Agent-First Architecture
