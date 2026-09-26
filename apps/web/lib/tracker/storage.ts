/**
 * Application Tracker Storage
 * In-memory storage for MVP (can be upgraded to DB later)
 */

import type { ApplicationRecord, BookmarkRecord, ApplicationStatus } from '../types';

// In-memory storage (would be replaced with DB in production)
const applications = new Map<string, ApplicationRecord>();
const bookmarks = new Map<string, BookmarkRecord>();

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a new application
 */
export function saveApplication(
  application: Omit<ApplicationRecord, 'id' | 'user_id'>
): { id: string; saved_at: string } {
  const id = generateId('app');
  const user_id = 'user_demo'; // For MVP, single user

  const record: ApplicationRecord = {
    ...application,
    id,
    user_id,
  };

  applications.set(id, record);

  return {
    id,
    saved_at: new Date().toISOString(),
  };
}

/**
 * Update an existing application
 */
export function updateApplication(
  id: string,
  updates: Partial<Omit<ApplicationRecord, 'id' | 'user_id'>>
): ApplicationRecord | null {
  const existing = applications.get(id);

  if (!existing) {
    return null;
  }

  const updated: ApplicationRecord = {
    ...existing,
    ...updates,
    last_updated: new Date(),
  };

  applications.set(id, updated);
  return updated;
}

/**
 * List applications with filters
 */
export function listApplications(filters?: {
  status?: ApplicationStatus[];
  min_match_score?: number;
  min_salary?: number;
  company?: string;
  sort_by?: 'roi_score' | 'match_score' | 'applied_date' | 'salary';
  limit?: number;
}): {
  applications: ApplicationRecord[];
  stats: {
    total: number;
    by_status: Record<ApplicationStatus, number>;
    avg_match_score: number;
    total_potential_earnings: number;
  };
} {
  let results = Array.from(applications.values());

  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      results = results.filter((app) => filters.status!.includes(app.status));
    }

    if (filters.min_match_score) {
      results = results.filter((app) => app.resume.match_score >= filters.min_match_score!);
    }

    if (filters.min_salary) {
      results = results.filter((app) => app.financial.salary_range.high >= filters.min_salary!);
    }

    if (filters.company) {
      const company_lower = filters.company.toLowerCase();
      results = results.filter((app) => app.job.company.toLowerCase().includes(company_lower));
    }

    // Sort
    const sort_by = filters.sort_by || 'roi_score';
    results.sort((a, b) => {
      switch (sort_by) {
        case 'roi_score':
          return b.financial.roi_score - a.financial.roi_score;
        case 'match_score':
          return b.resume.match_score - a.resume.match_score;
        case 'applied_date':
          return b.applied_date.getTime() - a.applied_date.getTime();
        case 'salary':
          return b.financial.salary_range.high - a.financial.salary_range.high;
        default:
          return 0;
      }
    });

    // Limit
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }
  }

  // Calculate stats
  const stats = calculateStats(Array.from(applications.values()));

  return { applications: results, stats };
}

/**
 * Get a single application by ID
 */
export function getApplication(id: string): ApplicationRecord | null {
  return applications.get(id) || null;
}

/**
 * Delete an application
 */
export function deleteApplication(id: string): boolean {
  return applications.delete(id);
}

/**
 * Calculate statistics for applications
 */
function calculateStats(apps: ApplicationRecord[]): {
  total: number;
  by_status: Record<ApplicationStatus, number>;
  avg_match_score: number;
  total_potential_earnings: number;
} {
  const by_status: Record<string, number> = {
    bookmarked: 0,
    ready_to_submit: 0,
    applied: 0,
    phone_screen: 0,
    onsite: 0,
    offer: 0,
    rejected: 0,
    accepted: 0,
    withdrawn: 0,
  };

  let total_match_score = 0;
  let total_potential_earnings = 0;

  for (const app of apps) {
    by_status[app.status] = (by_status[app.status] || 0) + 1;
    total_match_score += app.resume.match_score;
    total_potential_earnings += (app.financial.salary_range.low + app.financial.salary_range.high) / 2;
  }

  return {
    total: apps.length,
    by_status: by_status as Record<ApplicationStatus, number>,
    avg_match_score: apps.length > 0 ? Math.round(total_match_score / apps.length) : 0,
    total_potential_earnings: Math.round(total_potential_earnings),
  };
}

// ============================================
// Bookmarks Storage
// ============================================

/**
 * Save a bookmark
 */
export function saveBookmark(job: BookmarkRecord['job']): {
  bookmark_id: string;
  days_until_closing: number | undefined;
  priority: 'high' | 'medium' | 'low';
} {
  const id = generateId('bm');
  const user_id = 'user_demo';

  // Calculate priority based on closing date
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let days_until_closing: number | undefined;

  if (job.closing_date) {
    const now = new Date();
    const closing = new Date(job.closing_date);
    days_until_closing = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (days_until_closing <= 3) {
      priority = 'high';
    } else if (days_until_closing <= 7) {
      priority = 'medium';
    } else {
      priority = 'low';
    }
  }

  const bookmark: BookmarkRecord = {
    id,
    user_id,
    job,
    saved_date: new Date(),
    priority,
  };

  bookmarks.set(id, bookmark);

  return {
    bookmark_id: id,
    days_until_closing,
    priority,
  };
}

/**
 * Remove a bookmark
 */
export function removeBookmark(id: string): boolean {
  return bookmarks.delete(id);
}

/**
 * List all bookmarks
 */
export function listBookmarks(): BookmarkRecord[] {
  return Array.from(bookmarks.values()).sort((a, b) => {
    // Sort by priority (high first) then by saved date (recent first)
    const priority_order = { high: 0, medium: 1, low: 2 };
    const priority_diff = priority_order[a.priority] - priority_order[b.priority];

    if (priority_diff !== 0) return priority_diff;

    return b.saved_date.getTime() - a.saved_date.getTime();
  });
}

/**
 * Clear all data (for testing)
 */
export function clearAllData(): void {
  applications.clear();
  bookmarks.clear();
}

/**
 * Seed demo data for testing
 */
export function seedDemoData(): void {
  // Clear existing
  clearAllData();

  // Demo applications
  const demo_apps: Array<Omit<ApplicationRecord, 'id' | 'user_id'>> = [
    {
      job: {
        title: 'Senior Product Manager',
        company: 'Acme Corp',
        url: 'https://boards.greenhouse.io/acme/jobs/123',
        jd_text: 'We are looking for a Senior PM...',
        posted_date: new Date('2025-01-10'),
        closing_date: new Date('2025-02-01'),
      },
      resume: {
        pdf_url: '/resumes/acme_pm.pdf',
        match_score: 87,
        ats_score: 95,
      },
      star_answers: [],
      financial: {
        salary_range: { low: 120000, high: 160000 },
        roi_score: 280000,
        priority_score: 92,
        skill_growth_factor: 1.3,
      },
      status: 'applied',
      applied_date: new Date('2025-01-15'),
      last_updated: new Date('2025-01-15'),
      follow_ups: [],
      notes: '',
    },
    {
      job: {
        title: 'Staff Product Manager',
        company: 'TechCo',
        url: 'https://jobs.lever.co/techco/456',
        jd_text: 'We are hiring a Staff PM...',
        posted_date: new Date('2025-01-12'),
      },
      resume: {
        pdf_url: '/resumes/techco_staff_pm.pdf',
        match_score: 91,
        ats_score: 98,
      },
      star_answers: [],
      financial: {
        salary_range: { low: 180000, high: 250000 },
        roi_score: 310000,
        priority_score: 95,
        skill_growth_factor: 1.5,
      },
      status: 'phone_screen',
      applied_date: new Date('2025-01-16'),
      last_updated: new Date('2025-01-18'),
      follow_ups: [],
      notes: 'Phone screen scheduled for Jan 22',
      interview_notes: [
        {
          date: new Date('2025-01-18'),
          type: 'phone',
          notes: 'Great conversation with recruiter. Discussed compensation expectations.',
        },
      ],
    },
    {
      job: {
        title: 'Product Manager',
        company: 'StartupX',
        url: 'https://jobs.ashbyhq.com/startupx/789',
        jd_text: 'Join our fast-growing startup...',
        posted_date: new Date('2025-01-08'),
      },
      resume: {
        pdf_url: '/resumes/startupx_pm.pdf',
        match_score: 78,
        ats_score: 92,
      },
      star_answers: [],
      financial: {
        salary_range: { low: 100000, high: 130000 },
        roi_score: 180000,
        priority_score: 75,
        skill_growth_factor: 1.2,
      },
      status: 'offer',
      applied_date: new Date('2025-01-10'),
      last_updated: new Date('2025-01-20'),
      follow_ups: [],
      notes: 'Offer received!',
      offer: {
        received_date: new Date('2025-01-20'),
        salary: 115000,
        equity: '0.5%',
        deadline: new Date('2025-01-27'),
      },
    },
  ];

  // Save demo apps
  for (const app of demo_apps) {
    saveApplication(app);
  }

  console.log(`✓ Seeded ${demo_apps.length} demo applications`);
}
