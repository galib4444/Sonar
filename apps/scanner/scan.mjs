#!/usr/bin/env node
/**
 * scan.mjs — zero-token ATS scanner
 *
 * Reads portals.yml, hits Greenhouse / Ashby / Lever public APIs,
 * deduplicates against data/scan-history.tsv, and appends new matches
 * to data/pipeline.md.
 *
 * Output format expected by daily-scan.sh and the GitHub Actions workflow:
 *   New offers added:  <N>
 *   + Company | Title       ← top picks (first 10)
 *
 * Usage:
 *   node scan.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad } from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const portalsPath = path.join(__dirname, 'portals.yml');
const historyPath = path.join(__dirname, 'data', 'scan-history.tsv');
const pipelinePath = path.join(__dirname, 'data', 'pipeline.md');

// Ensure data/ exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// Load config
const portals = yamlLoad(fs.readFileSync(portalsPath, 'utf8'));
const titleFilter = portals.title_filter || {};
const positiveKeywords = titleFilter.positive || [];
const negativeKeywords = titleFilter.negative || [];
const locationFilter = portals.location_filter || {};

// Load dedup set from scan-history.tsv (first column = URL)
const seenUrls = new Set();
if (fs.existsSync(historyPath)) {
  const lines = fs.readFileSync(historyPath, 'utf8').split('\n');
  for (const line of lines.slice(1)) { // skip header
    const url = line.split('\t')[0].trim();
    if (url) seenUrls.add(url);
  }
}

// ---------- Filters ----------

function matchesTitle(title) {
  const t = title || '';
  for (const neg of negativeKeywords) {
    if (t.toLowerCase().includes(neg.toLowerCase())) return false;
  }
  for (const pos of positiveKeywords) {
    if (pos.includes(' + ')) {
      const parts = pos.split(' + ');
      if (parts.every(p => t.toLowerCase().includes(p.toLowerCase()))) return true;
    } else if (pos.length <= 3) {
      if (new RegExp(`\\b${pos}\\b`, 'i').test(t)) return true;
    } else {
      if (t.toLowerCase().includes(pos.toLowerCase())) return true;
    }
  }
  return false;
}

function matchesLocation(location) {
  const loc = (location || '').toLowerCase();
  if (!loc) return true;

  for (const kw of locationFilter.block_hard || []) {
    if (loc.includes(kw.toLowerCase())) return false;
  }
  for (const kw of locationFilter.always_allow || []) {
    if (loc.includes(kw.toLowerCase())) return true;
  }
  for (const kw of locationFilter.block || []) {
    if (loc.includes(kw.toLowerCase())) return false;
  }
  const allowList = locationFilter.allow || [];
  if (allowList.length === 0) return true;
  return allowList.some(a => loc.includes(a.toLowerCase()));
}

// ---------- ATS fetchers ----------

async function fetchGreenhouse(slug) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=false`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map(j => ({
    title: j.title || '',
    url: j.absolute_url || '',
    location: j.location?.name || '',
    postedAt: j.updated_at ? j.updated_at.slice(0, 10) : '',
  }));
}

async function fetchAshby(slug) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map(j => ({
    title: j.title || '',
    url: j.jobUrl || '',
    location: j.locationName || j.location || '',
    postedAt: j.publishedDate ? j.publishedDate.slice(0, 10) : '',
  }));
}

async function fetchLever(slug) {
  const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data || []).map(j => ({
    title: j.text || '',
    url: j.hostedUrl || '',
    location: j.categories?.location || j.workplaceType || '',
    postedAt: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : '',
  }));
}

// ---------- Provider detection ----------

function detectProvider(company) {
  if (company.provider) return company.provider;
  const src = (company.api || company.careers_url || '').toLowerCase();
  if (src.includes('boards-api.greenhouse.io') || src.includes('greenhouse.io')) return 'greenhouse';
  if (src.includes('ashbyhq.com')) return 'ashby';
  if (src.includes('lever.co')) return 'lever';
  return null;
}

function extractSlug(company, provider) {
  const apiUrl = company.api || company.careers_url || '';
  try {
    const u = new URL(apiUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    if (provider === 'greenhouse') {
      // boards-api.greenhouse.io/v1/boards/{slug}/jobs  OR  job-boards.greenhouse.io/{slug}
      if (u.hostname.includes('boards-api')) return parts[2];
      return parts[0];
    }
    if (provider === 'ashby') return parts[0]; // jobs.ashbyhq.com/{slug}
    if (provider === 'lever') return parts[0]; // jobs.lever.co/{slug}
  } catch {}
  return null;
}

// ---------- Main ----------

const companies = (portals.tracked_companies || []).filter(c => c.enabled !== false);
const scannable = companies.filter(c => {
  if (c.scan_method === 'websearch') return false;
  const p = detectProvider(c);
  return p === 'greenhouse' || p === 'ashby' || p === 'lever';
});

console.log(`Scanning ${scannable.length} companies (of ${companies.length} total, ${companies.length - scannable.length} skipped/websearch)...`);

const today = new Date().toISOString().slice(0, 10);
const newJobs = [];
const errors = [];

for (const company of scannable) {
  const provider = detectProvider(company);
  const slug = extractSlug(company, provider);
  if (!slug) {
    errors.push(`${company.name}: could not extract slug`);
    continue;
  }

  try {
    let jobs = [];
    if (provider === 'greenhouse') jobs = await fetchGreenhouse(slug);
    else if (provider === 'ashby') jobs = await fetchAshby(slug);
    else if (provider === 'lever') jobs = await fetchLever(slug);

    for (const job of jobs) {
      if (!job.url || seenUrls.has(job.url)) continue;
      if (!matchesTitle(job.title)) continue;
      if (!matchesLocation(job.location)) continue;
      newJobs.push({ ...job, companyName: company.name, provider });
      seenUrls.add(job.url);
    }
  } catch (err) {
    errors.push(`${company.name}: ${err.message}`);
  }
}

// Write results
if (newJobs.length > 0) {
  // Append to pipeline.md
  if (!fs.existsSync(pipelinePath)) {
    fs.writeFileSync(pipelinePath, '# Pipeline — Pending URLs\n\nPaste job URLs below as `- [ ] {url}` then run `node scan.mjs`.\n\n');
  }
  const pipelineLines = newJobs
    .map(j => `- [ ] ${j.url} | ${j.companyName} | ${j.title} | ${j.location || 'Remote'} | posted: ${j.postedAt || today}`)
    .join('\n');
  fs.appendFileSync(pipelinePath, pipelineLines + '\n');

  // Append to scan-history.tsv (create with header if new)
  const hasHistory = fs.existsSync(historyPath);
  if (!hasHistory) {
    fs.writeFileSync(historyPath, 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\tlocation\tfingerprint\tposted_at\ttrust_score\ttrust_flags\tnormalized_company\n');
  }
  const historyLines = newJobs
    .map(j => [
      j.url, today, j.provider + '-api', j.title, j.companyName,
      'added', j.location || '', '', j.postedAt || '',
      '', '', (j.companyName || '').toLowerCase(),
    ].join('\t'))
    .join('\n');
  fs.appendFileSync(historyPath, historyLines + '\n');
}

// Print summary in the format the workflow greps for
console.log(`\nNew offers added:  ${newJobs.length}`);
for (const job of newJobs.slice(0, 10)) {
  console.log(`  + ${job.companyName} | ${job.title}`);
}

if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors.slice(0, 10)) console.log(`  - ${e}`);
}
