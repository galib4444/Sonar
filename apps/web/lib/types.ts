/**
 * Core TypeScript Type Definitions for HustlerAI
 */

// ============================================
// User Profile
// ============================================

export interface UserProfile {
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  summary?: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: string[];
  certifications?: CertificationItem[];
  baseline_salary?: number;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  start_date: string; // Format: "Jan 2020" or "2020-01"
  end_date: string; // Format: "Present", "Current", or date
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  link?: string;
  description?: string;
  bullets: string[];
  technologies?: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  graduation_year: string;
  gpa?: string;
  honors?: string;
  highlights?: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
  url?: string;
}

// ============================================
// Job Description Analysis
// ============================================

export interface JDInsights {
  title: string;
  company: string;
  location: string;
  seniority: 'entry' | 'mid' | 'senior' | 'staff' | 'principal';
  skills_extracted: Skill[];
  must_haves: string[];
  nice_to_haves: string[];
  keywords_top_10: string[];
  responsibilities: string[];
  team_size: string;
  remote_policy: 'remote' | 'hybrid' | 'onsite' | 'unknown';
  salary_estimate?: SalaryEstimate;
}

export interface Skill {
  name: string;
  weight: number; // 1-10
  category: 'technical' | 'soft' | 'domain';
}

export interface SalaryEstimate {
  min: number;
  max: number;
  currency: string;
  confidence: 'high' | 'medium' | 'low';
}

// ============================================
// Match Scoring
// ============================================

export interface MatchScoreResult {
  total_score: number; // 0-100
  breakdown: {
    skill_overlap: number; // 0-50
    must_have_coverage: number; // 0-20
    seniority_fit: number; // 0-15
    evidence_score: number; // 0-15
  };
  matched_skills: string[];
  gaps: string[];
  recommendations: string[];
  roi_metrics?: ROIMetrics;
}

export interface ROIMetrics {
  salary_delta: number;
  career_growth_potential: 'high' | 'medium' | 'low';
  time_to_competence: string;
}

// ============================================
// Resume Generation
// ============================================

export interface ResumeSections {
  name: string;
  contact: UserProfile['contact'];
  summary?: string;
  experience: ExperienceItem[];
  projects?: ProjectItem[];
  education: EducationItem[];
  skills: SkillSection;
  certifications?: CertificationItem[];
}

export interface SkillSection {
  technical?: string[];
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  soft?: string[];
  grouped?: Record<string, string[]>;
}

// ============================================
// Bullet Rewriting
// ============================================

export interface BulletRewriteResult {
  original_bullets: string[];
  rewritten_bullets: RewrittenBullet[];
  validation: BulletValidation;
}

export interface RewrittenBullet {
  original: string;
  rewritten: string;
  keywords_added: string[];
  action_verb_used: string;
  changes_made: string[];
}

export interface BulletValidation {
  no_hallucinations: boolean;
  metrics_preserved: boolean;
  length_ok: boolean;
}

// ============================================
// ATS Validation
// ============================================

export interface ATSValidationResult {
  valid: boolean; // True if score >= 90
  score: number; // 0-100
  checks: ATSChecks;
  issues: string[]; // Critical problems
  warnings: string[]; // Suggestions
  recommendations: string[]; // How to improve score
}

export interface ATSChecks {
  layout: LayoutChecks;
  fonts: FontChecks;
  sections: SectionChecks;
  keywords: KeywordChecks;
  page_count: PageCountChecks;
}

export interface LayoutChecks {
  single_column: boolean;
  no_tables: boolean;
  no_text_boxes: boolean;
  no_images: boolean;
}

export interface FontChecks {
  approved_fonts: boolean;
  body_size_ok: boolean;
  header_size_ok: boolean;
}

export interface SectionChecks {
  standard_headings: boolean;
  required_present: boolean;
  logical_order: boolean;
}

export interface KeywordChecks {
  coverage: number; // 0-10
  density_ok: boolean;
  placement_ok: boolean;
}

export interface PageCountChecks {
  is_one_page: boolean;
  line_count: number;
  estimated_height: number; // In inches
}

// ============================================
// ATS Rules (from knowledge base)
// ============================================

export interface ATSRules {
  layout: {
    single_column: boolean;
    no_tables: boolean;
    no_text_boxes: boolean;
    no_headers_footers: boolean;
    max_pages: number;
  };
  fonts: {
    approved: string[];
    body_size: { min: number; max: number };
    header_size: { min: number; max: number };
  };
  sections: {
    required: string[];
    optional: string[];
    standard_names: Record<string, string[]>;
    order: string[];
  };
  keywords: {
    min_coverage: number;
    max_density: number;
    placement: string[];
  };
}

// ============================================
// PDF Generation
// ============================================

export interface PDFGeneratorInput {
  resume_sections: ResumeSections;
  metadata: PDFMetadata;
  template: 'ats-clean' | 'ats-modern';
}

export interface PDFMetadata {
  match_score?: number;
  ats_score?: number;
  company?: string;
}

export interface PDFGeneratorOutput {
  pdf_url: string;
  pdf_buffer?: Buffer;
  metadata: {
    file_size_bytes: number;
    page_count: number;
    line_count: number;
    generation_time_ms: number;
  };
}

// ============================================
// STAR Interview Answers
// ============================================

export interface STARAnswer {
  question: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keywords_used: string[];
  experience_source: string;
}

export interface STARGeneratorOutput {
  answers: STARAnswer[];
  validation: {
    all_from_real_experience: boolean;
    no_hallucinations: boolean;
    length_ok: boolean;
  };
}

// ============================================
// Knowledge Base
// ============================================

export interface ActionVerbs {
  leadership: string[];
  achievement: string[];
  technical: string[];
  analysis: string[];
  communication: string[];
  creativity: string[];
}

export interface BulletExample {
  text: string;
  category: string;
  has_quantification: boolean;
  keywords: string[];
  quality_score: number;
}

export interface Template {
  name: string;
  sections: string[];
  layout_type: 'single-column' | 'two-column';
  ats_safe: boolean;
  description: string;
}

// ============================================
// API Request/Response
// ============================================

export interface AnalyzeJDRequest {
  jd_text: string;
  jd_url?: string;
  user_baseline_salary?: number;
}

export interface AnalyzeJDResponse {
  jd_insights: JDInsights;
  metadata: {
    processing_time_ms: number;
    tokens_used?: number;
  };
}

export interface TailorResumeRequest {
  jd_text: string;
  user_profile: UserProfile;
}

export interface TailorResumeResponse {
  resume_sections: ResumeSections;
  pdf_url: string;
  match_score: MatchScoreResult;
  ats_validation: ATSValidationResult;
  jd_insights: JDInsights;
  star_answers?: STARAnswer[];
  metadata: {
    processing_time_ms: number;
    total_tokens_used?: number;
  };
}

export interface GeneratePDFRequest {
  resume_sections: ResumeSections;
  metadata: PDFMetadata;
  template?: 'ats-clean' | 'ats-modern';
  format?: 'classic' | 'modern' | 'technical'; // Resume format selection
}

export interface GeneratePDFResponse {
  pdf_url: string;
  metadata: {
    file_size_bytes: number;
    page_count: number;
    generation_time_ms: number;
  };
}

export interface GenerateSTARRequest {
  user_profile: UserProfile;
  jd_insights: JDInsights;
  num_answers?: number;
}

export interface GenerateSTARResponse {
  answers: STARAnswer[];
  validation: STARGeneratorOutput['validation'];
}

// ============================================
// Skill Communication Protocol
// ============================================

export interface SkillRequest<T = unknown> {
  skill: string;
  action: string;
  inputs: T;
  context?: {
    user_id?: string;
    session_id?: string;
    trace_id?: string;
  };
}

export interface SkillResponse<T = unknown> {
  skill: string;
  action: string;
  status: 'success' | 'error';
  outputs?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    duration_ms: number;
    tokens_used?: number;
    cost?: number;
  };
}

// ============================================
// Chrome Extension
// ============================================

export interface ResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pdfFilename: string;
  resumeUrl: string;
  matchScore: number;
  coverLetter?: string;
}

export interface ExtensionMessage {
  action: 'extract_jd' | 'autofill' | 'generate_resume';
  data?: unknown;
}

// ============================================
// V2: Application Tracking & Analytics
// ============================================

export type ApplicationStatus =
  | 'bookmarked'
  | 'ready_to_submit'
  | 'applied'
  | 'phone_screen'
  | 'onsite'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface ApplicationRecord {
  id: string;
  user_id: string;

  // Job info
  job: {
    title: string;
    company: string;
    url: string;
    jd_text: string;
    posted_date: Date;
    closing_date?: Date;
  };

  // Application materials
  resume: {
    pdf_url: string;
    match_score: number;
    ats_score: number;
  };
  star_answers: STARAnswer[];

  // Financial metrics
  financial: {
    salary_range: { low: number; high: number };
    roi_score: number;
    priority_score: number;
    skill_growth_factor: number;
  };

  // Tracking
  status: ApplicationStatus;
  applied_date: Date;
  last_updated: Date;

  // Follow-up
  recruiter_contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  follow_ups: Array<{
    date: Date;
    type: 'email' | 'call' | 'linkedin';
    content: string;
  }>;

  // Notes
  notes: string;
  interview_notes?: Array<{
    date: Date;
    type: 'phone' | 'onsite' | 'final';
    notes: string;
  }>;

  // Outcomes
  offer?: {
    received_date: Date;
    salary: number;
    equity?: string;
    deadline: Date;
  };
  rejection?: {
    date: Date;
    reason?: string;
  };
}

export interface BookmarkRecord {
  id: string;
  user_id: string;
  job: {
    title: string;
    company: string;
    url: string;
    jd_text: string;
    posted_date: Date;
    closing_date?: Date;
  };
  saved_date: Date;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface AnalyticsSnapshot {
  user_id: string;
  time_range: { start: Date; end: Date };

  funnel: {
    applied: number;
    phone_screen: number;
    onsite: number;
    offer: number;
  };

  conversion_rates: {
    applied_to_phone: number;
    phone_to_onsite: number;
    onsite_to_offer: number;
  };

  financial: {
    total_potential_earnings: number;
    avg_target_salary: number;
    highest_offer?: number;
  };

  time_saved: {
    hours_saved: number;
    avg_time_per_app: number;
  };

  success_by_match_score: Array<{
    score_range: string;
    interview_rate: number;
  }>;
}

export interface FinancialMetrics {
  roi_score: number; // Earnings per hour invested
  salary_fit: {
    role_range: { low: number; high: number };
    user_current: number;
    potential_lift_pct: number;
    market_percentile: number;
  };
  skill_growth: {
    new_skills: string[];
    growth_factor: number;
  };
  career_trajectory: {
    current_level: string;
    target_level: string;
    time_to_target_months: number;
  };
  priority_score: number; // 0-100 overall priority
}

// ============================================
// V2: New API Request/Response Types
// ============================================

export interface SaveApplicationRequest {
  application: Omit<ApplicationRecord, 'id' | 'user_id'>;
}

export interface SaveApplicationResponse {
  status: 'success' | 'error';
  data?: {
    application_id: string;
    saved_at: string;
  };
  error?: string;
}

export interface ListApplicationsRequest {
  status?: ApplicationStatus[];
  min_match_score?: number;
  min_salary?: number;
  company?: string;
  sort_by?: 'roi_score' | 'match_score' | 'applied_date' | 'salary';
  limit?: number;
}

export interface ListApplicationsResponse {
  status: 'success' | 'error';
  data?: {
    applications: ApplicationRecord[];
    stats: {
      total: number;
      by_status: Record<ApplicationStatus, number>;
      avg_match_score: number;
      total_potential_earnings: number;
    };
  };
  error?: string;
}

export interface GenerateFollowUpRequest {
  application_id: string;
  follow_up_type: 'post_application' | 'post_interview' | 'post_rejection';
}

export interface GenerateFollowUpResponse {
  status: 'success' | 'error';
  data?: {
    email: {
      subject: string;
      body: string;
      to: string;
    };
    suggested_send_date: string;
  };
  error?: string;
}

export interface SaveBookmarkRequest {
  action: 'save' | 'remove' | 'list';
  job?: BookmarkRecord['job'];
}

export interface SaveBookmarkResponse {
  status: 'success' | 'error';
  data?: {
    bookmark_id?: string;
    days_until_closing?: number;
    priority?: 'high' | 'medium' | 'low';
    bookmarks?: BookmarkRecord[];
  };
  error?: string;
}

export interface AnalyticsRequest {
  user_id: string;
  time_range?: { start: Date; end: Date };
  metric_type: 'funnel' | 'success_rate' | 'financial' | 'time_saved' | 'all';
}

export interface AnalyticsResponse {
  status: 'success' | 'error';
  data?: AnalyticsSnapshot;
  error?: string;
}

// ============================================
// Utility Types
// ============================================

export type Seniority = 'entry' | 'mid' | 'senior' | 'staff' | 'principal';
export type RemotePolicy = 'remote' | 'hybrid' | 'onsite' | 'unknown';
export type SkillCategory = 'technical' | 'soft' | 'domain';
export type TemplateType = 'ats-clean' | 'ats-modern';
export type Confidence = 'high' | 'medium' | 'low';
export type GrowthPotential = 'high' | 'medium' | 'low';
export type Priority = 'high' | 'medium' | 'low';
