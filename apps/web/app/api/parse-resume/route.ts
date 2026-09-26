/**
 * Parse Resume API Route
 * POST /api/parse-resume
 * Extracts structured profile from uploaded resume
 */

import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { callGemini, parseGeminiJSON } from '@/lib/ai/gemini-client';
import type { UserProfile } from '@/lib/types';
import { errorLogger } from '@/lib/utils/error-logger';

// Force Node.js runtime for pdf-parse (requires Node native modules)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout for large resumes

// Handle GET requests with proper error message
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Use POST with multipart/form-data and file field "resume"'
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  const source = 'API:/api/parse-resume';
  console.log('📄 [PARSE-RESUME] Request received');

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      console.log('❌ [PARSE-RESUME] No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`📄 [PARSE-RESUME] File received: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Extract text from resume
    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = '';

    if (file.type === 'application/pdf') {
      console.log('📄 [PARSE-RESUME] Parsing PDF...');
      // Parse PDF
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text;
      console.log(`✅ [PARSE-RESUME] PDF parsed, extracted ${resumeText.length} characters`);
    } else if (file.type === 'text/plain') {
      console.log('📄 [PARSE-RESUME] Reading plain text...');
      // Plain text
      resumeText = buffer.toString('utf-8');
      console.log(`✅ [PARSE-RESUME] Text read, ${resumeText.length} characters`);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('❌ [PARSE-RESUME] DOCX not yet supported');
      // DOCX - for now, return error asking for PDF
      return NextResponse.json(
        { error: 'DOCX support coming soon. Please use PDF or TXT format.' },
        { status: 400 }
      );
    } else {
      console.log(`❌ [PARSE-RESUME] Unsupported file type: ${file.type}`);
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 100) {
      console.log(`❌ [PARSE-RESUME] Resume text too short: ${resumeText.length} characters`);
      return NextResponse.json(
        { error: 'Resume text is too short or could not be extracted' },
        { status: 400 }
      );
    }

    // Use Gemini to extract structured profile
    const prompt = `You are an expert resume parser. Extract the following information from this resume into a structured JSON format.

Resume Text:
"""
${resumeText}
"""

Extract and return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "name": "Full Name",
  "contact": {
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin url or null",
    "github": "github url or null",
    "portfolio": "portfolio url or null",
    "website": "website url or null"
  },
  "summary": "Professional summary if present, otherwise null",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "start_date": "Jan 2020",
      "end_date": "Present" or "Dec 2023",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "link": "project link or null",
      "description": "brief description or null",
      "bullets": ["Achievement 1"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University Name",
      "graduation_year": "2020",
      "gpa": "3.8" or null,
      "honors": "Cum Laude" or null,
      "highlights": ["Achievement"] or null
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "2023",
      "credential_id": "ID" or null,
      "url": "verification url" or null
    }
  ]
}

Important:
- Extract ALL experience, education, skills, projects, and certifications
- Keep bullet points specific and quantified
- Use exact dates from resume
- Include all skills mentioned
- Return ONLY the JSON, no other text`;

    console.log('🤖 [PARSE-RESUME] Calling Gemini API...');
    console.log(`📝 [PARSE-RESUME] Prompt length: ${prompt.length} characters`);

    const geminiResponse = await callGemini({
      prompt,
      temperature: 0.1, // Low temperature for accurate extraction
      maxTokens: 4096,
    });

    console.log('✅ [PARSE-RESUME] Gemini response received');
    console.log(`📄 [PARSE-RESUME] Response length: ${geminiResponse.text.length} characters`);

    // Parse the JSON response
    let profile: any;
    try {
      const parsed = parseGeminiJSON<UserProfile>(geminiResponse);

      // Handle case where Gemini returns an array instead of object
      if (Array.isArray(parsed)) {
        console.log('🔄 [PARSE-RESUME] Gemini returned array, extracting first element');
        profile = parsed[0];
      } else {
        profile = parsed;
      }

      console.log('✅ [PARSE-RESUME] Parsed profile:', JSON.stringify(profile, null, 2));
    } catch (parseError) {
      console.error('❌ [PARSE-RESUME] JSON parse error:', parseError);
      return NextResponse.json(
        {
          error: 'Failed to parse resume data',
          details: parseError instanceof Error ? parseError.message : 'Invalid JSON format from AI',
        },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!profile.name || !profile.contact?.email) {
      console.error('❌ [PARSE-RESUME] Missing required fields. Profile:', profile);
      return NextResponse.json(
        {
          error: 'Could not extract essential information (name, email) from resume',
          details: `Name: ${profile.name || 'missing'}, Email: ${profile.contact?.email || 'missing'}`
        },
        { status: 400 }
      );
    }

    console.log('✅ [PARSE-RESUME] Resume parsed successfully');
    return NextResponse.json({
      profile,
      metadata: {
        original_length: resumeText.length,
        extracted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('💥 [PARSE-RESUME] Server error:', error);

    errorLogger.log(
      error as Error,
      source,
      {
        route: '/api/parse-resume',
        method: 'POST',
      }
    );

    return NextResponse.json(
      {
        error: 'Failed to parse resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
