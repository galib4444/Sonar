/**
 * Gemini API Client
 * Wrapper for Google Gemini API calls
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed?: number;
}

/**
 * Call Gemini API
 * NOTE: This is a mock implementation. Replace with actual Gemini API calls in production.
 */
export async function callGemini(request: GeminiRequest): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Please add it to .env.local');
  }

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp', // Gemini 2.0 Flash
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 8192,
      responseMimeType: 'application/json', // Force JSON output
    },
  });

  // Generate content
  const result = await model.generateContent(request.prompt);
  const response = result.response;
  const text = response.text();

  // Extract token usage if available
  const tokensUsed = response.usageMetadata?.totalTokenCount;

  return {
    text,
    tokensUsed,
  };
}

/**
 * Mock Gemini response for development
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mockGeminiResponse(request: GeminiRequest): GeminiResponse {
  // Return a plausible mock response based on the prompt
  const prompt = request.prompt.toLowerCase();

  if (prompt.includes('rewrite') && prompt.includes('bullet')) {
    return {
      text: 'Led cross-functional team of 12 engineers using Agile methodology to deliver mobile application 2 weeks ahead of schedule, increasing user engagement by 25%',
      tokensUsed: 35,
    };
  }

  if (prompt.includes('star') && prompt.includes('behavioral')) {
    return {
      text: JSON.stringify({
        answers: [
          {
            question: 'Tell me about a time you led a challenging project',
            star: {
              situation:
                'At DataFlow Systems, our team faced a tight 6-week deadline to migrate our monolithic application to microservices architecture',
              task: 'I was tasked with leading the technical migration while ensuring zero downtime for 500K daily active users',
              action:
                'I architected a phased migration strategy, coordinated with 3 engineering teams, implemented feature flags for gradual rollout, and set up comprehensive monitoring',
              result:
                'Successfully completed migration 1 week early with 99.99% uptime, reduced API latency by 40%, and improved deployment frequency from monthly to daily',
            },
            keywords_used: ['led', 'microservices', 'architecture'],
            experience_source: 'DataFlow Systems - Senior Software Engineer',
          },
        ],
      }),
      tokensUsed: 150,
    };
  }

  if (prompt.includes('job description') || prompt.includes('analyze')) {
    return {
      text: JSON.stringify({
        title: 'Software Engineer',
        company: 'Tech Company',
        seniority: 'mid',
        skills_extracted: [
          { name: 'React', weight: 10, category: 'technical' },
          { name: 'Node.js', weight: 9, category: 'technical' },
          { name: 'TypeScript', weight: 8, category: 'technical' },
        ],
        must_haves: ['3+ years experience', 'React expertise', 'API development'],
        nice_to_haves: ['AWS knowledge', 'Open source contributions'],
      }),
      tokensUsed: 100,
    };
  }

  if (prompt.includes('resume') && (prompt.includes('parser') || prompt.includes('extract'))) {
    return {
      text: JSON.stringify({
        name: 'John Doe',
        contact: {
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          portfolio: null,
          website: null,
        },
        summary: 'Experienced software engineer with 5+ years building scalable web applications using React, Node.js, and cloud technologies.',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            start_date: 'Jan 2021',
            end_date: 'Present',
            bullets: [
              'Led development of microservices architecture serving 1M+ daily users',
              'Reduced API response time by 40% through optimization and caching strategies',
              'Mentored team of 5 junior engineers on best practices and code quality',
            ],
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            location: 'San Francisco, CA',
            start_date: 'Jun 2019',
            end_date: 'Dec 2020',
            bullets: [
              'Built real-time analytics dashboard using React and D3.js',
              'Implemented CI/CD pipeline reducing deployment time by 60%',
              'Collaborated with product team to deliver 15+ features',
            ],
          },
        ],
        projects: [
          {
            name: 'OpenSource Project',
            link: 'https://github.com/johndoe/project',
            description: 'A popular open-source library for data visualization',
            bullets: ['1,000+ GitHub stars', 'Used by 50+ companies'],
            technologies: ['TypeScript', 'React', 'D3.js'],
          },
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California',
            graduation_year: '2019',
            gpa: '3.8',
            honors: 'Cum Laude',
            highlights: ['Dean\'s List', 'CS Department Award'],
          },
        ],
        skills: [
          'JavaScript',
          'TypeScript',
          'React',
          'Node.js',
          'Python',
          'AWS',
          'Docker',
          'Kubernetes',
          'PostgreSQL',
          'MongoDB',
          'Git',
          'CI/CD',
        ],
        certifications: [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2022',
            credential_id: 'ABC123',
            url: 'https://aws.amazon.com/verification',
          },
        ],
      }),
      tokensUsed: 250,
    };
  }

  return {
    text: 'Mock response generated',
    tokensUsed: 10,
  };
}

/**
 * Extract first balanced JSON object from text
 */
function extractFirstJsonObject(text: string): string | null {
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return text.substring(start, i + 1);
      }
    }
  }
  return null;
}

/**
 * Parse JSON response from Gemini with robust fallback
 */
export function parseGeminiJSON<T>(response: GeminiResponse): T {
  // Trim whitespace
  let jsonText = response.text.trim();

  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // Try parsing directly
  try {
    return JSON.parse(jsonText) as T;
  } catch (firstError) {
    // Try extracting first balanced JSON object
    const extracted = extractFirstJsonObject(jsonText);
    if (extracted) {
      try {
        return JSON.parse(extracted) as T;
      } catch (secondError) {
        // Fall through to error below
      }
    }

    // Final failure - provide debugging info
    const excerpt = jsonText.substring(0, 200);
    console.error('Failed to parse Gemini JSON response. Excerpt:', excerpt);
    throw new Error(`Invalid JSON in Gemini response. Start: ${excerpt}...`);
  }
}
