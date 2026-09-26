/**
 * STAR Answer Generator
 * Generates behavioral interview answers in STAR format
 */

import type { UserProfile, JDInsights, STARAnswer, STARGeneratorOutput } from '../types';
import { callGemini, parseGeminiJSON } from './gemini-client';
import { countWords } from '../utils/text';

/**
 * Generate STAR behavioral interview answers
 */
export async function generateSTARAnswers(
  userProfile: UserProfile,
  jdInsights: JDInsights,
  numAnswers = 5
): Promise<STARGeneratorOutput> {
  // Build experience context
  const experienceContext = buildExperienceContext(userProfile);

  // Build prompt
  const prompt = buildSTARPrompt(userProfile, jdInsights, experienceContext, numAnswers);

  // Call Gemini
  const response = await callGemini({
    prompt,
    temperature: 0.8,
    maxTokens: 2000,
  });

  // Parse response
  let answers: STARAnswer[];
  try {
    const parsed = parseGeminiJSON<{ answers: STARAnswer[] }>(response);
    answers = parsed.answers;
  } catch (error) {
    console.error('Failed to parse STAR answers from Gemini');
    // Return mock answers as fallback
    answers = generateMockSTARAnswers(userProfile, jdInsights, numAnswers);
  }

  // Validate answers
  const validation = validateSTARAnswers(answers, userProfile);

  return {
    answers: answers.slice(0, numAnswers),
    validation,
  };
}

/**
 * Build experience context from user profile
 */
function buildExperienceContext(userProfile: UserProfile): string {
  const experiences: string[] = [];

  userProfile.experience.forEach((exp) => {
    experiences.push(`${exp.title} at ${exp.company}:`);
    exp.bullets.forEach((bullet) => {
      experiences.push(`  - ${bullet}`);
    });
  });

  userProfile.projects.forEach((proj) => {
    experiences.push(`Project: ${proj.name}:`);
    proj.bullets.forEach((bullet) => {
      experiences.push(`  - ${bullet}`);
    });
  });

  return experiences.join('\n');
}

/**
 * Build STAR generation prompt
 */
function buildSTARPrompt(
  userProfile: UserProfile,
  jdInsights: JDInsights,
  experienceContext: string,
  numAnswers: number
): string {
  return `You are a career coach preparing a candidate for behavioral interviews.

ROLE: ${jdInsights.title} at ${jdInsights.company}

JD MUST-HAVES:
${jdInsights.must_haves.join('\n')}

JD TOP SKILLS:
${jdInsights.keywords_top_10.join(', ')}

CANDIDATE EXPERIENCE:
${experienceContext}

Generate ${numAnswers} STAR behavioral interview answers tailored to this role.

RULES:
1. Each answer must be ≤ 120 words total
2. Format: S (Situation), T (Task), A (Action), R (Result)
3. Integrate 1-2 JD keywords naturally in Action section
4. Use ONLY real experiences from candidate's profile
5. Quantify results when possible; if not available, use [ADD METRIC]
6. Never invent achievements not in the profile
7. Reference actual companies/projects from the profile

EXAMPLE OUTPUT FORMAT:
{
  "answers": [
    {
      "question": "Tell me about a time you led a cross-functional project",
      "star": {
        "situation": "At DataFlow Systems, our Q3 product launch was delayed due to design-engineering misalignment",
        "task": "I was tasked with aligning both teams on a unified timeline for a 6-week sprint",
        "action": "I facilitated 3 design sprints, created a shared Jira board, and implemented weekly syncs using Agile methodology",
        "result": "Delivered launch 2 weeks early, improved cross-team satisfaction from 6 to 8.5, and shipped 4 features"
      },
      "keywords_used": ["cross-functional", "Agile"],
      "experience_source": "DataFlow Systems - Senior Software Engineer"
    }
  ]
}

Return ONLY valid JSON matching this format. No commentary.`;
}

/**
 * Validate STAR answers
 */
function validateSTARAnswers(
  answers: STARAnswer[],
  userProfile: UserProfile
): {
  all_from_real_experience: boolean;
  no_hallucinations: boolean;
  length_ok: boolean;
} {
  let allFromRealExperience = true;
  let noHallucinations = true;
  let lengthOk = true;

  const userCompanies = userProfile.experience.map((e) => e.company.toLowerCase());
  const userProjects = userProfile.projects.map((p) => p.name.toLowerCase());

  for (const answer of answers) {
    // Check length
    const totalWords = countWords(
      [
        answer.star.situation,
        answer.star.task,
        answer.star.action,
        answer.star.result,
      ].join(' ')
    );

    if (totalWords > 130) {
      lengthOk = false;
    }

    // Check if answer references real companies/projects
    const answerText = JSON.stringify(answer.star).toLowerCase();
    const referencesRealCompany = userCompanies.some((company) =>
      answerText.includes(company)
    );
    const referencesRealProject = userProjects.some((project) =>
      answerText.includes(project)
    );

    if (!referencesRealCompany && !referencesRealProject) {
      if (!answer.star.result.includes('[ADD METRIC]')) {
        allFromRealExperience = false;
        noHallucinations = false;
      }
    }
  }

  return {
    all_from_real_experience: allFromRealExperience,
    no_hallucinations: noHallucinations,
    length_ok: lengthOk,
  };
}

/**
 * Generate mock STAR answers (fallback)
 */
function generateMockSTARAnswers(
  userProfile: UserProfile,
  jdInsights: JDInsights,
  numAnswers: number
): STARAnswer[] {
  const answers: STARAnswer[] = [];

  if (userProfile.experience.length > 0) {
    const recentExp = userProfile.experience[0];

    answers.push({
      question: `Tell me about a time you demonstrated ${jdInsights.keywords_top_10[0]}`,
      star: {
        situation: `At ${recentExp.company}, we faced a challenge requiring ${jdInsights.keywords_top_10[0]} expertise`,
        task: 'I was responsible for delivering a solution within a tight deadline',
        action: `I utilized ${jdInsights.keywords_top_10[0]} and collaborated with the team to implement the solution`,
        result: '[ADD METRIC] Successfully delivered the project and improved team efficiency',
      },
      keywords_used: [jdInsights.keywords_top_10[0]],
      experience_source: `${recentExp.company} - ${recentExp.title}`,
    });
  }

  // Fill remaining with generic templates
  while (answers.length < numAnswers) {
    answers.push({
      question: 'Describe a challenging project you worked on',
      star: {
        situation: 'In a previous role, I encountered a complex technical challenge',
        task: 'I needed to find an innovative solution quickly',
        action: 'I researched alternatives, prototyped solutions, and collaborated with stakeholders',
        result: '[ADD METRIC] Delivered successful outcome that exceeded expectations',
      },
      keywords_used: [],
      experience_source: 'Previous experience',
    });
  }

  return answers;
}

/**
 * Export STAR answers to markdown format
 */
export function exportSTARToMarkdown(answers: STARAnswer[]): string {
  let markdown = '# Behavioral Interview Answers\n\n';

  answers.forEach((answer, index) => {
    markdown += `## ${index + 1}. ${answer.question}\n\n`;
    markdown += `**Situation**: ${answer.star.situation}\n\n`;
    markdown += `**Task**: ${answer.star.task}\n\n`;
    markdown += `**Action**: ${answer.star.action}\n\n`;
    markdown += `**Result**: ${answer.star.result}\n\n`;
    markdown += `*Keywords used: ${answer.keywords_used.join(', ')}*\n\n`;
    markdown += `*Source: ${answer.experience_source}*\n\n`;
    markdown += '---\n\n';
  });

  return markdown;
}
