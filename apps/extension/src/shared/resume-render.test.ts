import { describe, it, expect } from 'vitest';
import { renderResumeHtml, buildPrintDocument } from './resume-render';

const PLAIN_TEXT_RESUME = `Jordan Rivera
Springfield, NY 10001 | (555) 010-0199 | jordan.rivera@example.com

EXPERIENCE
Associate, AI & Software Engineering (Part-Time) — Riverside Tech Incubator (RTI) (Feb 2025 - Present)
- Built a sales funnel for Blue Lantern Cafe, a restaurant client, using GoHighLevel.
- Implemented a website redesign and automation using React, Three.js.
Founder — Northwind (Nov 2023 - Mar 2026)
- Conducted market research using GT-Metrix and SEMrush.

EDUCATION
B.A. Computer Science, Riverside State University, Flushing, NY, 2026

SKILLS: Python, JavaScript, TypeScript, React`;

describe('renderResumeHtml — plain-text AI output', () => {
  const html = renderResumeHtml(PLAIN_TEXT_RESUME);

  it('renders the name as a heading, not fused into the next line', () => {
    expect(html).toContain('<h1 class="resume-name">Jordan Rivera</h1>');
  });

  it('renders the contact line separately from the name', () => {
    expect(html).toContain('<p class="resume-contact">Springfield, NY 10001 | (555) 010-0199 | jordan.rivera@example.com</p>');
  });

  it('detects ALL-CAPS section headers with no markdown markers', () => {
    expect(html).toContain('<h2 class="resume-section">EXPERIENCE</h2>');
    expect(html).toContain('<h2 class="resume-section">EDUCATION</h2>');
  });

  it('detects a section heading followed by inline content on the same line', () => {
    expect(html).toContain('<h2 class="resume-section">SKILLS</h2>');
  });

  it('splits an entry line ending in a date range into org + flush-right dates', () => {
    expect(html).toContain('resume-entry-org">Founder — Northwind</span>');
    expect(html).toContain('resume-entry-dates">Nov 2023 - Mar 2026</span>');
  });

  it('renders bare-dash bullets as real list items', () => {
    expect(html).toContain('<li>Conducted market research using GT-Metrix and SEMrush.</li>');
  });

  it('never leaves a raw literal newline for the browser to collapse into a space', () => {
    // The old regex-only approach fused "...10001" and "| (347)..." etc. onto
    // one line because a single \n survived into the HTML as text content.
    expect(html).not.toMatch(/Jordan Rivera\s+Springfield/);
  });
});

describe('renderResumeHtml — bullet character variants', () => {
  it('recognizes a bare bullet character, not just markdown dashes', () => {
    const html = renderResumeHtml('EXPERIENCE\n• Did a thing well.');
    expect(html).toContain('<li>Did a thing well.</li>');
  });
});

describe('renderResumeHtml — Markdown input still works', () => {
  const md = `# Jane Doe

## Experience

- Shipped feature X
- Fixed bug Y

## Education

- B.S. Computer Science`;
  const html = renderResumeHtml(md);

  it('still converts # to a name heading', () => {
    expect(html).toContain('<h1 class="resume-name">Jane Doe</h1>');
  });

  it('still converts ## to a section heading', () => {
    expect(html).toContain('<h2 class="resume-section">Experience</h2>');
  });

  it('still converts - bullets to list items', () => {
    expect(html).toContain('<li>Shipped feature X</li>');
  });
});

describe('renderResumeHtml — undated entry under an entry-type section', () => {
  it('renders the first line of an EXPERIENCE section as an entry header even without a date', () => {
    const html = renderResumeHtml('EXPERIENCE\nSelf-employed Consultant\n- Did consulting work.');
    expect(html).toContain('resume-entry-org">Self-employed Consultant</span>');
  });

  it('renders every undated entry in a row as its own entry header, not just the first', () => {
    // Regression case: a PROJECTS section with several undated entries back
    // to back used to only recognize the first line as an entry header —
    // every title after it fell through to the plain-paragraph case and got
    // glued onto the *previous* entry, silently merging a later project's
    // real bullets into an earlier, unrelated project.
    const html = renderResumeHtml(
      'PROJECTS\nProject One\n- Built the first thing.\nProject Two\n- Built the second thing.\nProject Three\n- Built the third thing.'
    );
    expect(html).toContain('resume-entry-org">Project One</span>');
    expect(html).toContain('resume-entry-org">Project Two</span>');
    expect(html).toContain('resume-entry-org">Project Three</span>');
    // Each entry's own header immediately precedes its own bullet list —
    // titles are not all stacked together before any bullets.
    const projectTwoIndex = html.indexOf('Project Two');
    const secondBulletIndex = html.indexOf('Built the second thing');
    const projectThreeIndex = html.indexOf('Project Three');
    expect(projectTwoIndex).toBeLessThan(secondBulletIndex);
    expect(secondBulletIndex).toBeLessThan(projectThreeIndex);
  });

  it('still treats a non-bullet line immediately after an entry header as its subtitle, not a new entry', () => {
    const html = renderResumeHtml('EXPERIENCE\nAcme Corp\nSenior Engineer\n- Did the work.');
    expect(html).toContain('resume-entry-org">Acme Corp</span>');
    expect(html).toContain('resume-subtitle">Senior Engineer</p>');
  });
});

describe('buildPrintDocument', () => {
  it('defaults to a 0.5in margin when none is given', () => {
    const doc = buildPrintDocument('<p>hi</p>');
    expect(doc).toContain('@page { size: letter; margin: 0.5in; }');
    expect(doc).toContain('padding: 0.5in;');
  });

  it('uses a custom margin in both the @page rule and the body padding', () => {
    const doc = buildPrintDocument('<p>hi</p>', 0.75);
    expect(doc).toContain('@page { size: letter; margin: 0.75in; }');
    expect(doc).toContain('padding: 0.75in;');
    expect(doc).not.toContain('0.5in');
  });

  it('drops the body padding when printing, so paper margins are not doubled', () => {
    const doc = buildPrintDocument('<p>hi</p>');
    expect(doc).toContain('@media print { body { padding: 0; } }');
  });

  it('wraps the given HTML inside .resume-doc', () => {
    const doc = buildPrintDocument('<p>unique-marker-text</p>');
    expect(doc).toContain('<div class="resume-doc">\n<p>unique-marker-text</p>\n</div>');
  });
});

