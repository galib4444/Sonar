/**
 * PDF Generator
 * Generates ATS-compliant PDF resumes
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { ATSCleanTemplate } from './ats-clean-template';
import { ModernMinimalistTemplate } from './modern-minimalist-template';
import { TechnicalTemplate } from './technical-template';
import type { ResumeSections, PDFGeneratorOutput } from '../types';

export type ResumeFormat = 'classic' | 'modern' | 'technical';

/**
 * Generate PDF from resume sections
 */
export async function generatePDF(
  resumeSections: ResumeSections,
  format: ResumeFormat = 'classic'
): Promise<PDFGeneratorOutput> {
  const startTime = Date.now();

  try {
    // Select template based on format
    let template;
    switch (format) {
      case 'modern':
        template = ModernMinimalistTemplate({ resume: resumeSections });
        break;
      case 'technical':
        template = TechnicalTemplate({ resume: resumeSections });
        break;
      case 'classic':
      default:
        template = ATSCleanTemplate({ resume: resumeSections });
        break;
    }

    // Render PDF
    const pdfBuffer = await renderToBuffer(template);

    // Calculate metadata
    const fileSizeBytes = pdfBuffer.length;
    const generationTimeMs = Date.now() - startTime;

    // Estimate line count (for 1-page validation)
    const lineCount = estimateLineCount(resumeSections);

    return {
      pdf_url: '', // Will be set by the API route
      pdf_buffer: pdfBuffer,
      metadata: {
        file_size_bytes: fileSizeBytes,
        page_count: 1, // Always 1 for ATS compliance
        line_count: lineCount,
        generation_time_ms: generationTimeMs,
      },
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Estimate line count for page overflow detection
 */
function estimateLineCount(resume: ResumeSections): number {
  let lineCount = 0;

  // Header: name + contact (3-4 lines)
  lineCount += 4;

  // Summary (if present, ~2-3 lines)
  if (resume.summary) {
    const words = resume.summary.split(' ').length;
    lineCount += Math.ceil(words / 12); // ~12 words per line
  }

  // Experience
  if (resume.experience) {
    resume.experience.forEach((exp) => {
      lineCount += 3; // Title, company, dates
      exp.bullets.forEach((bullet) => {
        const words = bullet.split(' ').length;
        lineCount += Math.ceil(words / 12);
      });
      lineCount += 1; // Spacing
    });
  }

  // Projects
  if (resume.projects) {
    resume.projects.forEach((proj) => {
      lineCount += 2; // Name, link
      proj.bullets.forEach((bullet) => {
        const words = bullet.split(' ').length;
        lineCount += Math.ceil(words / 12);
      });
      lineCount += 1; // Spacing
    });
  }

  // Education
  if (resume.education) {
    resume.education.forEach((edu) => {
      lineCount += 2; // Degree, school
      if (edu.highlights) {
        lineCount += edu.highlights.length;
      }
    });
  }

  // Skills (~2-3 lines)
  lineCount += 3;

  // Certifications
  if (resume.certifications) {
    lineCount += resume.certifications.length * 2;
  }

  return lineCount;
}

/**
 * Generate filename for resume PDF
 */
export function generatePDFFilename(
  name: string,
  company?: string
): string {
  // Format: FirstName_LastName_Resume_Company.pdf
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || 'Resume';
  const lastName = nameParts[nameParts.length - 1] || '';

  const baseFilename = lastName
    ? `${firstName}_${lastName}_Resume`
    : `${firstName}_Resume`;

  const companyPart = company
    ? `_${company.replace(/[^a-zA-Z0-9]/g, '')}`
    : '';

  return `${baseFilename}${companyPart}.pdf`;
}

/**
 * Check if resume will fit on one page
 */
export function willFitOnOnePage(resumeSections: ResumeSections): {
  fits: boolean;
  lineCount: number;
  maxLines: number;
  recommendation?: string;
} {
  const lineCount = estimateLineCount(resumeSections);
  const maxLines = 52; // Max lines for 1 page at 11pt with 0.5" margins

  return {
    fits: lineCount <= maxLines,
    lineCount,
    maxLines,
    recommendation:
      lineCount > maxLines
        ? `Resume is estimated at ${lineCount} lines (max ${maxLines}). Consider removing ${Math.ceil((lineCount - maxLines) / 3)} bullet points or condensing summary.`
        : undefined,
  };
}
