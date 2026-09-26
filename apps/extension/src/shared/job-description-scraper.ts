/**
 * Job description scraper — extracts the full job description text for
 * cover letter generation. Because the application form is often on a
 * different page from the JD, this module:
 *  1. Scrapes the current page for any visible JD text.
 *  2. Falls back to meta/OG tags, JSON-LD structured data, etc.
 *  3. Can be fed a URL to fetch the JD from the original posting page.
 */

/**
 * How much to trust that `description` is actually the job posting and
 * nothing else:
 *   'high'   — structured data (JSON-LD JobPosting) or a selector specific
 *              to a known ATS's JD container. These can't accidentally
 *              capture the application form below the posting.
 *   'medium' — an OG/meta description. Usually clean, but short and
 *              sometimes generic.
 *   'low'    — a generic landmark (`main`, `article`, `[role="main"]`) or
 *              `document.body` itself. On a page that renders the posting
 *              and the application form as one continuous block (common on
 *              Greenhouse and similar), this captures both — the exact
 *              failure mode that once produced an AI response summarizing
 *              the job's own "Resume/CV:" and "Personal Preferences:" form
 *              fields instead of tailoring a resume. `stripApplicationFormNoise()`
 *              is a backstop for this tier, not a substitute for the caller
 *              treating a 'low' result as something to double-check.
 */
export type ExtractionConfidence = 'high' | 'medium' | 'low';

export interface JobDescription {
  title: string;
  company: string;
  description: string;       // full JD body text
  requirements: string[];    // extracted bullet requirements (best-effort)
  location: string | null;
  source: 'current-page' | 'structured-data' | 'meta-tags' | 'referrer' | 'manual';
  confidence: ExtractionConfidence;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Best-effort scrape of the job description from the current page.
 * Combines multiple strategies and returns the richest result.
 */
export function scrapeJobDescription(
  fallbackTitle?: string | null,
  fallbackCompany?: string | null,
): JobDescription {
  const raw = scrapeJobDescriptionRaw(fallbackTitle, fallbackCompany);
  const description = stripApplicationFormNoise(raw.description);
  return {
    ...raw,
    description,
    requirements: description === raw.description ? raw.requirements : extractBullets(description),
  };
}

function scrapeJobDescriptionRaw(
  fallbackTitle?: string | null,
  fallbackCompany?: string | null,
): JobDescription {
  // Strategy 1: JSON-LD structured data (most reliable when present)
  const jsonLd = extractFromJsonLd();
  if (jsonLd && jsonLd.description.length > 100) {
    return {
      ...jsonLd,
      title: jsonLd.title || fallbackTitle || '',
      company: jsonLd.company || fallbackCompany || '',
      confidence: 'high',
    } as JobDescription;
  }

  // Strategy 2: selectors specific to a known ATS's JD container — none of
  // these are generic enough to also match the application form.
  const container = extractFromKnownContainers();
  if (container && container.length > 100) {
    return {
      title: fallbackTitle || extractTitle() || '',
      company: fallbackCompany || extractCompany() || '',
      description: container,
      requirements: extractBullets(container),
      location: extractLocation(),
      source: 'current-page',
      confidence: 'high',
    };
  }

  // Strategy 3: OG / meta description
  const meta = extractFromMeta();
  if (meta && meta.length > 60) {
    return {
      title: fallbackTitle || extractTitle() || '',
      company: fallbackCompany || extractCompany() || '',
      description: meta,
      requirements: extractBullets(meta),
      location: extractLocation(),
      source: 'meta-tags',
      confidence: 'medium',
    };
  }

  // Strategy 4: a generic landmark or document.body — the tier that can
  // capture the application form along with the posting. Callers should
  // treat this confidence as "ask the user to double-check", not silently
  // trust it just because stripApplicationFormNoise() ran on it.
  const largestBlock = extractLargestTextBlock();
  return {
    title: fallbackTitle || extractTitle() || '',
    company: fallbackCompany || extractCompany() || '',
    description: largestBlock,
    requirements: extractBullets(largestBlock),
    location: extractLocation(),
    source: 'current-page',
    confidence: 'low',
  };
}

// ── Application-form noise stripping ────────────────────────────────────────

/**
 * Many ATS pages (Greenhouse and similar) render the job posting and the
 * application form as one continuous landmark, so a broad selector like
 * `[role="main"]` or `main` — used by both the container and largest-block
 * strategies above — captures the posting AND the form below it: name/email
 * fields, the full country/phone-code list, the EEOC voluntary
 * self-identification survey (race, disability, veteran status), and the
 * arbitration agreement. None of that is the job description, all of it is
 * either noise or sensitive-looking demographic/legal boilerplate that has no
 * business in a resume-tailoring prompt — and feeding it in has caused an AI
 * provider to decline the request outright rather than tailor the resume.
 *
 * These markers are specific to application-form chrome, never to job
 * description prose, so cutting at the earliest one found is safe: it only
 * ever removes text that was never part of the posting.
 */
const APPLICATION_FORM_MARKERS = [
  // These come first in the document on most ATS pages (Greenhouse and
  // similar render "Create a Job Alert" / "Apply for this job" as the
  // section heading immediately above the actual form) — catching the form
  // at its real start means everything after it (relocation/start-date
  // questions, "Resume/CV: ..." field descriptions, self-ID, arbitration)
  // never needs its own marker.
  'create a job alert',
  'apply for this job',
  'indicates a required field',
  'voluntary self-identification',
  'agreement to arbitrate',
  'form cc-305',
  'race & ethnicity definitions',
  'resume/cv*',
  'first name*last name*',
  'first name*\nlast name*',
];

export function stripApplicationFormNoise(text: string): string {
  const lower = text.toLowerCase();
  let cutAt = -1;
  for (const marker of APPLICATION_FORM_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx !== -1 && (cutAt === -1 || idx < cutAt)) cutAt = idx;
  }
  return cutAt === -1 ? text : text.slice(0, cutAt).trim();
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────

function extractFromJsonLd(): Partial<JobDescription> | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      const data = JSON.parse(script.textContent || '');
      // Could be an array or a single object
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'JobPosting') {
          return {
            title: item.title || item.name || null,
            company: item.hiringOrganization?.name || null,
            description: stripHtml(item.description || ''),
            requirements: extractBullets(stripHtml(item.description || '')),
            location: item.jobLocation?.address?.addressLocality || null,
            source: 'structured-data',
          };
        }
      }
    }
  } catch { /* ignore parse errors */ }
  return null;
}

// ── Known ATS containers ────────────────────────────────────────────────────

/**
 * Deliberately excludes generic landmarks like `article`, `.description`,
 * and `[role="main"]` — those match the application form just as readily as
 * the posting on pages that render both as one block, which is exactly how
 * this container list once let a dirty JD through even though a "known
 * container" strategy sounds like it should be safe. Every selector here is
 * specific enough to a named ATS's actual JD markup that it can't also match
 * a name/email/resume-upload form. Anything broader belongs in
 * extractLargestTextBlock()'s low-confidence tier instead.
 */
function extractFromKnownContainers(): string | null {
  const selectors = [
    // Greenhouse
    '#content .job-post-content',
    '#content #job_description',
    '.job-description',
    '.job__description',
    // Lever
    '.posting-page .section-wrapper',
    '.posting-categories + .section-wrapper',
    '[data-qa="job-description"]',
    // Workday
    '[data-automation-id="jobPostingDescription"]',
    '.css-cygeeu', // Workday common JD class
    // Ashby
    '.ashby-job-posting-description',
    // Generic but still name-specific to a JD, not a landmark role
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="job_description"]',
    '[id*="job-description"]',
    '[id*="jobDescription"]',
    '[id*="job_description"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = extractVisibleText(el as HTMLElement);
      if (text.length > 100) return text;
    }
  }
  return null;
}

// ── Meta / OG ───────────────────────────────────────────────────────────────

function extractFromMeta(): string | null {
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  if (ogDesc && ogDesc.length > 60) return ogDesc;
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (metaDesc && metaDesc.length > 60) return metaDesc;
  return null;
}

// ── Largest text block ──────────────────────────────────────────────────────

function extractLargestTextBlock(): string {
  const candidates = document.querySelectorAll('main, article, section, .content, [role="main"], #content, #main');
  let best = '';
  for (const el of candidates) {
    const text = extractVisibleText(el as HTMLElement);
    if (text.length > best.length) best = text;
  }
  // Fallback: body
  if (best.length < 100) {
    best = extractVisibleText(document.body);
  }
  // Cap at ~6000 chars to avoid blowing up the LLM context
  return best.slice(0, 6000);
}

// ── Helpers (title, company, location) ──────────────────────────────────────

function extractTitle(): string | null {
  const h1 = document.querySelector('h1');
  if (h1) {
    const t = h1.textContent?.trim();
    if (t && t.length > 3 && t.length < 200) return t;
  }
  return document.title?.split(/[|\-–—]/).map(s => s.trim()).filter(s => s.length > 3)[0] || null;
}

function extractCompany(): string | null {
  const og = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  if (og) return og;
  try {
    return new URL(window.location.href).hostname.replace(/^www\./, '').split('.')[0] || null;
  } catch { return null; }
}

function extractLocation(): string | null {
  const locationSelectors = [
    '[class*="location"]', '[data-testid*="location"]',
    '[class*="Location"]', '.job-location',
  ];
  for (const sel of locationSelectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 2 && text.length < 100) return text;
  }
  return null;
}

// ── Text utilities ──────────────────────────────────────────────────────────

function extractVisibleText(root: HTMLElement): string {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const parts: string[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text) parts.push(text);
  }
  return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// A JSON-LD JobPosting's `description` field is itself HTML (e.g.
// "<h4>Compensation Philosophy:</h4><p>We offer...</p>"). `.textContent`
// concatenates text nodes with zero inserted whitespace at block-element
// boundaries — it's a CSS/rendering concept, not something present in the
// text nodes themselves — so stripping tags naively collapsed real JD text
// into glued-together words ("Compensation Philosophy:We offer...",
// "BenefitsBenefits include..."), confirmed live on a real Ashby-hosted
// posting. Inserting an explicit newline at each block boundary in the
// HTML *string* before parsing means `.textContent` sees real whitespace
// there instead of none.
function stripHtml(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|ul|ol|section|article|header|footer|tr|table)>/gi, '\n');
  const d = new DOMParser().parseFromString(withBreaks, 'text/html');
  return (d.body.textContent || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBullets(text: string): string[] {
  // Split on newlines / bullet chars, filter short noise
  return text
    .split(/[\n•·▪-]/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 300);
}
