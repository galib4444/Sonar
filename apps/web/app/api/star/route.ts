/**
 * STAR Answers API Route
 * POST /api/star
 */

import { NextRequest, NextResponse } from 'next/server';
import type { GenerateSTARRequest, GenerateSTARResponse } from '@/lib/types';
import { generateSTARAnswers, exportSTARToMarkdown } from '@/lib/ai/star-generator';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSTARRequest = await request.json();
    const { user_profile, jd_insights, num_answers = 5 } = body;

    if (!user_profile || !jd_insights) {
      return NextResponse.json(
        { error: 'user_profile and jd_insights are required' },
        { status: 400 }
      );
    }

    // Generate STAR answers
    const starResult = await generateSTARAnswers(user_profile, jd_insights, num_answers);

    const response: GenerateSTARResponse = {
      answers: starResult.answers,
      validation: starResult.validation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating STAR answers:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate STAR answers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export STAR answers as markdown
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const answersParam = url.searchParams.get('answers');

    if (!answersParam) {
      return NextResponse.json({ error: 'answers parameter required' }, { status: 400 });
    }

    const answers = JSON.parse(decodeURIComponent(answersParam));
    const markdown = exportSTARToMarkdown(answers);

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="star-answers.md"',
      },
    });
  } catch (error) {
    console.error('Error exporting STAR answers:', error);
    return NextResponse.json(
      { error: 'Failed to export STAR answers' },
      { status: 500 }
    );
  }
}
