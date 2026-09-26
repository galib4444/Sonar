/**
 * Text processing utilities
 */

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract words from text
 */
export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/gi) || [];
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
}

/**
 * Fuzzy match two strings
 * Returns true if similarity > threshold (default 0.7)
 */
export function fuzzyMatch(str1: string, str2: string, threshold = 0.7): boolean {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;
  return similarity >= threshold;
}

/**
 * Check if string contains any of the keywords
 */
export function containsKeyword(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
}

/**
 * Extract metrics (numbers, percentages, currency) from text
 */
export function extractMetrics(text: string): string[] {
  const patterns = [
    /\d+%/, // Percentages: 25%
    /\$[\d,]+(?:\.\d{2})?[KMB]?/, // Currency: $100K, $1.5M
    /\d+\+?(?:\s+(?:people|users|clients|customers))?/, // Numbers: 10+, 50 users
    /\b\d+(?:x|X)\b/, // Multipliers: 2x, 10X
  ];

  const metrics: string[] = [];
  patterns.forEach((pattern) => {
    const matches = text.match(new RegExp(pattern, 'g'));
    if (matches) metrics.push(...matches);
  });

  return metrics;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Calculate TF-IDF scores for keywords
 */
export function calculateTFIDF(
  document: string,
  corpus: string[]
): Map<string, number> {
  const words = extractWords(document);
  const wordFreq = new Map<string, number>();

  // Calculate term frequency
  words.forEach((word) => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Calculate TF-IDF
  const tfidf = new Map<string, number>();
  wordFreq.forEach((freq, word) => {
    const tf = freq / words.length;

    // Calculate IDF
    const docsWithWord = corpus.filter((doc) =>
      doc.toLowerCase().includes(word)
    ).length;
    const idf = Math.log(corpus.length / (docsWithWord + 1));

    tfidf.set(word, tf * idf);
  });

  return tfidf;
}
