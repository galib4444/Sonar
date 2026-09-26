/**
 * Follow-Up Email Generation API Route
 * POST /api/follow-up
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApplication } from '@/lib/tracker/storage';
import { callGemini, parseGeminiJSON } from '@/lib/ai/gemini-client';
import type { GenerateFollowUpRequest, GenerateFollowUpResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateFollowUpRequest = await request.json();

    if (!body.application_id || !body.follow_up_type) {
      return NextResponse.json<GenerateFollowUpResponse>(
        {
          status: 'error',
          error: 'Missing application_id or follow_up_type',
        },
        { status: 400 }
      );
    }

    // Get the application
    const application = getApplication(body.application_id);

    if (!application) {
      return NextResponse.json<GenerateFollowUpResponse>(
        {
          status: 'error',
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    // Calculate days since last contact
    const now = new Date();
    const last_contact = application.follow_ups.length > 0
      ? application.follow_ups[application.follow_ups.length - 1].date
      : application.applied_date;
    const days_since = Math.ceil((now.getTime() - last_contact.getTime()) / (1000 * 60 * 60 * 24));

    // Generate follow-up email using Gemini
    const prompt = `You are a professional career coach generating a follow-up email for a job application.

APPLICATION CONTEXT:
- Role: ${application.job.title}
- Company: ${application.job.company}
- Applied Date: ${application.applied_date.toLocaleDateString()}
- Days Since Last Contact: ${days_since}
- Match Score: ${application.resume.match_score}%
- Status: ${application.status}

FOLLOW-UP TYPE: ${body.follow_up_type}
(Options: post_application, post_interview, post_rejection)

RULES:
1. Professional but warm tone
2. Keep under 150 words
3. Reference specific details about the role and company
4. Include clear call-to-action (request call, ask for update, etc.)
5. Subject line should be compelling and specific
6. If post_rejection, request constructive feedback politely

Return ONLY JSON in this format (no markdown, no explanation):
{
  "subject": "...",
  "body": "..."
}`;

    const gemini_response = await callGemini({
      prompt,
      temperature: 0.3, // Lower temperature for professional tone
      maxTokens: 500,
    });

    const email_data = parseGeminiJSON<{ subject: string; body: string }>(gemini_response);

    // Calculate suggested send date
    const suggested_send_date = new Date();
    suggested_send_date.setDate(suggested_send_date.getDate() + 1); // Tomorrow

    return NextResponse.json<GenerateFollowUpResponse>({
      status: 'success',
      data: {
        email: {
          subject: email_data.subject,
          body: email_data.body,
          to: application.recruiter_contact?.email || 'recruiter@company.com',
        },
        suggested_send_date: suggested_send_date.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating follow-up email:', error);
    return NextResponse.json<GenerateFollowUpResponse>(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate follow-up email',
      },
      { status: 500 }
    );
  }
}
