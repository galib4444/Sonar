#!/usr/bin/env node
/**
 * push-to-sheets.mjs — push new pipeline jobs to Google Sheets via Apps Script webhook
 *
 * Usage:
 *   node push-to-sheets.mjs                  # push all pending jobs from pipeline.md
 *   node push-to-sheets.mjs --since 1        # only jobs added today (posted within N days)
 *   node push-to-sheets.mjs --limit 20       # cap at N rows
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const WEBHOOK = process.env.SHEETS_WEBHOOK_URL;
if (!WEBHOOK) {
  console.error('Missing SHEETS_WEBHOOK_URL in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const sinceIdx = args.indexOf('--since');
const sinceDays = sinceIdx >= 0 ? parseInt(args[sinceIdx + 1], 10) : null;
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;

const pipelinePath = path.join(__dirname, 'data', 'pipeline.md');
if (!fs.existsSync(pipelinePath)) {
  console.error('data/pipeline.md not found');
  process.exit(1);
}

function guessTrack(role) {
  const r = role.toLowerCase();
  if (r.includes('data analyst') || r.includes('business analyst') || r.includes('analytics') || r.includes('business data')) return 'Data';
  if (r.includes('ai engineer') || r.includes('ai researcher') || r.includes('ml engineer') || r.includes('machine learning') || r.includes('research engineer') || r.includes('applied ai') || r.includes('model') || r.includes('reinforcement') || r.includes('safeguards')) return 'AI Engineering';
  if (r.includes('solutions architect') || r.includes('solutions engineer') || r.includes('forward deployed') || r.includes('implementation') || r.includes('customer success') || r.includes('consultant') || r.includes('account executive') || r.includes('pre-sales')) return 'Business';
  if (r.includes('product manager') || r.includes('product lead')) return 'Product';
  if (r.includes('software engineer') || r.includes('software developer') || r.includes('full stack') || r.includes('full-stack') || r.includes('platform engineer') || r.includes('site reliability') || r.includes('devops') || r.includes('engineering manager')) return 'Software Engineering';
  return 'Other';
}

function guessSource(url) {
  if (url.includes('greenhouse.io')) return 'Greenhouse';
  if (url.includes('ashbyhq.com')) return 'Ashby';
  if (url.includes('lever.co')) return 'Lever';
  if (url.includes('bamboohr.com')) return 'BambooHR';
  if (url.includes('breezy.hr')) return 'Breezy';
  if (url.includes('myworkdayjobs.com')) return 'Workday';
  return 'ATS Scan';
}

const cutoff = sinceDays ? new Date(Date.now() - sinceDays * 86400000) : null;

const lines = fs.readFileSync(pipelinePath, 'utf8').split('\n')
  .filter(l => l.startsWith('- [ ]') || l.startsWith('- [x]'));

let rows = [];
for (const line of lines) {
  const content = line.replace(/^- \[.\] /, '');
  const parts = content.split(' | ');
  const url = parts[0]?.trim() || '';
  const company = parts[1]?.trim() || '';
  const role = parts[2]?.trim() || '';
  const location = parts[3]?.trim() || '';
  const postedRaw = parts[4]?.replace('posted:', '').trim() || '';

  // Apply date filter if --since given
  if (cutoff && postedRaw) {
    const posted = new Date(postedRaw);
    if (!isNaN(posted) && posted < cutoff) continue;
  }

  rows.push({
    company,
    role,
    track: guessTrack(role),
    location,
    salary: '',
    source: guessSource(url),
    url,
    resumeVersion: '',
    dateApplied: '',
    status: 'To Apply',
    nextAction: 'Evaluate and apply',
    nextActionDate: '',
    contact: '',
    notes: '',
    postedDate: postedRaw,
  });
}

if (limit) rows = rows.slice(0, limit);

if (rows.length === 0) {
  console.log('No rows to push.');
  process.exit(0);
}

console.log(`Pushing ${rows.length} rows to Google Sheets...`);

// Google Apps Script redirects POST → echo URL; POST first then GET the redirect
async function postToSheet(batch) {
  // Step 1: POST (don't follow redirect)
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows: batch }),
    redirect: 'manual',
  });
  const echoUrl = res.headers.get('location');
  if (!echoUrl) throw new Error(`No redirect URL (status ${res.status})`);

  // Step 2: GET the echo URL to read the response
  const echoRes = await fetch(echoUrl);
  const text = await echoRes.text();
  try { return JSON.parse(text); } catch { return { ok: false, error: text }; }
}

// Send in batches of 100 to avoid Apps Script timeout
const BATCH = 100;
let pushed = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const json = await postToSheet(batch);

  if (!json.ok) {
    console.error(`Batch ${i / BATCH + 1} failed:`, json.error);
    process.exit(1);
  }
  pushed += batch.length;
  console.log(`  ${pushed}/${rows.length} pushed`);
}

console.log(`✅ Done — ${pushed} rows added to sheet`);
