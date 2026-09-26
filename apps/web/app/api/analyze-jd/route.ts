/**
 * Analyze Job Description API Route
 * POST /api/analyze-jd
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeJDRequest, AnalyzeJDResponse } from '@/lib/types';
import { extractTopKeywords } from '@/lib/utils/keywords';
import { cleanText } from '@/lib/utils/text';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AnalyzeJDRequest = await request.json();
    const { jd_text } = body;

    if (!jd_text) {
      return NextResponse.json({ error: 'jd_text is required' }, { status: 400 });
    }

    // Clean the JD text
    const cleanedText = cleanText(jd_text);

    // Extract keywords (in a real implementation, this would call Gemini API)
    const keywords = extractTopKeywords(cleanedText, 10);

    // Mock JD insights (in production, this would be parsed by Gemini)
    const jdInsights = {
      title: extractTitle(cleanedText),
      company: extractCompany(cleanedText),
      location: extractLocation(cleanedText),
      seniority: determineSeniority(cleanedText) as 'entry' | 'mid' | 'senior' | 'staff' | 'principal',
      skills_extracted: keywords.map((kw, idx) => ({
        name: kw,
        weight: 10 - idx,
        category: 'technical' as const,
      })),
      must_haves: extractMustHaves(cleanedText),
      nice_to_haves: extractNiceToHaves(cleanedText),
      keywords_top_10: keywords,
      responsibilities: extractResponsibilities(cleanedText),
      team_size: 'unknown',
      remote_policy: determineRemotePolicy(cleanedText) as 'remote' | 'hybrid' | 'onsite' | 'unknown',
    };

    const response: AnalyzeJDResponse = {
      jd_insights: jdInsights,
      metadata: {
        processing_time_ms: Date.now() - startTime,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing JD:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}

// Helper functions (these would be replaced with Gemini API calls in production)

function extractTitle(text: string): string {
  // Simple extraction - look for common job title patterns
  const patterns = [
    /(?:position|role|job|title):\s*([^\n]+)/i,
    /(?:seeking|hiring)\s+(?:a\s+)?([A-Z][a-z\s]+(?:Engineer|Manager|Developer|Designer|Analyst))/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return 'Software Engineer'; // Default
}

function extractCompany(text: string): string {
  // Look for company name patterns
  const match = text.match(/(?:at|@|company:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  return match ? match[1].trim() : 'Company';
}

function extractLocation(text: string): string {
  // Look for location patterns
  const match = text.match(/(?:location|based in|located in):\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Remote';
}

function determineSeniority(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('senior') || lowerText.includes('sr.')) return 'senior';
  if (lowerText.includes('staff') || lowerText.includes('principal')) return 'staff';
  if (lowerText.includes('junior') || lowerText.includes('entry')) return 'entry';
  if (lowerText.includes('mid-level') || lowerText.includes('intermediate')) return 'mid';

  // Check for years of experience
  const yearsMatch = lowerText.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 8) return 'senior';
    if (years >= 5) return 'mid';
    if (years >= 2) return 'mid';
    return 'entry';
  }

  return 'mid';
}

function extractMustHaves(text: string): string[] {
  const mustHaves: string[] = [];

  // Look for "required" or "must have" sections
  const requiredSection = text.match(/(?:required|must have|requirements):\s*([^\n]+(?:\n[^\n]+)*)/i);

  if (requiredSection) {
    const lines = requiredSection[1].split('\n').filter((line) => line.trim());
    mustHaves.push(...lines.slice(0, 5));
  }

  return mustHaves.length > 0 ? mustHaves : ['Relevant experience', 'Strong communication skills'];
}

function extractNiceToHaves(text: string): string[] {
  const niceToHaves: string[] = [];

  const niceSection = text.match(/(?:nice to have|preferred|bonus):\s*([^\n]+(?:\n[^\n]+)*)/i);

  if (niceSection) {
    const lines = niceSection[1].split('\n').filter((line) => line.trim());
    niceToHaves.push(...lines.slice(0, 3));
  }

  return niceToHaves;
}

function extractResponsibilities(text: string): string[] {
  const responsibilities: string[] = [];

  const respSection = text.match(/(?:responsibilities|you will):\s*([^\n]+(?:\n[^\n]+)*)/i);

  if (respSection) {
    const lines = respSection[1].split('\n').filter((line) => line.trim());
    responsibilities.push(...lines.slice(0, 5));
  }

  return responsibilities.length > 0 ? responsibilities : ['Drive project execution', 'Collaborate with team'];
}

function determineRemotePolicy(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('remote') && !lowerText.includes('on-site')) return 'remote';
  if (lowerText.includes('hybrid')) return 'hybrid';
  if (lowerText.includes('on-site') || lowerText.includes('onsite')) return 'onsite';

  return 'unknown';
}
