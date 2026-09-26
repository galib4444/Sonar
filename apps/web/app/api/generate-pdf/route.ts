/**
 * Generate PDF API Route
 * POST /api/generate-pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import type { GeneratePDFRequest } from '@/lib/types';
import { generatePDF, generatePDFFilename, willFitOnOnePage, ResumeFormat } from '@/lib/pdf/pdf-generator';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GeneratePDFRequest = await request.json();
    const { resume_sections, metadata, format } = body;

    if (!resume_sections) {
      return NextResponse.json(
        { error: 'resume_sections is required' },
        { status: 400 }
      );
    }

    // Default to classic format if not specified
    const resumeFormat: ResumeFormat = (format as ResumeFormat) || 'classic';

    // Check if resume will fit on one page
    const pageCheck = willFitOnOnePage(resume_sections);
    if (!pageCheck.fits) {
      return NextResponse.json(
        {
          error: 'Resume exceeds one page',
          line_count: pageCheck.lineCount,
          max_lines: pageCheck.maxLines,
          recommendation: pageCheck.recommendation,
        },
        { status: 400 }
      );
    }

    // Generate PDF with selected format
    const pdfResult = await generatePDF(resume_sections, resumeFormat);

    // Generate filename
    const company = metadata?.company;
    const filename = generatePDFFilename(resume_sections.name, company);

    // Convert buffer to base64 for download
    const base64PDF = pdfResult.pdf_buffer?.toString('base64');
    const pdfDataURL = `data:application/pdf;base64,${base64PDF}`;

    const response = {
      pdf_url: pdfDataURL,
      filename,
      metadata: {
        ...pdfResult.metadata,
        generation_time_ms: Date.now() - startTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing with demo data
export async function GET(request: NextRequest) {
  try {
    // Load demo user profile
    const demoDataPath = '/demo-data/users/alex-earlycareer.json';
    const response = await fetch(`${request.nextUrl.origin}${demoDataPath}`);
    const demoUser = await response.json();

    // Create resume sections from demo user
    const resumeSections = {
      name: demoUser.name,
      contact: demoUser.contact,
      summary: demoUser.summary,
      experience: demoUser.experience,
      projects: demoUser.projects,
      education: demoUser.education,
      skills: { technical: demoUser.skills },
      certifications: demoUser.certifications,
    };

    // Generate PDF
    const pdfResult = await generatePDF(resumeSections);
    const filename = generatePDFFilename(resumeSections.name);

    // Return PDF as download
    return new NextResponse(pdfResult.pdf_buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfResult.metadata.file_size_bytes.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating demo PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate demo PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
