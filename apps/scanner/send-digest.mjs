#!/usr/bin/env node
/**
 * send-digest.mjs — send top N unchecked pipeline items to Telegram
 * Usage: node send-digest.mjs [count]   (default: 10)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const limit = parseInt(process.argv[2] || '10', 10);
const pipelinePath = path.join(__dirname, 'data', 'pipeline.md');

if (!fs.existsSync(pipelinePath)) {
  console.log('No pipeline.md found');
  process.exit(0);
}

const pending = fs.readFileSync(pipelinePath, 'utf8')
  .split('\n')
  .filter(l => l.startsWith('- [ ]'))
  .slice(0, limit);

if (pending.length === 0) {
  console.log('No pending items in pipeline');
  process.exit(0);
}

const items = pending.map(l => {
  const content = l.replace('- [ ] ', '');
  const parts = content.split(' | ');
  const url = parts[0];
  const company = parts[1] || '';
  const title = parts[2] || '';
  const location = parts[3] || '';
  return `• [${company} — ${title}](${url})\n  _${location}_`;
}).join('\n\n');

const msg = `📋 *Top ${pending.length} pending jobs*\n\n${items}`;

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: msg,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  }),
});
const json = await res.json();
if (!json.ok) {
  console.error('Telegram error:', json.description);
  process.exit(1);
}
console.log(`Sent digest of ${pending.length} jobs`);
