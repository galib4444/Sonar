# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HustlerAI** is an AI-powered career-finance optimizer that transforms job postings into actionable assets: ranked fit scores, ATS-optimized resumes, recruiter summaries, STAR interview answers, and a Chrome extension for autofilling application forms.

**Core Innovation**: Agent-first architecture where each major system component is a specialized, autonomous module that can be composed, tested, and deployed independently.

## ⚠️ SECURITY - CRITICAL RULES

**NEVER read, access, or attempt to view the following files:**
- `.env.local` - Contains sensitive API keys and secrets
- `.env` - Environment configuration with secrets
- Any file matching `.env*.local` pattern
- `*.pem` files
- Any `credentials.json` or `secrets.json` files

**When assisting with environment setup:**
- Use `.env.example` or `.env.local.template` for reference only
- Never ask the user to paste API keys in the conversation
- Direct users to documentation on how to obtain keys themselves
- Use mock/example values in code snippets

**See `SECURITY.md` for complete security policy.**

## Requirements

- **Node.js**: 18.0.0 or higher (specified in `package.json` engines)
- **npm**: Comes with Node.js (package manager)
- **MongoDB**: MongoDB Atlas account (or local MongoDB instance)
- **Gemini API Key**: Required for AI features (get from https://makersuite.google.com/app/apikey)

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.local.template .env.local
# Edit .env.local with your API keys (GEMINI_API_KEY required)
# Get key from: https://makersuite.google.com/app/apikey
# WARNING: Never commit .env.local to git - it's in .gitignore

# Process knowledge base PDFs to JSON
npm run process-knowledge

# Seed demo data
npm run seed-demo

# Start development server
npm run dev
```

### Build & Development
```bash
# Development
npm run dev                 # Start Next.js dev server (http://localhost:3000)

# Build
npm run build               # Build Next.js app for production
npm run start               # Start production server

# Type checking
npm run typecheck           # Run TypeScript compiler without emitting files
```

### Testing
```bash
# Unit and integration tests
npm test                    # Run all Jest tests
npm run test:watch          # Run Jest in watch mode
npm run test:coverage       # Generate test coverage report

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="match scorer"

# End-to-end tests
npm run test:e2e            # Run Playwright E2E tests
```

**Note**: Jest and Playwright configuration is defined in package.json. No separate jest.config.js or playwright.config.ts files exist.

### Code Quality
```bash
# Linting
npm run lint                # Check code with ESLint
npm run lint:fix            # Auto-fix ESLint issues

# Formatting
npm run format              # Format code with Prettier

# Security
npm run verify-security     # Verify no secrets are exposed
```

### Knowledge Base Processing
```bash
# Process PDFs from knowledge-base/raw/ to knowledge-base/processed/
npm run process-knowledge

# This extracts:
# - action-verbs.json (action verbs by category)
# - ats-rules.json (ATS compliance rules)
# - bullet-examples.json (example resume bullets)
# - templates.json (resume template structures)
```

### Chrome Extension
```bash
# Build Chrome extension
npm run build:extension

# Extension will be built to extension/dist/
# Load unpacked extension from that directory in Chrome
```

### Cloudflare Workers
```bash
# Deploy Workers to Cloudflare
npm run deploy:workers

# Requires CLOUDFLARE_API_TOKEN in environment
```

## Architecture

### Project Structure Overview

```
hustler-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (server-side)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tracker/              # Application tracking
│   │   ├── analyze-jd/           # JD analysis
│   │   ├── tailor/               # Resume tailoring
│   │   ├── generate-pdf/         # PDF generation
│   │   ├── parse-resume/         # Resume parsing
│   │   └── star/                 # STAR interview answers
│   ├── (routes)/                 # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── tailor/
│   │   ├── tracker/
│   │   ├── analytics/
│   │   └── result/
│   ├── login/                    # Public login page
│   ├── register/                 # Public register page
│   └── page.tsx                  # Public landing page
│
├── lib/                          # Core business logic
│   ├── ai/                       # AI integrations
│   ├── auth/                     # Authentication utilities
│   ├── db/                       # Database models and connection
│   ├── scoring/                  # Match scoring algorithms
│   ├── validation/               # ATS validation
│   ├── pdf/                      # PDF generation
│   ├── analytics/                # Analytics calculations
│   ├── financial/                # ROI calculations
│   ├── tracker/                  # Application tracking storage
│   ├── utils/                    # Shared utilities
│   └── types.ts                  # TypeScript type definitions
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives + custom UI
│   ├── analyzer/                 # JD analysis components
│   ├── resume/                   # Resume components
│   ├── tracker/                  # Tracker components
│   └── analytics/                # Analytics components
│
├── knowledge-base/               # Reference materials
│   ├── raw/                      # Original PDF files
│   └── processed/                # Extracted JSON data
│
├── public/                       # Static assets
│   └── demo-data/                # Demo users and jobs
│
├── scripts/                      # Utility scripts
│   ├── process-knowledge.ts      # PDF → JSON processing
│   └── seed-demo-data.ts         # Seed database with demo data
│
├── extension/                    # Chrome extension (autofill)
│   ├── manifest.json
│   ├── content/                  # Content scripts
│   ├── popup/                    # Extension popup UI
│   └── background/               # Service worker
│
├── workers/                      # Cloudflare Workers (optional)
│
├── middleware.ts                 # Next.js middleware (auth, rate limiting)
├── .husky/                       # Git hooks
├── .env.local.template           # Environment variable template
└── CLAUDE.md                     # This file
```

### Module Organization

HustlerAI uses a modular architecture organized into specialized components:

**Core Modules** (located in `lib/`):

1. **AI Layer** (`lib/ai/`):
   - `gemini-client.ts`: Google Gemini API integration with fallback to mock responses
   - `bullet-rewriter.ts`: Resume bullet rewriting with keyword incorporation
   - `star-generator.ts`: STAR behavioral interview answer generation

2. **Scoring** (`lib/scoring/`):
   - `match-scorer.ts`: Job-resume fit scoring (0-100) with weighted components:
     - Skill overlap (50 pts)
     - Must-have coverage (20 pts)
     - Seniority fit (15 pts)
     - Evidence score (15 pts)

3. **Validation** (`lib/validation/`):
   - `ats-validator.ts`: ATS compliance validation (layout, fonts, keywords, page limits)

4. **PDF Generation** (`lib/pdf/`):
   - `pdf-generator.ts`: ATS-compliant PDF creation using @react-pdf/renderer

5. **Database** (`lib/db/`):
   - `mongodb.ts`: MongoDB connection utility with singleton pattern
   - `models/User.ts`: User authentication model
   - `models/UserProfile.ts`: User resume profile model
   - `models/Application.ts`: Job application tracking model

6. **Authentication** (`lib/auth/`):
   - `auth-utils.ts`: JWT token generation/verification, password hashing
   - `mongodb.ts`: Re-exports from `lib/db/mongodb.ts` (for backward compatibility)

7. **Analytics** (`lib/analytics/`):
   - `calculations.ts`: ROI calculations, success rate metrics, financial projections

8. **Financial** (`lib/financial/`):
   - `roi-calculator.ts`: Calculate time/money ROI from job search optimization

9. **Tracker** (`lib/tracker/`):
   - `storage.ts`: Local storage utilities for application tracking data

10. **Utilities** (`lib/utils/`):
    - `text.ts`: Text processing (extraction, cleaning, metrics parsing)
    - `keywords.ts`: Keyword extraction and skill aliasing
    - `knowledge-base.ts`: Knowledge base loader for action verbs, ATS rules, templates
    - `cn.ts`: Tailwind class merging utility
    - `error-logger.ts`: Centralized error logging

11. **Types** (`lib/types.ts`):
    - Central TypeScript definitions for UserProfile, JDInsights, MatchScoreResult, etc.

### Main Workflow: JD → Resume

1. **JD Analysis** → `/api/analyze-jd` extracts structured insights from job description
   - Uses helper functions + Gemini API for skill extraction
   - Returns: title, company, seniority, skills, must-haves, keywords

2. **Match Scoring** → `lib/scoring/match-scorer.ts` calculates fit score
   - Compares UserProfile against JDInsights
   - Returns weighted score breakdown and recommendations

3. **Resume Generation** → `lib/ai/bullet-rewriter.ts` tailors bullets
   - Selects top 6-8 bullets based on relevance scoring
   - Calls Gemini API to rewrite with JD keywords
   - Uses knowledge base action verbs for enhancement

4. **ATS Validation** → `lib/validation/ats-validator.ts` ensures compliance
   - Validates layout (single column, no tables/images)
   - Checks fonts (approved list, size ranges)
   - Verifies keyword coverage (≥8/10 top keywords)
   - Enforces 1-page limit

5. **PDF Generation** → `lib/pdf/pdf-generator.ts` creates ATS-clean PDF
   - Uses @react-pdf/renderer
   - Single column, approved fonts only
   - Strict 1-page limit

6. **Interview Prep** → `lib/ai/star-generator.ts` creates STAR answers
   - Generates 5 behavioral interview answers
   - Aligns to JD requirements
   - Uses only real experiences from UserProfile

### Knowledge Base System

The `/knowledge-base/` directory contains reference materials that ground all AI outputs:

- **raw/**: Original PDF files (action verbs, ATS rules, resume templates, examples)
- **processed/**: Extracted JSON data loaded by skills at runtime
- All resume generation uses these materials to ensure best practices

Processing pipeline: PDF → text extraction → structured JSON → skill consumption

### Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components), React 18+, TypeScript 5+
- **AI**: Google Gemini API (primary), OpenRouter (fallback)
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Lucide React icons
- **PDF**: @react-pdf/renderer (generation), pdf-parse (extraction)
- **Database**: MongoDB Atlas (with Mongoose ODM)
- **Authentication**: JWT with bcryptjs password hashing
- **Extension**: Chrome Manifest V3, Webpack 5
- **Deployment**: Vercel (Next.js), Cloudflare Workers (AI endpoints), GoDaddy (domain)
- **Testing**: Jest, React Testing Library, Playwright
- **Package Manager**: npm

### Next.js Configuration

The `next.config.js` includes custom webpack configuration:

```javascript
webpack: (config) => {
  // Handle canvas required by pdf-parse
  config.resolve.alias.canvas = false;
  return config;
},
experimental: {
  serverComponentsExternalPackages: ['pdf-parse'],
}
```

This is necessary because `pdf-parse` has native dependencies that need special handling in the Next.js build process.

### Middleware (`middleware.ts`)

The application uses Next.js middleware for:

1. **Authentication**: Protects routes under `/dashboard`, `/tailor`, `/tracker`, `/analytics`, `/result` and their corresponding API routes
   - Checks for JWT token in cookies or Authorization header
   - Redirects unauthenticated users to `/login`
   - Returns 401 for unauthorized API requests

2. **Rate Limiting**: AI endpoints (`/api/analyze-jd`, `/api/tailor`) limited to 10 requests per minute per IP

3. **CORS**: Enables Cross-Origin Resource Sharing for Chrome extension integration

4. **Logging**: Logs all API requests with timestamp, method, path, and IP address

**Public Routes** (no authentication required):
- `/`, `/login`, `/register`
- `/api/auth/login`, `/api/auth/register`

**Protected Routes** (authentication required):
- Pages: `/dashboard`, `/tailor`, `/tracker`, `/analytics`, `/result`
- APIs: `/api/analyze-jd`, `/api/tailor`, `/api/tracker/*`, `/api/analytics`, `/api/parse-resume`, `/api/star`, `/api/bookmarks`, `/api/follow-up`, `/api/generate-pdf`

### API Routes (Next.js App Router)

All routes located in `app/api/`:

**Core Resume Generation:**
- `POST /api/analyze-jd` - Analyze job description, extract insights
  - Input: `{ jd_text: string, user_baseline_salary?: number }`
  - Output: `{ jd_insights: JDInsights, metadata: {...} }`

- `POST /api/tailor` - Generate tailored resume from JD + user profile
  - Input: `{ jd_text: string, user_profile: UserProfile }`
  - Output: `{ resume_sections: {...}, match_score: {...}, ats_validation: {...} }`

- `POST /api/generate-pdf` - Create PDF from resume data
  - Input: `{ resume_sections: {...}, user_profile: UserProfile }`
  - Output: PDF file download

- `POST /api/star` - Generate STAR interview answers
  - Input: `{ jd_insights: JDInsights, user_profile: UserProfile }`
  - Output: `{ answers: STARAnswer[] }`

- `POST /api/parse-resume` - Parse uploaded resume PDF to extract profile data
  - Input: PDF file upload
  - Output: `{ user_profile: UserProfile }`

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user profile

**Application Tracking:**
- `POST /api/tracker/save` - Save job application
- `GET /api/tracker/list` - List user's applications
- `PUT /api/tracker/update` - Update application status
- `POST /api/tracker/seed` - Seed demo data for testing

**Analytics:**
- `GET /api/analytics` - Get analytics data for user applications
- `POST /api/follow-up` - Generate follow-up email templates
- `POST /api/bookmarks` - Manage bookmarked jobs

**Health:**
- `GET /api/health` - Health check endpoint

### ATS Compliance Rules

All generated resumes must meet these requirements (validated by `lib/validation/ats-validator.ts`):

**Layout**:
- Single column only (no multi-column layouts)
- No tables, text boxes, or images
- No headers/footers
- Maximum 1 page at 11pt font

**Fonts**:
- Approved: Arial, Calibri, Helvetica, Times New Roman
- Body: 10.5-11.5pt
- Headers: 12-14pt

**Keywords**:
- Minimum 8/10 top JD keywords present
- Natural placement in summary, experience bullets, and skills
- Keyword density < 3% (avoid stuffing)

**Sections**:
- Required: Experience, Education, Skills
- Optional: Summary, Projects, Certifications
- Standard heading names (e.g., "EXPERIENCE" not "Work History")

### Chrome Extension Architecture

**Supported Platforms**: Greenhouse, Lever

**Components**:
- `manifest.json` - Chrome Extension Manifest V3 configuration
- `content/greenhouse.ts` - Content script for Greenhouse autofill
- `content/lever.ts` - Content script for Lever autofill
- `popup/` - React-based popup UI for triggering generation
- `background/` - Service worker for API communication

**Flow**:
1. User opens extension on job posting page
2. Extension extracts JD from page
3. Calls backend API to generate tailored resume
4. Autofills form fields with user data
5. Uploads generated PDF as resume file

### Environment Variables

Required in `.env.local`:
```bash
# AI API (Required for resume generation)
GEMINI_API_KEY=your_gemini_key              # Google Gemini API (get from https://makersuite.google.com/app/apikey)

# Database (Required for authentication and data persistence)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hustlerai?retryWrites=true&w=majority

# Authentication (Required for JWT tokens)
JWT_SECRET=your-super-secret-jwt-key-change-in-production  # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Optional (for production deployment):
```bash
OPENROUTER_API_KEY=your_openrouter_key      # Fallback AI API
NEXT_PUBLIC_API_URL=https://hustlerai.tech  # Production API URL
CLOUDFLARE_ACCOUNT_ID=your_account_id       # For Workers deployment
CLOUDFLARE_API_TOKEN=your_api_token         # For Workers deployment
SENTRY_DSN=https://...                      # Error tracking
```

**Note**: Without `GEMINI_API_KEY`, the app will use mock responses for development. This allows you to develop and test the UI/workflow without an API key.

### Git Branch Structure

- **V6** (current development branch): Latest features including authentication, database integration, analytics
- **main/master**: Production branch (not currently configured - will need to set up)

When creating PRs, the base branch needs to be configured. Check with the project owner for the main branch name.

### Commit Convention

Use Conventional Commits format:
```
feat: add keyword dial component
fix: correct ATS validation logic
docs: update setup instructions
test: add tests for match scorer
chore: update dependencies
```

Prefix with version when appropriate:
```
V6: Fix parse-resume endpoint and add error tracking
V5: Refactor dashboard structure and enhance analytics components
```

### Pre-commit Hooks

Automated checks run before each commit (configured in `.husky/pre-commit`):

1. **Security Checks**:
   - Blocks commits containing `.env`, `.env.local`, `credentials.json`, `secrets.json`, `.pem` files
   - Warns about potential API keys in code (regex detection)
   - Prompts for confirmation if suspicious patterns detected

2. **Code Quality**:
   - ESLint (linting)
   - TypeScript (type checking)

**Note**: Tests are NOT run in pre-commit hooks to keep commits fast. Run `npm test` manually before pushing.

## Common Development Workflows

### Adding a New API Endpoint

1. Create route file in `app/api/your-endpoint/route.ts`
2. Import and call `connectDB()` at the start
3. Verify authentication if needed (extract token, call `verifyToken()`)
4. Implement business logic using lib modules
5. Return `NextResponse.json()` with appropriate status codes
6. Add to protected routes in `middleware.ts` if authentication required
7. Test with `npm run dev` and check browser network tab

### Adding a New Page

1. Create page in `app/(routes)/your-page/page.tsx` (for protected) or `app/your-page/page.tsx` (for public)
2. Add to middleware matcher in `middleware.ts` if protected
3. Import UI components from `components/ui/` and `components/`
4. Use Black-Gold theme components (glass-card, gold-button, premium-input)
5. Test navigation and authentication

### Modifying Resume Generation Logic

1. **ALWAYS** read the relevant lib files first (bullet-rewriter, match-scorer, ats-validator)
2. Ensure changes don't violate ATS compliance rules
3. Test with `npm test` to verify scoring/validation logic
4. Use knowledge base data (action-verbs.json, ats-rules.json) - don't hardcode
5. Never add hallucinated content - all data must come from UserProfile
6. Validate 1-page limit after changes

### Working with Database

1. Define or update model in `lib/db/models/`
2. Import from `@/lib/db` (centralized exports)
3. Always call `await connectDB()` before queries
4. Use try-catch for error handling
5. Test with seed data: `npm run seed-demo`
6. Check MongoDB Atlas dashboard to verify data

### Testing the Full Pipeline

1. Start dev server: `npm run dev`
2. Register account at `/register`
3. Upload resume at `/dashboard` or use demo profile
4. Navigate to `/tailor` and paste job description
5. Verify match score, tailored resume, and ATS validation
6. Download PDF and check formatting
7. Check `/tracker` for saved applications
8. View `/analytics` for metrics

## Important Development Notes

### Working with MongoDB

When creating new API routes that use the database:

1. **Always connect first**: Call `await connectDB()` at the start of API route handlers
2. **Import from centralized location**: Use `import { connectDB, User, UserProfile, Application } from '@/lib/db'`
3. **Handle errors gracefully**: Wrap database operations in try-catch blocks
4. **Use TypeScript types**: Import types from `lib/types.ts` for consistency
5. **Authentication in protected routes**: Extract userId from JWT token, then query by userId
6. **Never expose passwords**: Password field is excluded by default; use `.select('+password')` only when needed for verification

Example API route with MongoDB:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Application } from '@/lib/db';
import { verifyToken } from '@/lib/auth/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get user from JWT token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Query database
    const applications = await Application.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Gemini API Integration

The app uses Google Gemini API for AI-powered features:
- **Client**: `lib/ai/gemini-client.ts` handles all Gemini API calls
- **Fallback**: Automatically uses mock responses if `GEMINI_API_KEY` not set
- **Model**: Uses `gemini-1.5-pro` with configurable temperature/maxTokens
- **Error Handling**: Falls back to mock on API errors for graceful degradation

### When Modifying Resume Generation

1. **Always** validate changes against ATS compliance rules in `lib/validation/ats-validator.ts`
2. Changes to bullet rewriting should use knowledge base action verbs from `knowledge-base/processed/action-verbs.json`
3. Ensure no hallucinated metrics or experiences are added - all content must come from UserProfile
4. Keep resume to strict 1-page limit (validate with line count)
5. Test with `npm run test` to verify scoring/validation logic

### When Processing Knowledge Base

1. Run `npm run process-knowledge` after updating PDFs in `knowledge-base/raw/`
2. Verify JSON output in `knowledge-base/processed/` is correctly structured
3. Modules load this data at runtime - restart dev server (`npm run dev`) after processing
4. The processor script is at `scripts/process-knowledge.ts`

### Using Demo Data

The project includes demo data for testing the application:

**Location**: `public/demo-data/`
- `users/`: Sample user profiles (alex-earlycareer.json, jamie-midlevel.json, sam-switcher.json)
- `jobs/`: Sample job descriptions (swe-entry.json, swe-mid.json, pm-senior.json)
- `demo-data.json`: Combined demo dataset

**Seeding Demo Data**:
```bash
npm run seed-demo
```

This will populate the database with demo users, profiles, and applications for testing. Useful for:
- Testing the full workflow without creating manual data
- Demonstrating the application to stakeholders
- Developing and testing new features with realistic data
- Testing analytics and tracking features with sample applications

### Error Handling and Logging

The application uses a centralized error logging system (`lib/utils/error-logger.ts`):

**Error Logger Features**:
- Tracks last 100 errors with timestamps, stack traces, and context
- Console logs with clear formatting (emoji-prefixed sections)
- Singleton pattern for consistent error tracking across the app
- Ready for integration with external services (Sentry, LogRocket)

**Usage Example**:
```typescript
import { errorLogger, withErrorLogging } from '@/lib/utils/error-logger';

// Direct logging
try {
  // some code
} catch (error) {
  errorLogger.log(error as Error, 'api/analyze-jd', {
    route: '/api/analyze-jd',
    userId: 'user123'
  });
}

// Wrapper for async functions
const analyzeJD = withErrorLogging(
  async (jdText: string) => {
    // function implementation
  },
  'analyzeJD',
  { component: 'JDAnalyzer' }
);
```

**Retrieving Errors**:
```typescript
errorLogger.getErrors();                  // Get all errors
errorLogger.getErrorsBySource('api/');    // Filter by source
errorLogger.clear();                      // Clear all errors
```

### Debugging

- **Next.js logs**: Check terminal running `npm run dev`
- **API route errors**: Check browser Network tab and server console
- **Type errors**: Run `npm run typecheck` to catch TypeScript issues
- **Extension errors**: Chrome DevTools → Extensions → HustlerAI → Inspect views
- **Gemini API calls**: Check console for "GEMINI_API_KEY not set" warnings
- **MongoDB connection**: Look for "✅ MongoDB connected successfully" or "❌ MongoDB connection error" in console
- **Authentication issues**:
  - Check JWT token in cookies (middleware checks cookies first, then Authorization header)
  - Verify with `/api/auth/verify`
  - Check middleware logs: `🔍 [MIDDLEWARE]`, `🎫 [MIDDLEWARE]`, `✅/❌ [MIDDLEWARE]`
- **PDF generation**: Check for errors in browser console when generating PDFs
- **Error tracking**: Use `errorLogger.getErrors()` in browser console to retrieve logged errors

### UI Theme: Black-Gold Premium Design

The application uses a custom premium "Black-Gold" theme:

- **Colors**: Black backgrounds with gold accents (#FFD700, #DAA520)
- **Glass morphism**: Frosted glass effects on cards (`components/ui/glass-card.tsx`)
- **Premium components**: Custom gold buttons, premium inputs, animated loaders
- **Loaders**: Multiple themed loaders (globe-loader, mechgodzilla-loader) for different sections
- **Navigation**: Premium nav bar with gradient gold accents

When creating new UI components, maintain consistency with the Black-Gold theme by:
1. Using the custom premium components from `components/ui/`
2. Following the color scheme (black bg, gold accents, white/gray text)
3. Adding glass morphism effects for cards/panels
4. Using appropriate themed loaders for loading states

### Performance Targets

- Complete workflow (JD paste → PDF download): < 60 seconds
- ATS validation: 100% pass rate
- One-page compliance: 100%
- Keyword coverage: ≥ 8/10 top JD keywords

### Component Structure

- **UI Components**: `components/ui/` - shadcn/ui primitives (buttons, cards, loaders with premium Black-Gold theme)
- **Analyzer Components**: `components/analyzer/` - JD analysis and match scoring displays
- **Resume Components**: `components/resume/` - Resume preview, editing, and upload
- **Tracker Components**: `components/tracker/` - Application tracking table and stats
- **Analytics Components**: `components/analytics/` - Charts and financial projections
- **Pages**:
  - `app/page.tsx` - Public landing page
  - `app/(routes)/dashboard/page.tsx` - Main dashboard (protected)
  - `app/(routes)/tailor/page.tsx` - Resume tailoring interface
  - `app/(routes)/result/page.tsx` - Generated resume results
  - `app/(routes)/tracker/page.tsx` - Job application tracker
  - `app/(routes)/analytics/page.tsx` - Analytics dashboard
  - `app/login/page.tsx` - Login page
  - `app/register/page.tsx` - Registration page

### Database Architecture

**MongoDB Collections** (defined in `lib/db/models/`):

1. **User Model** (`lib/db/models/User.ts`):
   - Handles authentication and account management
   - Fields: name, email, password (hashed with bcrypt), role, timestamps
   - Password automatically hashed on save with pre-save hook
   - Includes `comparePassword()` method for verification

2. **UserProfile Model** (`lib/db/models/UserProfile.ts`):
   - Stores resume data for generation
   - One-to-one relationship with User (via userId reference)
   - Fields: contact info, summary, skills, experience[], education[], projects[], certifications[]
   - Used by resume generation endpoints

3. **Application Model** (`lib/db/models/Application.ts`):
   - Tracks job applications and their status
   - Fields: jobTitle, company, jobDescription, matchScore, status, appliedDate, resumeUrl, notes, salary, jdInsights
   - Status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected'
   - Indexed on (userId, createdAt), (userId, status), (userId, matchScore) for efficient queries

**Connection Management** (`lib/db/mongodb.ts`):
- Singleton pattern with global caching to prevent connection spam
- Connection pooling configured (maxPoolSize: 10)
- Automatic reconnection on failure
- Always call `await connectDB()` before database operations in API routes

**See `docs/MONGODB_SETUP.md` for detailed database setup and usage examples.**

### Authentication System

**JWT-Based Authentication** (implemented in `lib/auth/`):

1. **Registration Flow**:
   - User submits name, email, password → `POST /api/auth/register`
   - Password hashed with bcrypt (10 rounds)
   - User document created in MongoDB
   - JWT token issued (7-day expiration)
   - Token stored in localStorage on client

2. **Login Flow**:
   - User submits email, password → `POST /api/auth/login`
   - Password verified against hash using `user.comparePassword()`
   - JWT token issued and returned
   - Token stored in localStorage

3. **Protected Routes**:
   - All routes under `app/(routes)/` require authentication
   - Middleware checks for valid JWT token
   - Redirects to `/login` if unauthenticated
   - Token sent via Authorization header: `Bearer <token>`

4. **Token Verification**:
   - `GET /api/auth/verify` - Validates JWT and returns user data
   - `GET /api/auth/me` - Gets current authenticated user profile

**Auth Utilities** (`lib/auth/auth-utils.ts`):
- `hashPassword(password)` - Hash password with bcrypt
- `comparePassword(password, hash)` - Verify password
- `generateToken(userId)` - Generate JWT token
- `verifyToken(token)` - Verify and decode JWT token

**See `AUTH_SETUP_GUIDE.md` for complete authentication setup instructions.**
