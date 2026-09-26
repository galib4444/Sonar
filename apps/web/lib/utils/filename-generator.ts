/**
 * Smart Filename Generator
 * Generates intelligent filenames for resume downloads
 */

import type { UserProfile, JDInsights } from '@/lib/types';

export interface FilenameOptions {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  companyName?: string;
  date?: Date;
}

/**
 * Generate a smart filename for resume download
 * Format: FirstName_LastName_CompanyName.pdf
 * Fallback: Resume_YYYY-MM-DD.pdf
 */
export function generateResumeFilename(
  userProfile?: UserProfile,
  jdInsights?: JDInsights,
  customOptions?: FilenameOptions
): string {
  let firstName = customOptions?.firstName;
  let lastName = customOptions?.lastName;
  let companyName = customOptions?.companyName;

  // Extract from user profile if not provided
  if (!firstName || !lastName) {
    const nameParts = extractNameParts(userProfile?.name);
    firstName = firstName || nameParts.firstName;
    lastName = lastName || nameParts.lastName;
  }

  // Extract company from JD insights if not provided
  if (!companyName && jdInsights?.company) {
    companyName = sanitizeForFilename(jdInsights.company);
  }

  // Build filename
  if (firstName && lastName && companyName) {
    return `${firstName}_${lastName}_${companyName}.pdf`;
  } else if (firstName && lastName) {
    return `${firstName}_${lastName}_Resume.pdf`;
  } else {
    // Fallback to date-based filename
    const date = customOptions?.date || new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `Resume_${dateStr}.pdf`;
  }
}

/**
 * Extract first and last name from full name string
 */
export function extractNameParts(fullName?: string): {
  firstName: string;
  lastName: string;
} {
  if (!fullName) {
    return { firstName: '', lastName: '' };
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  } else if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  } else {
    // First word is first name, last word is last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return { firstName, lastName };
  }
}

/**
 * Sanitize string for use in filename
 * Remove special characters, replace spaces with underscores
 */
export function sanitizeForFilename(str: string): string {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace hyphens with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .substring(0, 50); // Limit length
}

/**
 * Generate suggested filename for save modal
 */
export function generateSuggestedFilename(
  firstName: string,
  lastName: string,
  jobTitle?: string
): string {
  const sanitizedFirst = sanitizeForFilename(firstName);
  const sanitizedLast = sanitizeForFilename(lastName);

  if (jobTitle) {
    const sanitizedTitle = sanitizeForFilename(jobTitle);
    return `${sanitizedFirst}_${sanitizedLast}_${sanitizedTitle}.pdf`;
  }

  return `${sanitizedFirst}_${sanitizedLast}_Resume.pdf`;
}

/**
 * Extract company name from job description text
 */
export function extractCompanyFromJD(jdText: string): string | null {
  // Common patterns for company names in JDs
  const patterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.,-]+?)(?:\s+is|,|\.|$)/,
    /([A-Z][A-Za-z0-9\s&.,-]+?)\s+is\s+(?:hiring|looking|seeking)/i,
    /Join\s+(?:the\s+)?([A-Z][A-Za-z0-9\s&.,-]+?)(?:\s+team|,|\.|$)/i,
  ];

  for (const pattern of patterns) {
    const match = jdText.match(pattern);
    if (match && match[1]) {
      return sanitizeForFilename(match[1].trim());
    }
  }

  return null;
}

/**
 * Extract job title from job description text
 */
export function extractJobTitleFromJD(jdText: string): string | null {
  // Common patterns for job titles
  const patterns = [
    /(?:Position|Role|Title):\s*([A-Za-z\s]+?)(?:\n|$)/i,
    /(?:We're|We are)\s+(?:hiring|looking for|seeking)\s+(?:a|an)\s+([A-Za-z\s]+?)(?:\s+to|\s+who|\.|\n)/i,
    /^([A-Z][A-Za-z\s]+?)(?:\s+-\s+|\n)/m,
  ];

  for (const pattern of patterns) {
    const match = jdText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}
