/**
 * Master Profile — types + adapter.
 *
 * `master-profile.json` is the structured source of truth for the owner's resume
 * facts, hand-built from `Jordan_Rivera_MASTER_Resume_Aug2026.pdf` and
 * cross-checked against `resume-build-rules.md`.
 *
 * It is deliberately RICHER than the app's runtime `UserProfile`: every bullet
 * carries a `verified` flag and themes. This file projects it down to the shape
 * HustlerAI's `lib/types.ts` expects, and exposes the verification gate that
 * rule 8 item 4 requires ("anything still unverified ... that affects this resume").
 *
 * Rule 1: never repopulate the JSON from a tailored resume, from cv.md, or from
 * /api/parse-resume. PDF extraction is how the stale-file errors come back.
 */

// ============================================
// Master profile types (source of truth)
// ============================================

export type Theme =
  | 'engineering'
  | 'ai'
  | 'client'
  | 'training'
  | 'data'
  | 'ops'
  | 'marketing'
  | 'leadership'
  | 'it'
  | 'product';

export interface Bullet {
  id: string;
  text: string;
  /** False means the claim is not confirmed. See `verification_note`. */
  verified: boolean;
  verification_note?: string;
  /** Non-blocking context (e.g. a rule 1 correction this bullet encodes). */
  note?: string;
  themes?: Theme[];
  /** Fine-grained keywords (e.g. "nodejs", "llm") carried from the 2026-09-15 profile. */
  tags?: string[];
}

export interface BulletGroup {
  label: string;
  bullets: Bullet[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  location: string;
  title: string;
  start_date: string;
  end_date: string;
  /** Whether this entry is a default candidate for a one-page resume. */
  include_by_default: boolean;
  /** False means the entry header itself (usually the title) is unconfirmed. */
  verified: boolean;
  verification_note?: string;
  note?: string;
  /** Sub-headed bullets (RTI). Mutually exclusive with `bullets` in practice. */
  groups?: BulletGroup[];
  bullets?: Bullet[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  dates: string;
  link?: string;
  technologies?: string[];
  include_by_default: boolean;
  /** Hard block — never include, regardless of role fit (rule 9). */
  blocked?: boolean;
  verified: boolean;
  verification_note?: string;
  note?: string;
  /** Codename (e.g. "Sonar"). `name` holds the descriptor, which is the resume default. */
  codename?: string;
  name_with_codename?: string;
  aliases?: string[];
  /** Private repo. Never render as a link; use `link` only once the repo is public. */
  repository?: string;
  repository_public?: boolean;
  scope_note?: string;
  publishability_note?: string;
  public_release_status?: string;
  bullets: Bullet[];
}

export interface EducationEntry {
  id: string;
  school: string;
  location: string;
  degree: string;
  graduation: string;
  graduation_year: string;
  minors?: string[];
  honors?: string[];
  coursework?: string[];
  verified: boolean;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  detail?: string;
  verified: boolean;
  verification_note?: string;
  note?: string;
}

export interface OpenItem {
  id: string;
  item: string;
  detail: string;
  /** ids of entries/bullets/fields this open item affects. */
  affects: string[];
  status: 'open' | 'blocking' | 'resolved';
  source: string;
}

export interface MasterProfile {
  schema_version: string;
  source: Record<string, unknown>;
  identity: {
    name: string;
    contact: {
      email: string;
      phone: string;
      location: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    contact_flags?: Array<{ field: string; verified: boolean; note: string }>;
  };
  search: Record<string, unknown>;
  education: EducationEntry[];
  certifications: CertificationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  ai_practice: Record<string, unknown>;
  skills: Record<string, string[]>;
  skill_flags?: Array<{ group: string; item: string; verified: boolean; note: string }>;
  expertise: string[];
  /** Honest gaps. Never render as positive claims; for interview answers only. */
  known_gaps?: Array<{ gap: string; source: string }>;
  open_items: OpenItem[];
}

// ============================================
// Target shape — mirrors HustlerAI lib/types.ts
// Structural, not imported, so this stays portable across the two repos.
// ============================================

export interface UserProfileShape {
  name: string;
  contact: MasterProfile['identity']['contact'];
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    link?: string;
    description?: string;
    bullets: string[];
    technologies?: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    graduation_year: string;
    gpa?: string;
    honors?: string;
    highlights?: string[];
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credential_id?: string;
    url?: string;
  }>;
  baseline_salary?: number;
}

// ============================================
// Selection + projection
// ============================================

export interface SelectOptions {
  /**
   * 'strict'  — drop unverified BULLETS, certifications, and skills.
   * 'flagged' — keep them, and return them in `unverified` for the rule 8 notes.
   * Default 'flagged': rule 9 says keep wording generic OR flag it, not always cut.
   *
   * Neither mode drops an ENTRY for being unverified. An unconfirmed job title
   * (e.g. a title pending payroll confirmation) is a labelling problem, not grounds for deleting the role and
   * every verified bullet under it. Entry-level flags always surface in
   * `unverified` so the caller can generalise the title or note it under rule 8.
   */
  verification?: 'strict' | 'flagged';
  /**
   * Themes to favour for this role. These RANK bullets (matching ones first),
   * they do not filter entries out. Rule 5 requires every cut to be deliberate
   * and stated; an entry silently vanishing because no bullet carried the right
   * tag is not a decision, it is an accident. Use `exclude` to actually cut.
   */
  themes?: Theme[];
  /** Cap bullets per entry after theme ranking. Omit for no cap. */
  maxBulletsPerEntry?: number;
  /**
   * Page-level bullet budget across the whole resume. After theme ranking,
   * lowest-ranked bullets are dropped from the longest entries first until the
   * total fits, never taking an entry below `minBulletsPerEntry`. Every dropped
   * bullet is recorded in `excluded` so rule 5's "state every cut explicitly"
   * can actually be honoured. Omit for no page cap.
   */
  maxBullets?: number;
  /** Floor an entry cannot be trimmed below by the page budget. Default 1. */
  minBulletsPerEntry?: number;
  /** Explicit entry/project ids to include, overriding `include_by_default`. */
  include?: string[];
  /** Explicit entry/project ids to exclude. Never overrides a `blocked` project. */
  exclude?: string[];
  /** Include entries whose `include_by_default` is false. */
  includeOptional?: boolean;
}

export interface SelectionResult {
  profile: UserProfileShape;
  /**
   * Master ids of every entry and project that made it into `profile`.
   * `UserProfileShape` mirrors the app's type and carries no ids, so this is how
   * callers map a rendered resume back to master entries — and how
   * `relevantOpenItems` knows what is actually on the page.
   */
  included_ids: string[];
  /** Every unconfirmed claim that survived into the profile. Feeds rule 8 item 4. */
  unverified: Array<{ id: string; where: string; note: string }>;
  /** Entries, projects, and bullets cut, with why. Feeds rule 5 / rule 8 item 2. */
  excluded: Array<{ id: string; reason: string }>;
  /**
   * Set when `maxBullets` was requested. `met: false` means every entry hit its
   * floor and the page still does not fit — rule 3's answer is then to cut a
   * whole entry or section, which is a decision for the caller, not a silent
   * trim here. Never let an unmet budget pass as a fitted page.
   */
  budget?: { requested: number; achieved: number; met: boolean };
}

function entryBullets(entry: ExperienceEntry): Bullet[] {
  if (entry.groups?.length) return entry.groups.flatMap((g) => g.bullets);
  return entry.bullets ?? [];
}

/**
 * Stable rank: bullets matching a wanted theme first, original order preserved
 * within each band. Never removes a bullet — ordering only, so the caller can
 * see everything and cut deliberately.
 */
function rankByThemes(bullets: Bullet[], themes?: Theme[]): Bullet[] {
  if (!themes?.length) return bullets;
  const hits: Bullet[] = [];
  const rest: Bullet[] = [];
  for (const b of bullets) {
    ((b.themes ?? []).some((t) => themes.includes(t)) ? hits : rest).push(b);
  }
  return [...hits, ...rest];
}

/**
 * Project the master profile down to the app's UserProfile, applying the
 * rules-driven selection gates. Nothing here rewrites text — selection only.
 * Rewriting is the tailor engine's job, and it must not invent.
 *
 * WHAT THIS DOES AND DOES NOT CUT. Without `maxBullets`, this returns the full
 * candidate superset, ordered by theme relevance. It is a ranking pass, not a
 * one-page fit: `themes` alone will never drop an entry, because an entry
 * vanishing on its own is not a decision anyone made (rule 5 requires every cut
 * be stated and reversible). The real page fit happens either by passing
 * `maxBullets` here — which records each dropped bullet in `excluded` — or
 * downstream in the tailor engine / editor. If it happens downstream, that
 * layer owns rule 5's "state every cut explicitly" obligation, not this one.
 */
export function selectProfile(
  master: MasterProfile,
  opts: SelectOptions = {}
): SelectionResult {
  const {
    verification = 'flagged',
    themes,
    maxBulletsPerEntry,
    maxBullets,
    minBulletsPerEntry,
    include = [],
    exclude = [],
    includeOptional = false,
  } = opts;

  const unverified: SelectionResult['unverified'] = [];
  const excluded: SelectionResult['excluded'] = [];

  const wanted = (id: string, byDefault: boolean): boolean => {
    if (exclude.includes(id)) return false;
    if (include.includes(id)) return true;
    return byDefault || includeOptional;
  };

  /** Entries staged with their Bullet objects, so the page budget can record ids. */
  const stagedExp: Array<{ id: string; head: Omit<UserProfileShape['experience'][number], 'bullets'>; bullets: Bullet[] }> = [];
  const stagedProj: Array<{ id: string; head: Omit<UserProfileShape['projects'][number], 'bullets'>; bullets: Bullet[] }> = [];

  // --- Experience ---
  for (const entry of master.experience) {
    if (!wanted(entry.id, entry.include_by_default)) {
      excluded.push({
        id: entry.id,
        reason: exclude.includes(entry.id)
          ? 'explicitly excluded'
          : 'not a default one-page candidate',
      });
      continue;
    }
    // An unverified entry is flagged, never dropped — see SelectOptions.verification.
    if (!entry.verified) {
      unverified.push({
        id: entry.id,
        where: `${entry.company} — ${entry.title}`,
        note: entry.verification_note ?? 'unverified',
      });
    }

    let bullets = entryBullets(entry).filter((b) => {
      if (b.verified) return true;
      if (verification === 'strict') return false;
      unverified.push({
        id: b.id,
        where: `${entry.company} — bullet`,
        note: b.verification_note ?? 'unverified',
      });
      return true;
    });
    bullets = rankByThemes(bullets, themes);
    if (maxBulletsPerEntry) bullets = bullets.slice(0, maxBulletsPerEntry);

    if (!bullets.length) {
      excluded.push({ id: entry.id, reason: 'no verified bullets remain' });
      continue;
    }

    stagedExp.push({
      id: entry.id,
      head: {
        title: entry.title,
        company: entry.company,
        location: entry.location,
        start_date: entry.start_date,
        end_date: entry.end_date,
      },
      bullets,
    });
  }

  // --- Projects ---
  for (const proj of master.projects) {
    if (proj.blocked) {
      excluded.push({ id: proj.id, reason: `BLOCKED: ${proj.verification_note ?? 'rule 9 block'}` });
      continue;
    }
    if (!wanted(proj.id, proj.include_by_default)) {
      excluded.push({
        id: proj.id,
        reason: exclude.includes(proj.id)
          ? 'explicitly excluded'
          : 'not a default one-page candidate',
      });
      continue;
    }
    if (!proj.verified) {
      unverified.push({
        id: proj.id,
        where: `project — ${proj.name}`,
        note: proj.verification_note ?? 'unverified',
      });
    }

    let bullets = proj.bullets.filter((b) => {
      if (b.verified) return true;
      if (verification === 'strict') return false;
      unverified.push({
        id: b.id,
        where: `${proj.name} — bullet`,
        note: b.verification_note ?? 'unverified',
      });
      return true;
    });
    bullets = rankByThemes(bullets, themes);
    if (maxBulletsPerEntry) bullets = bullets.slice(0, maxBulletsPerEntry);

    if (!bullets.length) {
      excluded.push({ id: proj.id, reason: 'no verified bullets remain' });
      continue;
    }

    stagedProj.push({
      id: proj.id,
      head: { name: proj.name, link: proj.link, technologies: proj.technologies },
      bullets,
    });
  }

  // --- Page budget (rule 3: cut whole units, and state every cut) ---
  let budget: SelectionResult['budget'];
  if (maxBullets) {
    const floor = minBulletsPerEntry ?? 1;
    const all = [...stagedExp, ...stagedProj];
    let total = all.reduce((n, s) => n + s.bullets.length, 0);
    // Trim from the longest entry first, always the lowest theme-ranked bullet.
    while (total > maxBullets) {
      const target = all
        .filter((s) => s.bullets.length > floor)
        .sort((a, b) => b.bullets.length - a.bullets.length)[0];
      if (!target) break; // every entry is at its floor — cannot trim further
      const dropped = target.bullets.pop()!;
      excluded.push({
        id: dropped.id,
        reason: `page budget: over ${maxBullets} bullets, lowest theme match in ${target.id}`,
      });
      total--;
    }
    budget = { requested: maxBullets, achieved: total, met: total <= maxBullets };
    if (!budget.met) {
      excluded.push({
        id: '__budget__',
        reason:
          `page budget NOT met: ${total} bullets against a ${maxBullets} target with ` +
          `${all.length} entries at a floor of ${floor}. Rule 3: cut a whole entry or ` +
          `section, or raise the budget. Do not shrink type or margins to fit.`,
      });
    }
  }

  const experience: UserProfileShape['experience'] = stagedExp.map((s) => ({
    ...s.head,
    bullets: s.bullets.map((b) => b.text),
  }));
  const projects: UserProfileShape['projects'] = stagedProj.map((s) => ({
    ...s.head,
    bullets: s.bullets.map((b) => b.text),
  }));
  const included_ids = [...stagedExp, ...stagedProj].map((s) => s.id);

  // --- Certifications ---
  const certifications = master.certifications
    .filter((c) => {
      if (c.verified) return true;
      if (verification === 'strict') return false;
      unverified.push({
        id: c.id,
        where: `certification — ${c.name}`,
        note: c.verification_note ?? 'unverified',
      });
      return true;
    })
    .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date }));

  // --- Education ---
  const education = master.education.map((e) => ({
    degree: e.degree,
    school: `${e.school}, ${e.location}`,
    graduation_year: e.graduation_year,
    honors: e.honors?.join('; '),
    highlights: e.coursework,
  }));

  // --- Skills ---
  const flaggedSkills = new Set(
    (master.skill_flags ?? []).filter((f) => !f.verified).map((f) => f.item)
  );
  const skills = Object.values(master.skills)
    .flat()
    .filter((s) => {
      if (!flaggedSkills.has(s)) return true;
      if (verification === 'strict') return false;
      const flag = (master.skill_flags ?? []).find((f) => f.item === s)!;
      unverified.push({ id: `skill:${s}`, where: `skills.${flag.group}`, note: flag.note });
      return true;
    });

  return {
    profile: {
      name: master.identity.name,
      contact: master.identity.contact,
      experience,
      projects,
      education,
      skills,
      certifications,
    },
    included_ids,
    unverified,
    excluded,
    budget,
  };
}

/**
 * Open items that touch anything actually on the page. Rule 8 item 4.
 *
 * Matches on master ids only — `affects` holds ids like "rti", never display
 * strings like "Riverside Tech Incubator (RTI)". Matching on the
 * projected company/project names silently reports nothing for any entry that
 * isn't independently flagged unverified.
 *
 * An open item whose every target was excluded does not surface: a resume that
 * omits a blocked project has no caveat for it to state.
 */
export function relevantOpenItems(master: MasterProfile, sel: SelectionResult): OpenItem[] {
  const present = new Set<string>([
    ...sel.included_ids,
    ...sel.unverified.map((u) => u.id),
  ]);
  // Contact-line items are keyed by field path and are on every resume that
  // carries the link at all.
  if (sel.profile.contact.portfolio) present.add('identity.contact.portfolio');
  if (sel.profile.contact.github) present.add('identity.contact.github');
  return master.open_items.filter(
    (oi) => oi.status !== 'resolved' && oi.affects.some((a) => present.has(a))
  );
}
