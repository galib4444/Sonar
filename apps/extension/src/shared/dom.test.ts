// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { isTrustedATSIframe, classifyPage, extractFormSchema } from './dom';

// jsdom doesn't implement CSS.escape — extractFormSchema's selector generator
// needs it. Real browsers always have it; this is a test-environment-only gap.
if (typeof CSS === 'undefined') {
  (globalThis as unknown as { CSS: { escape: (s: string) => string } }).CSS = {
    escape: (s: string) => s.replace(/([^\w-])/g, '\\$1'),
  };
} else if (!CSS.escape) {
  (CSS as unknown as { escape: (s: string) => string }).escape = (s: string) => s.replace(/([^\w-])/g, '\\$1');
}

// ── isTrustedATSIframe ────────────────────────────────────────────────────────

describe('isTrustedATSIframe', () => {
  it('returns false for empty src', () => {
    expect(isTrustedATSIframe('')).toBe(false);
  });

  it('returns false for about:blank', () => {
    expect(isTrustedATSIframe('about:blank')).toBe(false);
  });

  it('returns false for javascript: URL', () => {
    expect(isTrustedATSIframe('javascript:void(0)')).toBe(false);
  });

  it('returns false for a random third-party URL', () => {
    expect(isTrustedATSIframe('https://www.google.com/search')).toBe(false);
  });

  it('returns false for malformed URL', () => {
    expect(isTrustedATSIframe('not-a-url')).toBe(false);
  });

  // ── Trusted ATS hostnames ──────────────────────────────────────────────────

  it('returns true for greenhouse.io iframe', () => {
    expect(isTrustedATSIframe('https://boards.greenhouse.io/acme/jobs/123')).toBe(true);
  });

  it('returns true for job-boards.greenhouse.io iframe', () => {
    expect(isTrustedATSIframe('https://job-boards.greenhouse.io/acme/jobs/456')).toBe(true);
  });

  it('returns true for lever.co iframe', () => {
    expect(isTrustedATSIframe('https://jobs.lever.co/acme/abc-def')).toBe(true);
  });

  it('returns true for workday.com iframe', () => {
    expect(isTrustedATSIframe('https://acme.myworkdayjobs.com/jobs/apply')).toBe(true);
  });

  it('returns true for ashbyhq.com iframe', () => {
    expect(isTrustedATSIframe('https://app.ashbyhq.com/jobs/abc')).toBe(true);
  });

  it('returns true for smartrecruiters.com iframe', () => {
    expect(isTrustedATSIframe('https://jobs.smartrecruiters.com/Acme/123')).toBe(true);
  });

  it('returns true for bamboohr.com iframe', () => {
    expect(isTrustedATSIframe('https://acme.bamboohr.com/jobs/apply')).toBe(true);
  });

  it('returns true for workable.com iframe', () => {
    expect(isTrustedATSIframe('https://apply.workable.com/acme/j/123')).toBe(true);
  });

  it('returns true for icims.com iframe', () => {
    expect(isTrustedATSIframe('https://acme.icims.com/jobs/123/apply')).toBe(true);
  });

  it('returns true for taleo.net iframe', () => {
    expect(isTrustedATSIframe('https://acme.taleo.net/careersection/apply')).toBe(true);
  });

  it('returns true for hire.withgoogle.com iframe', () => {
    expect(isTrustedATSIframe('https://hire.withgoogle.com/jobs/acme/123')).toBe(true);
  });

  // ── Subdomain matching ─────────────────────────────────────────────────────

  it('accepts deep subdomain of a trusted ATS', () => {
    expect(isTrustedATSIframe('https://careers.acme.bamboohr.com/jobs/apply')).toBe(true);
  });

  it('rejects a domain that merely contains a trusted ATS name as a substring', () => {
    // "fakegreenhouse.io" is not a subdomain of greenhouse.io
    expect(isTrustedATSIframe('https://fakegreenhouse.io/jobs')).toBe(false);
  });

  it('rejects a domain where trusted ATS appears as a path segment only', () => {
    expect(isTrustedATSIframe('https://example.com/greenhouse.io/jobs')).toBe(false);
  });
});

// ── classifyPage (jsdom environment) ─────────────────────────────────────────

describe('classifyPage', () => {
  beforeEach(() => {
    // Reset document between tests
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    // Remove all iframes
    document.querySelectorAll('iframe').forEach(el => el.remove());
  });

  function setLocation(href: string) {
    // jsdom allows setting location via window.location.assign or direct
    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL(href),
    });
  }

  it('returns JOB_APPLICATION_PAGE when a trusted ATS iframe is present', () => {
    setLocation('https://wiz.com/careers/software-engineer');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://boards.greenhouse.io/wiz/jobs/123';
    document.body.appendChild(iframe);

    const result = classifyPage();
    expect(result.state).toBe('JOB_APPLICATION_PAGE');
    expect(result.hasTrustedATSIframe).toBe(true);
    expect(result.parentFillSuppressed).toBe(true);
  });

  it('returns NOT_JOB_PAGE for a generic non-job URL with no form', () => {
    setLocation('https://example.com/about-us');
    document.body.innerHTML = '<p>About us page</p>';

    const result = classifyPage();
    expect(result.state).toBe('NOT_JOB_PAGE');
  });

  it('returns JOB_POSTING_PAGE for a job-URL with no real form', () => {
    setLocation('https://wiz.com/jobs/software-engineer-123');
    // Only an apply button — no substantial form
    document.body.innerHTML = '<a href="/apply">Apply Now</a>';

    const result = classifyPage();
    expect(result.state).toBe('JOB_POSTING_PAGE');
  });

  it('returns JOB_APPLICATION_PAGE for a URL with a substantial form (≥4 inputs)', () => {
    setLocation('https://startup.com/apply');
    document.body.innerHTML = `
      <form>
        <input type="text" name="firstName" />
        <input type="text" name="lastName" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <textarea name="coverLetter"></textarea>
      </form>
    `;

    const result = classifyPage();
    expect(result.state).toBe('JOB_APPLICATION_PAGE');
  });

  it('returns NOT_JOB_PAGE for a small form (< 4 fields) on a generic URL', () => {
    setLocation('https://example.com/contact');
    // Only 3 fields — does not meet the 4-field threshold for a "substantial form"
    document.body.innerHTML = `
      <form>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <textarea name="message"></textarea>
      </form>
    `;

    const result = classifyPage();
    expect(result.state).toBe('NOT_JOB_PAGE');
  });

  it('suppresses parent fill when ATS iframe is found', () => {
    setLocation('https://company.com/jobs/engineer');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://app.ashbyhq.com/jobs/123/apply';
    document.body.appendChild(iframe);

    const result = classifyPage();
    expect(result.parentFillSuppressed).toBe(true);
    expect(result.hasTrustedATSIframe).toBe(true);
  });

  it('does not suppress parent fill when no ATS iframe is present', () => {
    setLocation('https://startup.com/apply');
    document.body.innerHTML = `
      <form>
        <input type="text" name="firstName" />
        <input type="text" name="lastName" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
      </form>
    `;

    const result = classifyPage();
    expect(result.parentFillSuppressed).toBe(false);
  });

  // Regression for a real bug: an internal HR nomination form hosted on Google Forms
  // (e.g. a district's substitute-teacher nomination survey) has none of the career-site
  // signals — the URL isn't /jobs/ or /apply, there are no ATS query params, and its
  // "Submit" button doesn't match "apply|submit application". Its only tell is
  // employment-only question content (SSN, EEO self-ID, referral source). Without those
  // as job-content signals this stayed NOT_JOB_PAGE, so lastJobMeta was never set and
  // both submit-time learning and the manual "Learn my correction" action silently no-op'd.
  it('returns JOB_APPLICATION_PAGE for a Google Forms-style HR nomination form with no career-site wording', () => {
    setLocation('https://docs.google.com/forms/d/e/abc123/viewform');
    document.body.innerHTML = `
      <form>
        <label>Date</label><input type="date" name="date" />
        <label>Last 4 digits of the Social Security Number</label><input type="text" name="ssn" />
        <label>Female</label><input type="radio" name="gender" value="Female" />
        <label>Male</label><input type="radio" name="gender" value="Male" />
        <label>Non-Binary</label><input type="radio" name="gender" value="Non-Binary" />
        <input type="submit" value="Submit" />
      </form>
    `;

    const result = classifyPage();
    expect(result.state).toBe('JOB_APPLICATION_PAGE');
  });
});

// ── extractFormSchema — ARIA choice divs (Google Forms) ────────────────────────
// Regression for a real bug: Google Forms renders radio/checkbox questions as
// <div role="radio"|"checkbox"> instead of a native <input>. Before this fix
// such a div fell through extractFormSchema's type detection to a default of
// 'textarea', which the fill dispatcher in content.ts can't act on — it
// matched fine but then failed with "Unsupported element type" at fill time.

describe('extractFormSchema — ARIA radio/checkbox divs', () => {
  it('types a <div role="radio"> as "radio", not "textarea"', () => {
    document.body.innerHTML = `
      <div role="listitem">
        <div role="heading">What is your current gender identity?</div>
        <div role="radio" aria-checked="false" id="opt-male">Male</div>
        <div role="radio" aria-checked="false" id="opt-female">Female</div>
      </div>
    `;
    const fields = extractFormSchema(document);
    const male = fields.find(f => f.id === 'opt-male');
    expect(male).toBeDefined();
    expect(male?.type).toBe('radio');
  });

  it('types a <div role="checkbox"> as "checkbox", not "textarea"', () => {
    document.body.innerHTML = `
      <div role="listitem">
        <div role="heading">Which benefits matter to you?</div>
        <div role="checkbox" aria-checked="false" id="opt-health">Health insurance</div>
      </div>
    `;
    const fields = extractFormSchema(document);
    const health = fields.find(f => f.id === 'opt-health');
    expect(health).toBeDefined();
    expect(health?.type).toBe('checkbox');
  });

  it('reads aria-checked="true" as a "checked" valuePreview', () => {
    document.body.innerHTML = `
      <div role="listitem">
        <div role="heading">Do you agree?</div>
        <div role="radio" aria-checked="true" id="opt-yes">Yes</div>
      </div>
    `;
    const fields = extractFormSchema(document);
    const yes = fields.find(f => f.id === 'opt-yes');
    expect(yes?.valuePreview).toBe('checked');
  });

  // Regression for a real bug found via the debug log: a "Please select the
  // Borough..." question filled in "Staten Island" — an answer with no
  // connection to the profile at all. Cause: every option div in the group
  // shares one [role="listitem"] wrapper, so Strategy 3b (the question
  // heading) resolved to the *same* label for all five options, and
  // whichever one the per-option matchers evaluated last ended up selected.
  // Each option's own visible text must win here, not the shared heading.
  it('gives each option in a radio group its own label, not the shared question heading', () => {
    document.body.innerHTML = `
      <div role="listitem">
        <div role="heading">Please select the Borough you are interested in providing substitute service.</div>
        <div role="radio" aria-checked="false" id="opt-bronx">The Bronx</div>
        <div role="radio" aria-checked="false" id="opt-brooklyn">Brooklyn</div>
        <div role="radio" aria-checked="false" id="opt-manhattan">Manhattan</div>
        <div role="radio" aria-checked="false" id="opt-queens">Queens</div>
        <div role="radio" aria-checked="false" id="opt-staten">Staten Island</div>
      </div>
    `;
    const fields = extractFormSchema(document);
    const labelFor = (id: string) => fields.find(f => f.id === id)?.label;
    expect(labelFor('opt-bronx')).toBe('The Bronx');
    expect(labelFor('opt-brooklyn')).toBe('Brooklyn');
    expect(labelFor('opt-manhattan')).toBe('Manhattan');
    expect(labelFor('opt-queens')).toBe('Queens');
    expect(labelFor('opt-staten')).toBe('Staten Island');
    // None of them should collapse to the shared question heading.
    const heading = 'Please select the Borough you are interested in providing substitute service.';
    for (const id of ['opt-bronx', 'opt-brooklyn', 'opt-manhattan', 'opt-queens', 'opt-staten']) {
      expect(labelFor(id)).not.toBe(heading);
    }
  });

  it('still resolves a plain text field to the shared question heading (no regression)', () => {
    document.body.innerHTML = `
      <div role="listitem">
        <div role="heading">First Name</div>
        <input type="text" id="first-name-input" />
      </div>
    `;
    const fields = extractFormSchema(document);
    const field = fields.find(f => f.id === 'first-name-input');
    expect(field?.label).toBe('First Name');
  });

  it('still types a native <input type="radio"> as "radio" (no regression)', () => {
    document.body.innerHTML = `
      <form>
        <label><input type="radio" name="gender" value="Male" id="native-male" /> Male</label>
      </form>
    `;
    const fields = extractFormSchema(document);
    const male = fields.find(f => f.id === 'native-male');
    expect(male?.type).toBe('radio');
  });
});
