/**
 * Job types + local compatibility scoring.
 *
 * PRIVACY LOCK: this extension does NOT query any job board. It used to hit
 * Adzuna / Remotive / Arbeitnow; that code and its host permissions were
 * removed. Job discovery lives in `Sonar/apps/scanner`, which runs on
 * infrastructure you control. `searchJobs()` is kept only as an inert stub so
 * the "Job Discovery" page still compiles; it always returns nothing.
 */

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  url: string;
  directUrl?: string;
  postedDate: string;
  source: string;
  category?: string;
}

export interface JobSearchFilters {
  keywords: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  daysPosted?: number;
  page?: number;
  resultsPerPage?: number;
  country?: string;
  sortBy?: 'default' | 'date' | 'salary' | 'relevance' | 'hybrid';
  fullTime?: boolean;
  partTime?: boolean;
  permanent?: boolean;
  contract?: boolean;
}

export interface JobSearchResult {
  jobs: JobListing[];
  totalResults: number;
  page: number;
  totalPages: number;
}

/** Inert. No network. Always empty. See the privacy-lock note above. */
export async function searchJobs(_filters: JobSearchFilters): Promise<JobSearchResult> {
  return { jobs: [], totalResults: 0, page: 1, totalPages: 0 };
}

/**
 * Local, offline relevance score (0–100) for a job vs. the user's skills and
 * years of experience. Pure function — no I/O.
 */
export function computeCompatibilityScore(
  job: JobListing,
  profileSkills: string[],
  profileYears?: number,
): number {
  if (!profileSkills.length) return 50;

  const text = `${job.title} ${job.description}`.toLowerCase();
  let matched = 0;
  for (const skill of profileSkills) {
    if (text.includes(skill.toLowerCase())) matched++;
  }
  const skillScore = (matched / Math.max(profileSkills.length, 1)) * 100;

  let levelScore = 50;
  if (profileYears !== undefined) {
    const isSenior = text.includes('senior') || text.includes('lead') || text.includes('staff');
    const isJunior = text.includes('junior') || text.includes('entry') || text.includes('associate');
    if (isSenior && profileYears >= 5) levelScore = 90;
    else if (isSenior && profileYears < 3) levelScore = 20;
    else if (isJunior && profileYears <= 3) levelScore = 90;
    else if (isJunior && profileYears > 5) levelScore = 30;
    else levelScore = 60;
  }

  return Math.round(skillScore * 0.7 + levelScore * 0.3);
}
