/**
 * Keyword extraction utilities
 */

import { extractWords, calculateTFIDF } from './text';

// Common stopwords to filter out
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'up',
  'about',
  'into',
  'through',
  'during',
  'including',
  'until',
  'against',
  'among',
  'throughout',
  'despite',
  'towards',
  'upon',
  'concerning',
  'will',
  'be',
  'is',
  'are',
  'was',
  'were',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'can',
  'could',
  'may',
  'might',
  'must',
  'shall',
  'should',
  'would',
]);

/**
 * Extract top keywords from text using TF-IDF
 */
export function extractTopKeywords(
  text: string,
  topN = 20,
  corpus?: string[]
): string[] {
  const words = extractWords(text);

  // Filter stopwords and short words
  const filteredWords = words.filter(
    (word) => !STOPWORDS.has(word.toLowerCase()) && word.length >= 3
  );

  if (!corpus) {
    // Simple frequency-based extraction if no corpus provided
    const freq = new Map<string, number>();
    filteredWords.forEach((word) => {
      freq.set(word, (freq.get(word) || 0) + 1);
    });

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }

  // TF-IDF based extraction
  const tfidf = calculateTFIDF(text, corpus);

  return Array.from(tfidf.entries())
    .filter(([word]) => word.length >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Calculate keyword overlap between two texts
 */
export function calculateKeywordOverlap(
  text1: string,
  text2: string
): {
  overlap: number;
  matched: string[];
  unique1: string[];
  unique2: string[];
} {
  const words1 = new Set(extractWords(text1).filter((w) => w.length >= 3));
  const words2 = new Set(extractWords(text2).filter((w) => w.length >= 3));

  const matched: string[] = [];
  const unique1: string[] = [];

  words1.forEach((word) => {
    if (words2.has(word)) {
      matched.push(word);
    } else {
      unique1.push(word);
    }
  });

  const unique2 = Array.from(words2).filter((word) => !words1.has(word));

  const overlap = matched.length / Math.max(words1.size, words2.size, 1);

  return { overlap, matched, unique1, unique2 };
}

/**
 * Calculate keyword density (keyword count / total words)
 */
export function calculateKeywordDensity(
  text: string,
  keywords: string[]
): number {
  const words = extractWords(text);
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  const keywordCount = words.filter((word) =>
    keywordSet.has(word.toLowerCase())
  ).length;

  return words.length > 0 ? keywordCount / words.length : 0;
}

/**
 * Extract multi-word phrases (bigrams and trigrams)
 */
export function extractPhrases(text: string, maxLength = 3): string[] {
  const words = text
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/gi) || [];

  const phrases: string[] = [];

  for (let n = 2; n <= maxLength; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      // Filter out phrases with stopwords
      if (!words.slice(i, i + n).some((w) => STOPWORDS.has(w))) {
        phrases.push(phrase);
      }
    }
  }

  return phrases;
}

/**
 * Get common skill aliases for fuzzy matching
 */
export function getSkillAliases(skill: string): string[] {
  const aliasMap: Record<string, string[]> = {
    javascript: ['js', 'ecmascript', 'es6', 'es2015'],
    typescript: ['ts'],
    python: ['python3', 'py'],
    'react': ['reactjs', 'react.js'],
    'react native': ['reactnative', 'rn'],
    vue: ['vuejs', 'vue.js'],
    angular: ['angularjs', 'ng'],
    'node.js': ['nodejs', 'node'],
    'machine learning': ['ml', 'ai/ml'],
    'artificial intelligence': ['ai'],
    docker: ['containerization', 'containers'],
    kubernetes: ['k8s', 'k8'],
    aws: ['amazon web services'],
    gcp: ['google cloud platform', 'google cloud'],
    azure: ['microsoft azure'],
  };

  const normalizedSkill = skill.toLowerCase();
  return aliasMap[normalizedSkill] || [normalizedSkill];
}
