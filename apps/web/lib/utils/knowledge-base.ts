/**
 * Knowledge Base Loader
 * Loads processed JSON data from knowledge-base/processed/
 */

import fs from 'fs';
import path from 'path';
import type { ActionVerbs, BulletExample, Template, ATSRules } from '../types';

const PROCESSED_DIR = path.join(process.cwd(), 'knowledge-base/processed');

// Cache for loaded data
const cache = new Map<string, unknown>();

/**
 * Load action verbs from knowledge base
 */
export function loadActionVerbs(): ActionVerbs & {
  quantification_patterns: string[];
} {
  const cacheKey = 'action-verbs';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as ActionVerbs & {
      quantification_patterns: string[];
    };
  }

  const filePath = path.join(PROCESSED_DIR, 'action-verbs.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  cache.set(cacheKey, data);
  return data;
}

/**
 * Load ATS rules from knowledge base
 */
export function loadATSRules(): ATSRules {
  const cacheKey = 'ats-rules';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as ATSRules;
  }

  const filePath = path.join(PROCESSED_DIR, 'ats-rules.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  cache.set(cacheKey, data);
  return data;
}

/**
 * Load bullet examples from knowledge base
 */
export function loadBulletExamples(): { examples: BulletExample[] } {
  const cacheKey = 'bullet-examples';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as { examples: BulletExample[] };
  }

  const filePath = path.join(PROCESSED_DIR, 'bullet-examples.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  cache.set(cacheKey, data);
  return data;
}

/**
 * Load resume templates from knowledge base
 */
export function loadTemplates(): { templates: Template[] } {
  const cacheKey = 'templates';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as { templates: Template[] };
  }

  const filePath = path.join(PROCESSED_DIR, 'templates.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  cache.set(cacheKey, data);
  return data;
}

/**
 * Get random action verb from a category
 */
export function getRandomActionVerb(category: keyof ActionVerbs): string {
  const actionVerbs = loadActionVerbs();
  const verbs = actionVerbs.action_verbs[category];

  if (!verbs || verbs.length === 0) {
    return 'Performed';
  }

  return verbs[Math.floor(Math.random() * verbs.length)];
}

/**
 * Get action verbs for a category
 */
export function getActionVerbsForCategory(category: keyof ActionVerbs): string[] {
  const actionVerbs = loadActionVerbs();
  return actionVerbs.action_verbs[category] || [];
}

/**
 * Get all action verbs (flattened)
 */
export function getAllActionVerbs(): string[] {
  const actionVerbs = loadActionVerbs();
  return Object.values(actionVerbs.action_verbs).flat();
}

/**
 * Clear cache (useful for testing or when files are updated)
 */
export function clearKnowledgeBaseCache(): void {
  cache.clear();
}
