/**
 * Export the master profile into the shape apps/extension (Bekar Apply) imports.
 *
 * Sources (rule 1: master only, never a tailored resume, never PDF parsing):
 *   - packages/profile/master-profile.json  via selectProfile()
 *   - ../application-answers.md             (outside the repo, optional)
 *
 * Rule 9 behaviour:
 *   - verification: 'strict' — unverified bullets, certs, and skills are
 *     dropped from autofill data (an autofilled form states things as fact).
 *   - Unverified ENTRY titles (e.g. a title pending payroll confirmation) are kept but printed as warnings.
 *   - Blocked projects (e.g. an unlaunched product) can never be included — selectProfile
 *     enforces that.
 *   - The answer-bank parser skips the "Needs checking before reuse" section
 *     and tailoring/accuracy notes.
 *
 * Output: apps/extension/extension-profile.json (gitignored — contact info).
 *
 * Run from repo root:
 *   apps/web/node_modules/.bin/tsx packages/profile/export-extension-profile.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { selectProfile, type MasterProfile } from './master-profile.ts';

const here = path.dirname(fileURLToPath(new URL(import.meta.url)));
const repoRoot = path.resolve(here, '..', '..');

const masterPath = path.join(here, 'master-profile.json');
const answersPath = process.argv[2] ?? path.resolve(repoRoot, '..', 'application-answers.md');
const outPath = path.join(repoRoot, 'apps', 'extension', 'extension-profile.json');

const master = JSON.parse(readFileSync(masterPath, 'utf8')) as MasterProfile;

// ── Selection ────────────────────────────────────────────────────────────────

// includeOptional: true — the extension's own per-JD tailoring call (Step
// 4's selection pass, apps/extension/src/shared/resume-tailor-service.ts)
// decides what's relevant per posting; a static include_by_default:false
// pre-filter here would hide an entry (e.g. a coursework project) from
// every single posting even where it's the most relevant thing on the
// page, before tailoring ever gets a chance to judge that.
const sel = selectProfile(master, { verification: 'strict', includeOptional: true });
const p = sel.profile;

// ── Answer bank from application-answers.md ─────────────────────────────────

interface AnswerBankEntry {
  question: string;
  answer: string;
}

function parseAnswerBank(markdown: string): AnswerBankEntry[] {
  const entries: AnswerBankEntry[] = [];
  const sections = markdown.split(/\n## /).slice(1); // drop preamble

  for (const section of sections) {
    const newlineIdx = section.indexOf('\n');
    const heading = section.slice(0, newlineIdx).trim();
    let body = section.slice(newlineIdx + 1);

    // Rule 9: the open-items section is not reusable answer material.
    if (/^needs checking/i.test(heading)) continue;

    // Building blocks section: each "**Label:** text" bold-lead paragraph is
    // its own short answer.
    if (/^reusable building blocks/i.test(heading)) {
      for (const m of body.matchAll(/\*\*(.+?):\*\*\s*([^\n]+)/g)) {
        entries.push({ question: m[1].trim(), answer: m[2].trim() });
      }
      continue;
    }

    // Question sections look like "Q1. Tell us about ...".
    const q = heading.replace(/^Q\d+\.\s*/, '').trim();
    if (!q) continue;

    body = body
      .split('\n')
      // Drop blockquote notes (tailoring/accuracy annotations, not answers)
      // and heavy markdown scaffolding.
      .filter((line) => !line.trimStart().startsWith('>'))
      .join('\n')
      // Drop bold labels but keep their text.
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^-{3,}\s*$/gm, '')
      .trim();

    if (body) entries.push({ question: q, answer: body });
  }
  return entries;
}

let answerBank: AnswerBankEntry[] = [];
if (existsSync(answersPath)) {
  answerBank = parseAnswerBank(readFileSync(answersPath, 'utf8'));
} else {
  console.warn(`! answer bank not found at ${answersPath} — exporting without it`);
}

// Voice constraints for AI generation prompts (plan step 3).
const voicePath = path.join(here, 'voice-dna.md');
const voiceNotes = existsSync(voicePath) ? readFileSync(voicePath, 'utf8') : '';

// ── Field conversions ────────────────────────────────────────────────────────

const [firstName, ...restName] = p.name.split(' ');
const lastName = restName.pop() ?? '';
const middleName = restName.join(' ') || undefined;

const phoneDigits = master.identity.contact.phone.replace(/\D/g, '');
const phone = {
  countryCode: '+1',
  number: phoneDigits,
  formatted: master.identity.contact.phone,
};

// "Springfield, NY 10001" → structured location
const locMatch = master.identity.contact.location.match(/^(.+?),\s*([A-Z]{2})\s*(\d{5})?$/);
const location = locMatch
  ? {
      city: locMatch[1],
      state: locMatch[2],
      country: 'United States',
      ...(locMatch[3] ? { zipCode: locMatch[3] } : {}),
    }
  : master.identity.contact.location;

function toWorkEntry(exp: (typeof p.experience)[number]) {
  const current = /present|current/i.test(exp.end_date);
  return {
    company: exp.company,
    title: exp.title.replace(/\s*\((Part-Time|Contract|Volunteer)\)\s*/i, ''),
    startDate: exp.start_date,
    endDate: current ? '' : exp.end_date,
    current,
    description: exp.bullets.join('\n'),
  };
}

function toEducationEntry(edu: (typeof p.education)[number]) {
  // "B.A. Computer Science" → degree + field
  const m = edu.degree.match(/^(B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?)\s+(.*)$/i);
  const yearMatch = edu.graduation_year.match(/\d{4}/);
  return {
    school: edu.school,
    degree: m ? m[1] : edu.degree,
    field: m ? m[2] : '',
    graduationYear: yearMatch ? yearMatch[0] : edu.graduation_year,
  };
}

// Years of experience: since the first professional software role (RTI, Feb 2025).
const yearsOfExperience = Math.max(
  1,
  Math.floor((Date.now() - new Date('2025-02-01').getTime()) / (365.25 * 24 * 3600 * 1000))
);

// Plain-text resume context for the extension's AI features. Assembled from the
// same strict selection — no unverified claims enter the AI context either.
const contactLine = [
  master.identity.contact.location,
  master.identity.contact.phone,
  master.identity.contact.email,
  master.identity.contact.linkedin,
  master.identity.contact.github,
  master.identity.contact.portfolio,
]
  .filter(Boolean)
  .join(' | ');

// ── Skills categorization ────────────────────────────────────────────────────
//
// master.skills is already grouped (programming, ai_development, ml, ...),
// but those groups don't line up with resume-facing categories at the
// granularity a reader expects — `programming` alone mixes true languages
// (Python), frontend frameworks (React), and a backend runtime (Node.js).
// This is a hand-built, item-level regrouping into resume-shaped
// categories instead of a pass-through of the raw group names. Every real
// item ends up in exactly one category below; nothing is invented, and an
// item present in more than one raw group is grouped once here to avoid
// ever printing it twice.
//
// selectProfile()'s flat `p.skills` (already verification-filtered — an
// unverified skill is excluded here in `verification: 'strict'` mode the
// same as everywhere else) is the source of truth for *which* items are
// allowed through; this only decides *where* an allowed item is printed.
const verifiedSkills = new Set(p.skills);
const SKILL_CATEGORIES: Array<[string, string[]]> = [
  ['Languages', ['Python', 'JavaScript', 'TypeScript', 'SQL', 'C++', 'Java', 'MATLAB', 'HTML', 'CSS', 'SCSS/Sass']],
  ['Frontend', ['React', 'React Native', 'Next.js', 'Three.js', 'Framer Motion', 'Bootstrap', 'Owl Carousel', 'Magnific Popup', 'Waypoints']],
  ['Backend & Databases', ['Node.js/Express', 'REST APIs', 'MongoDB', 'Redis', 'Firebase', 'database design & normalization (ER/EER, 3NF)', 'Telegram Bot API']],
  ['Infrastructure', ['Docker', 'CI/CD', 'Vercel', 'deployment', 'JWT authentication', 'Chrome extension development']],
  ['Applied AI', ['Claude and Claude Code (CLI)', 'Cursor', 'Replit', 'ChatGPT/OpenAI API', 'Gemini API', 'Google Stitch', 'Claude Design (experimenting)', 'local LLM deployment', 'prompt engineering', 'context engineering', 'AI agents & chatbots', 'multi-agent architecture']],
  ['Automation & Data', [
    'GoHighLevel', 'Clover POS', 'Keap', 'Mailchimp', 'Zapier', 'Make', 'n8n', 'sales funnel design',
    'pipeline & opportunity management', 'lead generation', 'system configuration', 'software integrations',
    'SEO', 'SEMrush', 'GT-Metrix', 'Google Analytics', 'Google Business Profile', 'Tableau',
    'email campaign segmentation', 'social media management', 'wireframing', 'short-form video production',
    'Microsoft Office', 'PyTorch', 'YOLOv5', 'Roboflow', 'predictive modeling (Prophet, ARIMA, XGBoost/LightGBM)',
    'time-series forecasting', 'feature engineering', 'NLP',
  ]],
  ['Design & Creative', ['Figma', 'Canva', 'Adobe Photoshop', 'Adobe Premiere Pro', 'iMovie', 'WordPress', 'Shopify', 'Google Veo', 'Seedance (testing)', 'ChatGPT image generation']],
  ['Additional', ['Psychology', 'Geopolitics', 'Strategy', 'Emerging Tech Trends', 'Natural Science', 'Philosophy', 'History', 'Fluent Bengali', 'Conversational Hindi', 'Conversational Urdu']],
];
const categorized = new Set(SKILL_CATEGORIES.flatMap(([, items]) => items));
// Anything in master.skills this mapping doesn't yet know about (a skill
// added later and never slotted into a category above) still needs a home
// rather than silently vanishing from every export.
const uncategorized = p.skills.filter((s) => !categorized.has(s));
const skillLines = [
  ...SKILL_CATEGORIES.map(([label, items]) => {
    const present = items.filter((s) => verifiedSkills.has(s));
    return present.length ? `${label}: ${present.join(', ')}` : null;
  }),
  uncategorized.length ? `Additional: ${uncategorized.join(', ')}` : null,
].filter((line): line is string => Boolean(line));

const resumeText = [
  `${p.name}`,
  contactLine,
  '',
  'EXPERIENCE',
  // Company + location on the header line (with dates, so
  // resume-parser.ts's matchEntryHeader finds the trailing date range and
  // renders it flush right), title on its own line below as a subtitle —
  // matches the owner's reference resume format (resume-render.ts already
  // renders a subtitle line in italics; this was previously "Title —
  // Company (dates)" all on one line instead).
  ...p.experience.map(
    (e) => `${e.company}, ${e.location} (${e.start_date} - ${e.end_date})\n${e.title}\n${e.bullets.map((b) => `- ${b}`).join('\n')}`
  ),
  '',
  'PROJECTS',
  // selectProfile()'s UserProfileShape.projects doesn't carry a `dates`
  // field through even though master.projects has one — matched by name
  // (stagedProj in master-profile.ts is a *filtered* subset of
  // master.projects, so index position isn't reliable the way it is for
  // education's straight 1:1 map).
  ...p.projects.map((pr) => {
    const dates = master.projects.find((mp) => mp.name === pr.name)?.dates;
    const header = dates ? `${pr.name} (${dates})` : pr.name;
    return `${header}\n${pr.bullets.map((b) => `- ${b}`).join('\n')}`;
  }),
  '',
  'EDUCATION',
  // selectProfile()'s UserProfileShape (shared with apps/web) doesn't carry
  // `minors` through, so it's pulled directly from the raw master record
  // here rather than widening that shared type for one extension-only
  // field. Certifications are deliberately NOT added here — the two in
  // master-profile.json are `"verified": false` with an explicit rule 9
  // note ("exact certification name and year unconfirmed"), and this
  // export already runs `verification: 'strict'` specifically to keep
  // unconfirmed claims out of AI-facing text.
  ...p.education.map((e, i) => {
    // Index-based, not string-matched: selectProfile's education mapping
    // (master-profile.ts) is a straight 1:1 `.map()` with no filtering, so
    // p.education[i] always corresponds to master.education[i] — and
    // p.education[i].school has the location appended
    // ("Riverside State University..., Flushing, NY"), which never string-matches
    // master.education[i].school ("Riverside State University...") directly.
    const minors = master.education[i]?.minors;
    const minorsSuffix = minors?.length ? ` | ${minors.join(' | ')}` : '';
    return `${e.degree}, ${e.school}, ${e.graduation_year}${minorsSuffix}`;
  }),
  '',
  ...skillLines,
].join('\n');

// ── Assemble the extension bundle ────────────────────────────────────────────

const search = master.search;

const bundle = {
  // Consumed by the extension's import path (src/onboarding).
  format: 'bekar-apply-profile',
  version: 1,
  generated: new Date().toISOString(),
  profile: {
    personal: {
      firstName,
      ...(middleName ? { middleName } : {}),
      lastName,
      email: master.identity.contact.email,
      phone,
      location,
    },
    professional: {
      linkedin: master.identity.contact.linkedin,
      github: master.identity.contact.github,
      portfolio: master.identity.contact.portfolio,
      yearsOfExperience,
    },
    work: p.experience.map(toWorkEntry),
    education: p.education.map(toEducationEntry),
    skills: p.skills,
    resumeText,
    workAuth: {
      requiresSponsorship: search.work_authorization.needs_sponsorship,
      legallyAuthorized: search.work_authorization.authorized_in.includes('United States'),
    },
    lastUpdated: Date.now(),
  },
  answerBank,
  voiceNotes,
};

writeFileSync(outPath, JSON.stringify(bundle, null, 2) + '\n');

// ── Rule 5 / rule 8 reporting ────────────────────────────────────────────────

console.log(`✓ wrote ${path.relative(repoRoot, outPath)}`);
console.log(`  entries: ${bundle.profile.work.length} work, ${p.projects.length} projects (resumeText), ${bundle.profile.skills.length} skills, ${answerBank.length} answer-bank items`);

if (sel.excluded.length) {
  console.log('\nCuts (rule 5 — strict verification and defaults):');
  for (const e of sel.excluded) console.log(`  - ${e.id}: ${e.reason}`);
}
if (sel.unverified.length) {
  console.log('\nStill unverified on the exported profile (rule 9 — flag, do not assert):');
  for (const u of sel.unverified) console.log(`  - ${u.where}: ${u.note}`);
}
