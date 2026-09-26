/**
 * Tailor Resume API Route
 * POST /api/tailor
 * Real implementation - analyzes JD and generates tailored 1-page resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJSON } from '@/lib/ai/gemini-client';
import { calculateMatchScore } from '@/lib/scoring/match-scorer';
import { validateATS } from '@/lib/validation/ats-validator';
import { generateRecommendations } from '@/lib/ai/recommendation-generator';
import type { UserProfile, JDInsights, ResumeSections } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { jd_text, user_profile } = body as { jd_text: string; user_profile: UserProfile };

    if (!jd_text || !user_profile) {
      return NextResponse.json(
        { error: 'Missing required fields: jd_text, user_profile' },
        { status: 400 }
      );
    }

    // Step 1: Analyze Job Description with Gemini
    console.log('📊 Analyzing job description...');
    const jdPrompt = `You are an expert job description analyzer. Analyze this job description and extract structured insights.

Job Description:
"""
${jd_text}
"""

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, State or Remote",
  "seniority": "entry" | "mid" | "senior" | "staff" | "principal",
  "skills_extracted": [
    {"name": "Skill Name", "weight": 10, "category": "technical"},
    {"name": "Another Skill", "weight": 9, "category": "technical"}
  ],
  "must_haves": ["Requirement 1", "Requirement 2"],
  "nice_to_haves": ["Nice to have 1"],
  "keywords_top_10": ["keyword1", "keyword2", "keyword3"],
  "responsibilities": ["Responsibility 1"],
  "team_size": "5-10 people" or "unknown",
  "remote_policy": "remote" | "hybrid" | "onsite" | "unknown"
}

Extract:
- Top 10-15 most important technical and soft skills (weighted by importance)
- Must-have requirements (hard requirements mentioned)
- Nice-to-have qualifications
- Top 10 keywords that should appear in resume
- Seniority level based on years of experience required`;

    const jdResponse = await callGemini({
      prompt: jdPrompt,
      temperature: 0.2,
      maxTokens: 2048,
    });

    let jdInsights = parseGeminiJSON<JDInsights>(jdResponse);

    // Handle case where Gemini returns an array instead of object
    if (Array.isArray(jdInsights)) {
      console.log('🔄 [TAILOR] Gemini returned array for JD insights, extracting first element');
      jdInsights = jdInsights[0];
    }

    // Normalize JD Insights with defensive defaults
    console.log('🔍 Raw JD Insights:', JSON.stringify(jdInsights, null, 2));
    jdInsights = {
      title: jdInsights?.title || 'Position',
      company: jdInsights?.company || 'Company',
      location: jdInsights?.location || 'Location',
      seniority: jdInsights?.seniority || 'mid',
      skills_extracted: jdInsights?.skills_extracted || [],
      must_haves: jdInsights?.must_haves || [],
      nice_to_haves: jdInsights?.nice_to_haves || [],
      keywords_top_10: jdInsights?.keywords_top_10 || [],
      responsibilities: jdInsights?.responsibilities || [],
      team_size: jdInsights?.team_size || 'unknown',
      remote_policy: jdInsights?.remote_policy || 'unknown',
    };

    if (jdInsights.keywords_top_10.length === 0) {
      console.warn('⚠️ No keywords extracted from JD, using generic defaults');
      jdInsights.keywords_top_10 = ['experience', 'skills', 'team', 'development', 'work'];
    }

    // Step 2: Calculate Match Score
    console.log('🎯 Calculating match score...');
    const matchScore = calculateMatchScore(user_profile, jdInsights);

    // Step 3: Tailor Resume Bullets with Gemini
    console.log('✍️  Tailoring resume for 1-page output...');
    const topKeywords = (jdInsights.keywords_top_10 || []).join(', ') || 'relevant skills';
    const mustHaves = (jdInsights.must_haves || []).join('; ') || 'job requirements';
    const topSkills = (jdInsights.skills_extracted || []).map(s => s.name).slice(0, 10).join(', ') || 'technical skills';

    const tailorPrompt = `You are an expert resume writer. Create a tailored 1-PAGE resume from the user's full profile.

USER'S FULL PROFILE:
"""
${JSON.stringify(user_profile, null, 2)}
"""

JOB REQUIREMENTS:
Title: ${jdInsights.title}
Company: ${jdInsights.company}
Top Keywords: ${topKeywords}
Must-Haves: ${mustHaves}
Skills Needed: ${topSkills}

INSTRUCTIONS - CRITICAL FOR 1-PAGE:
1. Select ONLY 2-3 most relevant work experiences
2. For each experience: Write ONLY 3 bullet points (not 4, not 5 - exactly 3)
3. Each bullet: 1-2 lines max, quantified, incorporates JD keywords
4. Professional summary: 2-3 sentences max
5. Skills: Select only 10-12 most relevant to this JD
6. Education: Keep minimal (degree, school, year only)
7. Projects: Include ONLY if space allows (0-1 projects max)
8. Certifications: Include ONLY most relevant (max 2)

QUALITY REQUIREMENTS:
- Incorporate JD keywords naturally
- Start with strong action verbs
- Quantify with metrics where possible
- Stay truthful to user's experience
- PRIORITY: Keep to 1 page (max 50 lines total)

Return ONLY valid JSON (no markdown):
{
  "summary": "2-3 sentence professional summary",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company",
      "location": "Location",
      "start_date": "Jan 2020",
      "end_date": "Present",
      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "graduation_year": "2020"
    }
  ],
  "skills": ["Top 10-12 relevant skills only"],
  "projects": [],
  "certifications": []
}`;

    const tailorResponse = await callGemini({
      prompt: tailorPrompt,
      temperature: 0.3,
      maxTokens: 3072,
    });

    const tailoredResume = parseGeminiJSON<ResumeSections>(tailorResponse);

    // Step 4: ATS Validation
    console.log('✅ Validating ATS compliance...');
    const atsValidation = validateATS(tailoredResume, jdInsights.keywords_top_10 || []);

    // Step 5: Generate AI Recommendations
    console.log('💡 Generating AI recommendations...');
    const recommendations = generateRecommendations(user_profile, jdInsights, matchScore);

    // Step 6: Return everything
    const response = {
      jd_insights: jdInsights,
      match_score: matchScore,
      tailored_resume: tailoredResume,
      ats_validation: atsValidation,
      recommendations, // NEW: AI-powered recommendations
      metadata: {
        processing_time_ms: Date.now() - startTime,
        generated_at: new Date().toISOString(),
      },
    };

    console.log(`✅ Resume generated in ${Date.now() - startTime}ms with ${recommendations.length} recommendations`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in tailor route:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate tailored resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
