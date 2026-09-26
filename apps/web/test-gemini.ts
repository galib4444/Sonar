#!/usr/bin/env tsx

/**
 * Test script for Gemini API integration
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { callGemini } from './lib/ai/gemini-client';

async function testGemini() {
  console.log('🧪 Testing Gemini API integration...\n');

  try {
    // Test 1: Simple prompt
    console.log('Test 1: Simple text generation');
    const result1 = await callGemini({
      prompt: 'Say "Hello from Gemini!" in a friendly way.',
      temperature: 0.7,
    });
    console.log('✓ Response:', result1.text);
    console.log('✓ Tokens used:', result1.tokensUsed || 'N/A');
    console.log('');

    // Test 2: JSON response (job description analysis)
    console.log('Test 2: Job description analysis (JSON)');
    const result2 = await callGemini({
      prompt: `Analyze this job description and return JSON with title, company, seniority (junior/mid/senior), and top 3 skills:

"We are seeking a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. Must have experience with AWS and microservices architecture."

Return ONLY valid JSON, no other text.`,
      temperature: 0.3,
    });
    console.log('✓ Response:', result2.text.substring(0, 200) + '...');
    console.log('✓ Tokens used:', result2.tokensUsed || 'N/A');
    console.log('');

    console.log('✅ All tests passed! Gemini API is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testGemini();
