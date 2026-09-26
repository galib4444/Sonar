import { describe, it, expect } from 'vitest';
import { parseResume, serializeForPrompt, reassembleResume, buildHeadline, ResumeParseError } from './resume-parser';
import { extractGuardTokens, isGrounded } from './resume-output-guard';

const RESUME = `Jordan Rivera
Springfield, NY 10001 | (555) 010-0199 | jordan.rivera@example.com

EXPERIENCE
Associate, AI & Software Engineering (Part-Time) — Riverside Tech Incubator (RTI) (Feb 2025 - Present)
- Built a sales funnel for Blue Lantern Cafe, a restaurant client, using GoHighLevel.
- Implemented a website redesign and automation using React, Three.js.
AI Trainer (Contract) — Acme AI Labs (Dec 2025 - Present)
- Benchmarked model performance against realistic tasks and trajectories.
Founder — Northwind (Nov 2023 - Mar 2026)
- Conducted market research using GT-Metrix and SEMrush.

EDUCATION
B.A. Computer Science, Riverside State University, Flushing, NY, 2026

SKILLS: Python, JavaScript, TypeScript, React`;

function allowedTokensFor(resumeText: string): Set<string> {
  return extractGuardTokens(resumeText);
}

function alwaysAllowed(): boolean {
  return true;
}

describe('parseResume', () => {
  const parsed = parseResume(RESUME);

  it('captures the name and contact line as preamble, untouched by section logic', () => {
    expect(parsed.preambleLines).toEqual([
      'Jordan Rivera',
      'Springfield, NY 10001 | (555) 010-0199 | jordan.rivera@example.com',
    ]);
  });

  it('creates one entries-kind section for EXPERIENCE with three entries in order', () => {
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    expect(experience?.kind).toBe('entries');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    expect(experience.entries).toHaveLength(3);
    expect(experience.entries[0].headerLine).toContain('Riverside Tech Incubator (RTI)');
    expect(experience.entries[1].headerLine).toContain('Acme AI Labs');
    expect(experience.entries[2].headerLine).toContain('Northwind');
  });

  it('gives entries a flat, globally sequential id — not scoped to their section', () => {
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    // Flat "e1"/"e2" shape matters: it must match what the AI prompt's JSON
    // contract describes an entry ID as looking like (resume-tailor-service.ts).
    expect(experience.entries.map((e) => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('gives each bullet a stable id scoped to its entry', () => {
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    expect(experience.entries[0].bullets.map((b) => b.id)).toEqual([
      `${experience.entries[0].id}-b1`,
      `${experience.entries[0].id}-b2`,
    ]);
  });

  it('treats EDUCATION as a prose section, kept verbatim', () => {
    const education = parsed.sections.find((s) => s.heading === 'EDUCATION');
    expect(education?.kind).toBe('prose');
    if (education?.kind !== 'prose') throw new Error('unreachable');
    expect(education.lines[0]).toContain('B.A. Computer Science');
  });

  it('treats an inline "SKILLS: ..." header as a list section with one item per skill', () => {
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    expect(skills?.kind).toBe('list');
    if (skills?.kind !== 'list') throw new Error('unreachable');
    expect(skills.items.map((i) => i.text)).toEqual(['Python', 'JavaScript', 'TypeScript', 'React']);
  });

  it('does not throw on well-formed input (round-trip invariant holds)', () => {
    expect(() => parseResume(RESUME)).not.toThrow();
  });
});

describe('parseResume — multiple undated entries in one section', () => {
  // Regression case for a real bug this session: a PROJECTS section with
  // several undated entries back to back only recognized the *first* line
  // as an entry header. Every title after it fell through to the paragraph
  // fallback and got glued onto the previous entry as an extra line —
  // silently merging six real, distinct projects into one entry, with the
  // other five projects' bullets now sharing that one entry's ID. Since
  // reassembleResume maps a response's `bullets[entryId]` array positionally
  // onto an entry's bullets, this meant a bullet written for "Drone
  // Detection" could be rewritten in the prompt context of "AI Job
  // Application Platform" — a real content-scrambling fabrication vector
  // that survived the ID-based architecture entirely.
  const PROJECTS_RESUME = `Jordan Rivera
contact line

PROJECTS
AI Job Application Platform (Hackathon Project)
- Built an 8-agent architecture.
- Implemented JWT authentication.
Retail Sales Analytics (Student Consultant)
- Collaborated with a project team.
- Conducted data preprocessing.
Drone Detection System (Personal Project)
- Developed a real-time detection system using YOLO.
- Optimized the detection pipeline.`;

  it('creates one entry per project, not one entry for the whole section', () => {
    const parsed = parseResume(PROJECTS_RESUME);
    const projects = parsed.sections.find((s) => s.heading === 'PROJECTS');
    if (projects?.kind !== 'entries') throw new Error('unreachable');
    expect(projects.entries).toHaveLength(3);
    expect(projects.entries.map((e) => e.headerLine)).toEqual([
      'AI Job Application Platform (Hackathon Project)',
      'Retail Sales Analytics (Student Consultant)',
      'Drone Detection System (Personal Project)',
    ]);
  });

  it("scopes each project's bullets to that project alone, not the whole section", () => {
    const parsed = parseResume(PROJECTS_RESUME);
    const projects = parsed.sections.find((s) => s.heading === 'PROJECTS');
    if (projects?.kind !== 'entries') throw new Error('unreachable');
    const [platform, retail, drone] = projects.entries;
    expect(platform.bullets.map((b) => b.text)).toEqual([
      'Built an 8-agent architecture.',
      'Implemented JWT authentication.',
    ]);
    expect(retail.bullets.map((b) => b.text)).toEqual([
      'Collaborated with a project team.',
      'Conducted data preprocessing.',
    ]);
    expect(drone.bullets.map((b) => b.text)).toEqual([
      'Developed a real-time detection system using YOLO.',
      'Optimized the detection pipeline.',
    ]);
  });

  it('gives each project entry its own ID, so each can be independently kept, dropped, or reworded', () => {
    const parsed = parseResume(PROJECTS_RESUME);
    const projects = parsed.sections.find((s) => s.heading === 'PROJECTS');
    if (projects?.kind !== 'entries') throw new Error('unreachable');
    const ids = projects.entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(3); // all distinct
  });

  it('still treats a non-bullet line immediately after an entry header as its subtitle, not a new entry', () => {
    const parsed = parseResume('Name\ncontact\n\nEXPERIENCE\nAcme Corp\nSenior Engineer\n- Did the work.');
    const experience = parsed.sections.find((s) => s.heading === 'EXPERIENCE');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    expect(experience.entries).toHaveLength(1);
    expect(experience.entries[0].subtitleLine).toBe('Senior Engineer');
  });
});

describe('serializeForPrompt', () => {
  it('tags entries and list sections with their id, and shows bullets as plain unlabeled lines', () => {
    const parsed = parseResume(RESUME);
    const serialized = serializeForPrompt(parsed);
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    if (experience?.kind !== 'entries' || skills?.kind !== 'list') throw new Error('unreachable');

    expect(serialized).toContain(`[ENTRY ${experience.entries[0].id}] ${experience.entries[0].headerLine}`);
    expect(serialized).toContain(`[LIST ${skills.id}]`);
    // Bullets carry no visible ID of their own — the response contract
    // addresses them by array position under their entry's ID, not a
    // separate bullet ID, so showing one here would invite the model to key
    // its response by it instead (which reassembleResume never reads).
    expect(serialized).toContain(`- ${experience.entries[0].bullets[0].text}`);
    expect(serialized).not.toContain('[BULLET');
  });
});

describe('reassembleResume — header fabrication is structurally impossible', () => {
  const parsed = parseResume(RESUME);
  const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
  if (experience?.kind !== 'entries') throw new Error('unreachable');
  const [rtiEntry, handshakeEntry] = experience.entries;

  it('re-emits both real headers verbatim no matter what the response puts in "bullets" — a header can never be rewritten', () => {
    // Simulates the live merged-entry bug: reassembleResume never reads
    // header text from the response at all, so a fabricated header string
    // can only ever land as bullet *content* under the correct entry, never
    // replace an entry's actual header.
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id, handshakeEntry.id],
      bullets: {
        [rtiEntry.id]: ['Associate, Performance Optimization Team (Part-Time) — Acme AI Labs (Dec 2025 - Present)'],
      },
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain(rtiEntry.headerLine);
    expect(text).toContain(handshakeEntry.headerLine);
    // Structurally guaranteed regardless of the grounding guard: this text
    // can appear at most once, as a bullet line, never as a second header.
    const headerShaped = /^Associate, Performance Optimization Team.*\(Dec 2025 - Present\)$/m;
    expect(text).not.toMatch(headerShaped);
  });

  it('a grounding-checked pipeline also rejects the fabricated text outright, since none of its words appear in the real resume', () => {
    const allowed = allowedTokensFor(RESUME);
    const { text, rejectedCount } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id, handshakeEntry.id],
      bullets: {
        [rtiEntry.id]: ['Associate, Performance Optimization Team (Part-Time) — Acme AI Labs (Dec 2025 - Present)'],
      },
    }, { isBulletAllowed: (t) => isGrounded(t, allowed) });

    expect(text).not.toContain('Performance Optimization Team');
    expect(text).toContain(rtiEntry.bullets[0].text); // fell back to the original bullet
    expect(rejectedCount).toBe(1);
  });

  it('drops (never inserts) an ungrounded added bullet that fabricates the target company as a past employer', () => {
    const allowed = allowedTokensFor(RESUME);
    const { text } = reassembleResume(parsed, {
      keepEntries: experience.entries.map((e) => e.id),
      addedBullets: {
        [rtiEntry.id]: ['Collaborated directly with Anthropic on model evaluation pipelines.'],
      },
    }, {
      isBulletAllowed: (t) => isGrounded(t, allowed),
      maxExtraBulletsPerEntry: 1,
    });

    expect(text).not.toContain('Anthropic');
  });

  it('an added bullet never displaces a real rewrite, even when the response omits it', () => {
    // Guards the fix for the ambiguous-truncation bug: a genuinely new
    // bullet only ever comes from `addedBullets`, so `bullets` is always
    // capped to the entry's original count — there's no scenario where an
    // "extra" proposed string in `bullets` eats a later real bullet's slot.
    const allowed = allowedTokensFor(RESUME);
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id],
      bullets: {
        [rtiEntry.id]: [
          'Used GoHighLevel to build a sales funnel for Blue Lantern Cafe.',
          'Used React and Three.js to redesign the website.',
          'Extra string beyond the original bullet count, should be ignored.',
        ],
      },
    }, { isBulletAllowed: (t) => isGrounded(t, allowed) });

    expect(text).toContain('Used GoHighLevel to build a sales funnel for Blue Lantern Cafe.');
    expect(text).toContain('Used React and Three.js to redesign the website.');
    expect(text).not.toContain('Extra string beyond');
  });

  it('falls back to the original bullet wording when a proposed rewrite is ungrounded', () => {
    const allowed = allowedTokensFor(RESUME);
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id],
      bullets: {
        [rtiEntry.id]: ['Grew signups by 340% for a Fortune 500 client.', rtiEntry.bullets[1].text],
      },
    }, { isBulletAllowed: (t) => isGrounded(t, allowed) });

    expect(text).toContain(rtiEntry.bullets[0].text);
    expect(text).not.toContain('340%');
  });

  it('pads a shorter bullets proposal back with the original tail by default (chat refinement needs this: a response addressing only bullet 1 must not be read as "drop everything after it")', () => {
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id],
      bullets: { [rtiEntry.id]: ['Only the first bullet was reworded.'] },
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain('Only the first bullet was reworded.');
    // The second original bullet was never addressed — default behavior
    // keeps it rather than silently dropping it.
    expect(text).toContain(rtiEntry.bullets[1].text);
  });

  it('drops the unaddressed tail when dropUnaddressedBullets is set (fresh tailoring: a per-entry rewrite call asked for "your best few" must actually shrink the entry, not have the rest padded back on)', () => {
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id],
      bullets: { [rtiEntry.id]: ['Only the first bullet was reworded.'] },
    }, { isBulletAllowed: alwaysAllowed, dropUnaddressedBullets: true });

    expect(text).toContain('Only the first bullet was reworded.');
    expect(text).not.toContain(rtiEntry.bullets[1].text);
  });

  it('keeps a grounded rewrite that only reuses facts already in the resume', () => {
    const allowed = allowedTokensFor(RESUME);
    const reworded = 'Optimized the sales funnel for Blue Lantern Cafe using GoHighLevel.';
    const { text, contentChanged } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id],
      bullets: { [rtiEntry.id]: [reworded, rtiEntry.bullets[1].text] },
    }, { isBulletAllowed: (t) => isGrounded(t, allowed) });

    expect(text).toContain(reworded);
    expect(contentChanged).toBe(true);
  });

  it('drops a single entry within a section without dropping the whole section', () => {
    const { text } = reassembleResume(parsed, {
      keepEntries: [rtiEntry.id, handshakeEntry.id], // Northwind omitted
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain(rtiEntry.headerLine);
    expect(text).not.toContain('Northwind');
  });

  it('keeps every entry in a section the response never mentions at all', () => {
    const { text } = reassembleResume(parsed, {
      keepEntries: ['some-other-section-entry-id'],
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain(rtiEntry.headerLine);
    expect(text).toContain(handshakeEntry.headerLine);
    expect(text).toContain('Northwind');
  });
});

describe('reassembleResume — loud no-op detection', () => {
  it('idsMatched is false when the response references no real IDs at all', () => {
    // Simulates a model that echoed the prompt's own example IDs instead of
    // the actual tagged resume it was given — resume-tailor-service.ts
    // treats this the same as a JSON parse failure, not a silent success.
    const parsed = parseResume(RESUME);
    const { idsMatched, contentChanged, rejectedCount } = reassembleResume(parsed, {
      keepEntries: ['e999', 'e998'],
      bullets: { e999: ['some rewrite'] },
    }, { isBulletAllowed: alwaysAllowed });

    expect(idsMatched).toBe(false);
    expect(contentChanged).toBe(false);
    expect(rejectedCount).toBe(0);
  });

  it('idsMatched is true once entries are reordered/dropped, even with zero bullet rewording', () => {
    // Regression case from a real Ollama run: the model correctly dropped
    // two irrelevant jobs but reworded no bullets at all. That's a
    // well-formed response (idsMatched) that achieved almost nothing as
    // *tailoring* (contentChanged stays false) — the two signals must stay
    // independent so resume-tailor-service.ts can treat them differently
    // (hard failure vs. a soft warning).
    const parsed = parseResume(RESUME);
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    const { idsMatched, contentChanged } = reassembleResume(parsed, {
      keepEntries: [experience.entries[1].id, experience.entries[0].id],
    }, { isBulletAllowed: alwaysAllowed });

    expect(idsMatched).toBe(true);
    expect(contentChanged).toBe(false);
  });

  it('contentChanged is true once a bullet is actually reworded', () => {
    const parsed = parseResume(RESUME);
    const experience = parsed.sections.find((s) => s.kind === 'entries' && s.heading === 'EXPERIENCE');
    if (experience?.kind !== 'entries') throw new Error('unreachable');
    const rti = experience.entries[0];
    const { idsMatched, contentChanged } = reassembleResume(parsed, {
      keepEntries: [rti.id],
      bullets: { [rti.id]: ['Optimized the sales funnel for Blue Lantern Cafe using GoHighLevel.', rti.bullets[1].text] },
    }, { isBulletAllowed: alwaysAllowed });

    expect(idsMatched).toBe(true);
    expect(contentChanged).toBe(true);
  });
});

describe('reassembleResume — skills list', () => {
  it('only keeps skills that exactly match an original item, in the requested order', () => {
    const parsed = parseResume(RESUME);
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    if (skills?.kind !== 'list') throw new Error('unreachable');

    const { text } = reassembleResume(parsed, {
      lists: { [skills.id]: ['React', 'Python', 'Rust'] }, // "Rust" was never listed
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain('React, Python');
    expect(text).not.toContain('Rust');
  });

  it('drops a whole list section when the response gives it an empty array', () => {
    const parsed = parseResume(RESUME);
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    if (skills?.kind !== 'list') throw new Error('unreachable');

    const result = reassembleResume(parsed, { lists: { [skills.id]: [] } }, { isBulletAllowed: alwaysAllowed });

    expect(result.text).not.toContain('SKILLS');
    expect(result.idsMatched).toBe(true);
    expect(result.contentChanged).toBe(true);
  });

  it('keeps the original list unchanged if the response gives nothing that matches', () => {
    const parsed = parseResume(RESUME);
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    if (skills?.kind !== 'list') throw new Error('unreachable');

    const { text } = reassembleResume(parsed, {
      lists: { [skills.id]: ['Rust', 'Go'] },
    }, { isBulletAllowed: alwaysAllowed });

    expect(text).toContain('Python, JavaScript, TypeScript, React');
  });

  it('re-emits the list in the same inline "Heading: items" shape a second parse pass recognizes as a list again', () => {
    // Regression case: emitting "SKILLS" and its items as two separate
    // lines makes a second parseResume pass (chat refinement re-parsing
    // this very output) fall through to the plain-paragraph case, which
    // collapses every item into one unsplittable string.
    const parsed = parseResume(RESUME);
    const skills = parsed.sections.find((s) => s.heading === 'SKILLS');
    if (skills?.kind !== 'list') throw new Error('unreachable');

    const { text } = reassembleResume(parsed, {}, { isBulletAllowed: alwaysAllowed });
    const reparsed = parseResume(text);
    const reparsedSkills = reparsed.sections.find((s) => s.heading === 'SKILLS');
    expect(reparsedSkills?.kind).toBe('list');
    if (reparsedSkills?.kind !== 'list') throw new Error('unreachable');
    expect(reparsedSkills.items.map((i) => i.text)).toEqual(['Python', 'JavaScript', 'TypeScript', 'React']);
  });
});

describe('parseResume — ResumeParseError is exported for callers to catch', () => {
  it('is a real Error subclass', () => {
    const err = new ResumeParseError('test', 'some line');
    expect(err).toBeInstanceOf(Error);
    expect(err.line).toBe('some line');
  });
});

describe('buildHeadline', () => {
  const parsed = parseResume(RESUME);
  const now = new Date(2026, 8, 14); // 2026-09-14, fixed so the years-of-experience math is deterministic

  it('picks the first current ("Present") entry in document order, not the most recently started one', () => {
    // RESUME lists RTI (Feb 2025 - Present) before the later-started
    // Acme AI Labs (Dec 2025 - Present) — RTI is the candidate's own
    // primary role by resume order, so it should win over Acme AI Labs
    // despite starting earlier.
    const headline = buildHeadline(parsed, now);
    expect(headline?.title).toBe('Associate, AI & Software Engineering');
  });

  it('prefers the subtitle line for the title in the stacked "Company, Location (dates)" / "Title" format', () => {
    // Regression case: export-extension-profile.ts now emits entries as
    // "Company, Location (dates)" on the header line with the title on
    // its own subtitle line below (matching a real reference resume's
    // format), instead of the older "Title — Company (dates)" all on one
    // line. buildHeadline's title extraction used to split the header
    // line on an em dash, which no longer exists in the stacked format —
    // confirmed live: it returned the company name as the "title" instead.
    const stacked = parseResume(
      'Jordan Rivera\njordan@example.com\n\nEXPERIENCE\n' +
      'Riverside Tech Incubator (RTI), Flushing, NY (Feb 2025 - Present)\n' +
      'Associate, AI & Software Engineering (Part-Time)\n' +
      '- Built things.'
    );
    const headline = buildHeadline(stacked, now);
    expect(headline?.title).toBe('Associate, AI & Software Engineering');
  });

  it('drops one trailing parenthetical qualifier from the title', () => {
    const headline = buildHeadline(parsed, now);
    expect(headline?.title).not.toContain('(Part-Time)');
  });

  it('computes years of experience from the CURRENT entry\'s own start date, floored, never rounded up — not the resume\'s earliest entry', () => {
    // Regression case: an earlier version measured from the earliest start
    // across every EXPERIENCE entry (Northwind, Nov 2023), which inflates the
    // figure with time spent in older, unrelated roles once a fuller
    // profile export is used — confirmed live: doing that turned a real
    // "2+ Years" headline into a misleading "6+ Years" once older
    // part-time jobs were included in the source data. The correct anchor
    // is the CURRENT entry's own start (RTI, Feb 2025): Feb 2025 -> Sep
    // 2026 is 1 year 7 months, which must floor to 1, not round up, and
    // must not be pulled back further by Northwind's earlier start.
    const headline = buildHeadline(parsed, now);
    expect(headline?.yearsOfExperience).toBe(1);
  });

  it('never uses the target job posting\'s title -- buildHeadline takes no job-description input at all', () => {
    // Structural guarantee, not just a behavioral one: there's no
    // jobDescription parameter for a posting's title to enter through.
    expect(buildHeadline.length).toBeLessThanOrEqual(2);
  });

  it('returns null when there is no parseable EXPERIENCE section rather than guessing', () => {
    const noExperience = parseResume('Jordan Rivera\njordan@example.com\n\nEDUCATION\nB.A. Computer Science, Riverside State University, 2026');
    expect(buildHeadline(noExperience, now)).toBeNull();
  });
});
