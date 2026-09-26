#!/usr/bin/env tsx

/**
 * Knowledge Base Processing Script
 * Extracts structured data from PDFs in knowledge-base/raw/
 * Outputs JSON files to knowledge-base/processed/
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const RAW_DIR = path.join(process.cwd(), 'knowledge-base/raw');
const PROCESSED_DIR = path.join(process.cwd(), 'knowledge-base/processed');

interface ActionVerbs {
  leadership: string[];
  achievement: string[];
  technical: string[];
  analysis: string[];
  communication: string[];
  creativity: string[];
  [key: string]: string[];
}

interface ATSRules {
  layout: {
    single_column: boolean;
    no_tables: boolean;
    no_text_boxes: boolean;
    no_headers_footers: boolean;
    max_pages: number;
  };
  fonts: {
    approved: string[];
    body_size: { min: number; max: number };
    header_size: { min: number; max: number };
  };
  sections: {
    required: string[];
    optional: string[];
    standard_names: Record<string, string[]>;
    order: string[];
  };
  keywords: {
    min_coverage: number;
    max_density: number;
    placement: string[];
  };
}

async function main() {
  console.log('🚀 Starting knowledge base processing...\n');

  // Ensure directories exist
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  try {
    // Process each type of document
    await processActionVerbs();
    await processATSRules();
    await processBulletExamples();
    await processTemplates();

    console.log('\n✅ Knowledge base processed successfully!');
    console.log(`📁 Output directory: ${PROCESSED_DIR}`);
  } catch (error) {
    console.error('\n❌ Error processing knowledge base:', error);
    process.exit(1);
  }
}

async function processActionVerbs() {
  console.log('📝 Processing action verbs...');

  try {
    const pdfPath = path.join(RAW_DIR, 'Action-Verbs-Quantify-Accomplishments-for-Resume.pdf');

    if (!fs.existsSync(pdfPath)) {
      console.warn('⚠️  Action verbs PDF not found, using defaults');
      saveDefaultActionVerbs();
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);

    // Extract action verbs by category
    const actionVerbs: ActionVerbs = {
      leadership: extractVerbsInSection(data.text, 'leadership', [
        'Led', 'Managed', 'Directed', 'Coordinated', 'Supervised', 'Spearheaded',
        'Orchestrated', 'Oversaw', 'Guided', 'Mentored', 'Delegated', 'Chaired'
      ]),
      achievement: extractVerbsInSection(data.text, 'achievement', [
        'Achieved', 'Delivered', 'Exceeded', 'Accomplished', 'Attained', 'Completed',
        'Drove', 'Earned', 'Generated', 'Produced', 'Reached', 'Succeeded'
      ]),
      technical: extractVerbsInSection(data.text, 'technical', [
        'Developed', 'Implemented', 'Engineered', 'Architected', 'Built', 'Designed',
        'Programmed', 'Coded', 'Created', 'Deployed', 'Integrated', 'Optimized'
      ]),
      analysis: extractVerbsInSection(data.text, 'analysis', [
        'Analyzed', 'Evaluated', 'Assessed', 'Investigated', 'Researched', 'Examined',
        'Studied', 'Reviewed', 'Audited', 'Measured', 'Tested', 'Validated'
      ]),
      communication: extractVerbsInSection(data.text, 'communication', [
        'Presented', 'Documented', 'Collaborated', 'Facilitated', 'Communicated',
        'Reported', 'Briefed', 'Consulted', 'Negotiated', 'Advised', 'Conveyed'
      ]),
      creativity: extractVerbsInSection(data.text, 'creativity', [
        'Designed', 'Created', 'Innovated', 'Pioneered', 'Launched', 'Established',
        'Founded', 'Initiated', 'Introduced', 'Invented', 'Conceptualized'
      ])
    };

    // Extract quantification patterns
    const quantificationPatterns = extractQuantificationPatterns();

    const output = {
      action_verbs: actionVerbs,
      quantification_patterns: quantificationPatterns,
      metadata: {
        source: 'Action-Verbs-Quantify-Accomplishments-for-Resume.pdf',
        processed_at: new Date().toISOString(),
        total_verbs: Object.values(actionVerbs).flat().length
      }
    };

    const outputPath = path.join(PROCESSED_DIR, 'action-verbs.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`   ✓ Extracted ${output.metadata.total_verbs} action verbs`);
  } catch (error) {
    console.error('   ✗ Error processing action verbs:', error);
    saveDefaultActionVerbs();
  }
}

function extractVerbsInSection(text: string, _category: string, defaults: string[]): string[] {
  // Simple extraction - look for capitalized words
  const words = text.match(/\b[A-Z][a-z]+(?:ed|ing)?\b/g) || [];
  const verbs = new Set(defaults);

  // Add verbs found in text
  words.forEach(word => {
    if (word.length > 3 && !word.match(/^(The|This|That|With|From|And)$/)) {
      verbs.add(word);
    }
  });

  return Array.from(verbs).sort();
}

function extractQuantificationPatterns(): string[] {
  const patterns = [
    'Increased {metric} by {percent}%',
    'Reduced {metric} by {percent}%',
    'Improved {metric} by {percent}%',
    'Decreased {metric} from {value1} to {value2}',
    'Managed ${amount} budget',
    'Generated ${amount} in {timeframe}',
    'Led team of {number} people',
    'Delivered {project} in {timeframe}',
    'Achieved {metric} of {number}',
    'Exceeded {target} by {percent}%',
    'Saved ${amount} annually',
    'Grew {metric} from {value1} to {value2}'
  ];

  return patterns;
}

function saveDefaultActionVerbs() {
  const output = {
    action_verbs: {
      leadership: ['Led', 'Managed', 'Directed', 'Coordinated', 'Supervised', 'Spearheaded'],
      achievement: ['Achieved', 'Delivered', 'Exceeded', 'Accomplished', 'Drove'],
      technical: ['Developed', 'Implemented', 'Engineered', 'Architected', 'Built', 'Designed'],
      analysis: ['Analyzed', 'Evaluated', 'Assessed', 'Investigated', 'Researched'],
      communication: ['Presented', 'Documented', 'Collaborated', 'Facilitated'],
      creativity: ['Designed', 'Created', 'Innovated', 'Pioneered', 'Launched']
    },
    quantification_patterns: extractQuantificationPatterns(''),
    metadata: {
      source: 'defaults',
      processed_at: new Date().toISOString(),
      total_verbs: 30
    }
  };

  const outputPath = path.join(PROCESSED_DIR, 'action-verbs.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
}

async function processATSRules() {
  console.log('📋 Processing ATS rules...');

  // Define ATS rules based on industry best practices
  const atsRules: ATSRules = {
    layout: {
      single_column: true,
      no_tables: true,
      no_text_boxes: true,
      no_headers_footers: true,
      max_pages: 1
    },
    fonts: {
      approved: ['Arial', 'Calibri', 'Helvetica', 'Times New Roman'],
      body_size: { min: 10.5, max: 11.5 },
      header_size: { min: 12, max: 14 }
    },
    sections: {
      required: ['Experience', 'Education', 'Skills'],
      optional: ['Summary', 'Projects', 'Certifications', 'Activities', 'Awards'],
      standard_names: {
        Experience: ['Experience', 'Work Experience', 'Professional Experience'],
        Education: ['Education'],
        Skills: ['Skills', 'Technical Skills', 'Core Competencies'],
        Projects: ['Projects', 'Personal Projects', 'Portfolio'],
        Summary: ['Summary', 'Professional Summary', 'Profile']
      },
      order: ['Summary', 'Experience', 'Projects', 'Education', 'Skills', 'Certifications']
    },
    keywords: {
      min_coverage: 8,
      max_density: 0.03,
      placement: ['summary', 'experience_bullets', 'skills']
    }
  };

  const output = {
    ...atsRules,
    metadata: {
      source: 'Industry best practices + ATS documentation',
      processed_at: new Date().toISOString()
    }
  };

  const outputPath = path.join(PROCESSED_DIR, 'ats-rules.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log('   ✓ ATS rules compiled');
}

async function processBulletExamples() {
  console.log('📌 Processing bullet examples...');

  // High-quality bullet examples
  const examples = [
    {
      text: 'Led cross-functional team of 12 engineers and designers to deliver mobile app 2 weeks ahead of Q3 deadline',
      category: 'leadership',
      has_quantification: true,
      keywords: ['led', 'cross-functional', 'team', 'deliver', 'mobile app'],
      quality_score: 9
    },
    {
      text: 'Implemented automated testing pipeline using Jest and GitHub Actions, reducing QA time by 40%',
      category: 'technical',
      has_quantification: true,
      keywords: ['implemented', 'automated testing', 'Jest', 'GitHub Actions', 'reducing'],
      quality_score: 9
    },
    {
      text: 'Analyzed user feedback from 5,000+ survey responses to identify top 3 feature requests',
      category: 'analysis',
      has_quantification: true,
      keywords: ['analyzed', 'user feedback', 'survey', 'identify', 'feature requests'],
      quality_score: 8
    },
    {
      text: 'Designed and launched company blog, attracting 10K monthly visitors and generating 200+ qualified leads',
      category: 'creativity',
      has_quantification: true,
      keywords: ['designed', 'launched', 'blog', 'attracting', 'generating', 'leads'],
      quality_score: 10
    },
    {
      text: 'Presented quarterly business review to C-suite executives, securing $2M budget approval',
      category: 'communication',
      has_quantification: true,
      keywords: ['presented', 'business review', 'executives', 'securing', 'budget'],
      quality_score: 9
    },
    {
      text: 'Exceeded sales quota by 125% in Q4, closing 15 enterprise deals worth $3.5M total',
      category: 'achievement',
      has_quantification: true,
      keywords: ['exceeded', 'quota', 'closing', 'enterprise deals'],
      quality_score: 10
    }
  ];

  const output = {
    examples,
    metadata: {
      source: 'Curated high-quality resume bullets',
      processed_at: new Date().toISOString(),
      total_examples: examples.length
    }
  };

  const outputPath = path.join(PROCESSED_DIR, 'bullet-examples.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`   ✓ Compiled ${examples.length} bullet examples`);
}

async function processTemplates() {
  console.log('📄 Processing resume templates...');

  const templates = [
    {
      name: 'ATS Clean',
      sections: ['Summary', 'Experience', 'Projects', 'Education', 'Skills'],
      layout_type: 'single-column' as const,
      ats_safe: true,
      description: 'Minimal single-column layout optimized for ATS parsing'
    },
    {
      name: 'ATS Modern',
      sections: ['Experience', 'Projects', 'Education', 'Skills', 'Certifications'],
      layout_type: 'single-column' as const,
      ats_safe: true,
      description: 'Modern single-column layout with subtle visual hierarchy'
    }
  ];

  const output = {
    templates,
    metadata: {
      source: 'HustlerAI template definitions',
      processed_at: new Date().toISOString(),
      total_templates: templates.length
    }
  };

  const outputPath = path.join(PROCESSED_DIR, 'templates.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`   ✓ Processed ${templates.length} templates`);
}

// Run the script
main();
