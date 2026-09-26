// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { stripApplicationFormNoise, scrapeJobDescription } from './job-description-scraper';

describe('stripApplicationFormNoise', () => {
  it('leaves ordinary job description text untouched', () => {
    const jd = 'We are looking for a Senior Engineer with 5 years of Python experience.';
    expect(stripApplicationFormNoise(jd)).toBe(jd);
  });

  it('cuts off the EEOC voluntary self-identification survey', () => {
    const jd = 'About the role: build great software.\n\nVoluntary Self-Identification\nGender: Select...';
    expect(stripApplicationFormNoise(jd)).toBe('About the role: build great software.');
  });

  it('cuts off the arbitration agreement', () => {
    const jd = 'Responsibilities include shipping code.\n\nAgreement to Arbitrate\nI understand and agree...';
    expect(stripApplicationFormNoise(jd)).toBe('Responsibilities include shipping code.');
  });

  it('cuts at the earliest marker when more than one is present', () => {
    const jd = [
      'Job posting body.',
      'Resume/CV*Attach',
      'Voluntary Self-Identification',
    ].join('\n\n');
    expect(stripApplicationFormNoise(jd)).toBe('Job posting body.');
  });

  it('cuts off the entire application form at "Apply for this job", including the logistics/salary section that comes just before it in the real posting', () => {
    const jd = [
      'About the role: build great software.',
      'Logistics',
      'Minimum education: Bachelor\'s degree',
      'Apply for this job*indicates a required field',
      'First Name*Last Name*Email*',
      'Resume/CV: Please ensure to provide either your LinkedIn profile or Resume.',
      'Personal Preferences:',
      'How do you pronounce your name?',
    ].join('\n\n');
    const result = stripApplicationFormNoise(jd);
    expect(result).toContain('Logistics');
    expect(result).toContain('Minimum education');
    expect(result).not.toContain('Apply for this job');
    expect(result).not.toContain('Resume/CV');
    expect(result).not.toContain('Personal Preferences');
    expect(result).not.toContain('pronounce your name');
  });
});

describe('scrapeJobDescription — confidence tiers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    // jsdom never computes real layout, so getBoundingClientRect() always
    // reports a zero-size rect — extractVisibleText()'s visibility check
    // would reject every element's text as a result. Stub it so the
    // scraper's actual selector/priority logic is what's under test here,
    // not jsdom's lack of a layout engine.
    Element.prototype.getBoundingClientRect = () =>
      ({ width: 100, height: 20, top: 0, left: 0, bottom: 20, right: 100, x: 0, y: 0, toJSON() {} }) as DOMRect;
  });

  it('is high confidence for JSON-LD structured data', () => {
    const longDescription = 'We need a Senior Engineer. '.repeat(10);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@type': 'JobPosting',
      title: 'Senior Engineer',
      description: longDescription,
    });
    document.head.appendChild(script);

    const result = scrapeJobDescription();
    expect(result.confidence).toBe('high');
    expect(result.source).toBe('structured-data');
  });

  it('inserts whitespace at block-element boundaries when a JSON-LD description is itself HTML', () => {
    // Regression case: confirmed live on a real Ashby-hosted posting — a
    // JSON-LD JobPosting's `description` field is commonly HTML
    // ("<h4>...</h4><p>...</p>"), and stripping tags via raw .textContent
    // concatenates text nodes with zero inserted whitespace at block
    // boundaries (a CSS/rendering concept, not present in the text nodes
    // themselves), collapsing real JD text into glued-together words like
    // "Compensation Philosophy:We offer..." and "BenefitsBenefits include...".
    const htmlDescription =
      '<h4>Compensation Philosophy:</h4><p>We offer competitive compensation.</p>' +
      '<h4>Benefits</h4><p>Benefits include medical, dental, and vision coverage.</p>' +
      ' padding text to clear the length threshold '.repeat(3);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@type': 'JobPosting',
      title: 'Deployed Engineer',
      description: htmlDescription,
    });
    document.head.appendChild(script);

    const result = scrapeJobDescription();
    expect(result.description).not.toContain('Philosophy:We');
    expect(result.description).not.toContain('BenefitsBenefits');
    expect(result.description).toContain('Compensation Philosophy:');
    expect(result.description).toContain('We offer competitive compensation.');
  });

  it('is high confidence for an ATS-specific selector', () => {
    const el = document.createElement('div');
    el.className = 'job-description';
    el.textContent = 'We need a Senior Engineer with 5 years of experience. '.repeat(5);
    document.body.appendChild(el);

    const result = scrapeJobDescription();
    expect(result.confidence).toBe('high');
  });

  it('is low confidence when only a generic landmark matches (no JSON-LD, no ATS-specific selector)', () => {
    const main = document.createElement('main');
    main.textContent = 'We need a Senior Engineer with 5 years of experience. '.repeat(5);
    document.body.appendChild(main);

    const result = scrapeJobDescription();
    expect(result.confidence).toBe('low');
  });

  it('is medium confidence for a bare meta description with no other signal', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'A great job at a great company looking for a great engineer to join the team.');
    document.head.appendChild(meta);

    const result = scrapeJobDescription();
    expect(result.confidence).toBe('medium');
    expect(result.source).toBe('meta-tags');
  });
});
