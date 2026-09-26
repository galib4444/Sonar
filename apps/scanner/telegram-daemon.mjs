#!/usr/bin/env node
/**
 * telegram-daemon.mjs — background bot that responds to your Telegram commands
 *
 * Handles simple commands directly. Queues complex ones to agent-inbox.md.
 *
 * Usage:
 *   node telegram-daemon.mjs          # runs until Ctrl+C
 *   node telegram-daemon.mjs &        # run in background (use `kill %1` to stop)
 *
 * Commands you can send from Telegram:
 *   jobs / pipeline    → list pending job URLs from data/pipeline.md
 *   status / tracker   → application tracker summary
 *   inbox              → show agent-inbox.md
 *   help               → list commands
 *   anything else      → queued to agent-inbox.md for next Claude Code session
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const POLL_INTERVAL_MS = 60_000; // 60 seconds

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const offsetFile = path.join(__dirname, 'data', '.telegram-offset');
const inboxPath = path.join(__dirname, 'data', 'agent-inbox.md');
const pipelinePath = path.join(__dirname, 'data', 'pipeline.md');
const trackerPath = path.join(__dirname, 'data', 'applications.md');

async function send(text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  });
  const json = await res.json();
  if (!json.ok) console.error('Send error:', json.description);
}

function readOffset() {
  return fs.existsSync(offsetFile)
    ? parseInt(fs.readFileSync(offsetFile, 'utf8').trim(), 10) || 0
    : 0;
}

function saveOffset(n) {
  fs.writeFileSync(offsetFile, String(n));
}

function handleJobs() {
  if (!fs.existsSync(pipelinePath)) return '📭 No pipeline file yet. Run a scan first.';
  const lines = fs.readFileSync(pipelinePath, 'utf8').split('\n');
  const pending = lines.filter(l => l.startsWith('- [ ]'));
  if (pending.length === 0) return '📭 No pending jobs in pipeline. Run a scan to find new ones.';
  const preview = pending.slice(0, 10).map((l, i) => {
    const match = l.match(/\|\s*([^|]+)\s*\|\s*([^|]+)/);
    return match ? `${i + 1}. *${match[2].trim()}* @ ${match[1].trim()}` : `${i + 1}. ${l.replace('- [ ]', '').trim()}`;
  }).join('\n');
  const more = pending.length > 10 ? `\n…and ${pending.length - 10} more` : '';
  return `📋 *${pending.length} pending jobs:*\n\n${preview}${more}\n\nOpen Claude Code and say "pipeline" to evaluate them.`;
}

function handleStatus() {
  if (!fs.existsSync(trackerPath)) return '📭 No applications tracked yet.';
  const lines = fs.readFileSync(trackerPath, 'utf8').split('\n');
  const rows = lines.filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('# ') && !l.includes('Company'));
  if (rows.length === 0) return '📭 Tracker is empty — no applications yet.';
  const summary = rows.slice(0, 8).map(row => {
    const cols = row.split('|').filter(Boolean).map(c => c.trim());
    if (cols.length >= 6) return `• ${cols[2]} — ${cols[3].slice(0, 30)} [${cols[5]}]`;
    return null;
  }).filter(Boolean).join('\n');
  const more = rows.length > 8 ? `\n…and ${rows.length - 8} more` : '';
  return `📊 *${rows.length} applications:*\n\n${summary}${more}`;
}

function handleInbox() {
  if (!fs.existsSync(inboxPath)) return '📭 Agent inbox is empty.';
  const content = fs.readFileSync(inboxPath, 'utf8').trim();
  if (!content) return '📭 Agent inbox is empty.';
  const preview = content.length > 600 ? content.slice(0, 600) + '\n…(truncated)' : content;
  return `📋 *Agent Inbox:*\n\`\`\`\n${preview}\n\`\`\``;
}

function handleHelp() {
  return `🤖 *Sonar bot*\n\nCommands:\n• *jobs* — pending job URLs\n• *status* — application tracker\n• *inbox* — queued instructions\n• *help* — this message\n\nAnything else gets queued to the inbox for next Claude Code session.\n\nOpen Claude Code and say "pipeline" to evaluate jobs, or "inbox" to drain queued commands.`;
}

function queueToInbox(text, date) {
  const header = fs.existsSync(inboxPath) ? '' : '# Agent Inbox\n\n';
  fs.appendFileSync(inboxPath, header + `- [ ] [${date}] ${text}\n`);
  return `📝 Queued: _"${text}"_\n\nI'll handle it next time Claude Code opens. Type *inbox* to see what's queued.`;
}

async function processMessage(text, date) {
  const cmd = text.toLowerCase().trim();

  if (cmd === 'jobs' || cmd === 'pipeline' || cmd.includes('job posting') || cmd.includes('fresh jobs')) {
    return handleJobs();
  }
  if (cmd === 'status' || cmd === 'tracker' || cmd.includes('application')) {
    return handleStatus();
  }
  if (cmd === 'inbox') {
    return handleInbox();
  }
  if (cmd === 'help' || cmd === '/help' || cmd === '/start') {
    return handleHelp();
  }

  // Everything else: queue for Claude Code
  return queueToInbox(text, date);
}

async function poll() {
  const offset = readOffset();
  const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&limit=100&timeout=0`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.ok) {
      console.error(`[${new Date().toISOString()}] API error:`, json.description);
      return;
    }

    const updates = json.result || [];
    const messages = updates.filter(
      u => u.message?.chat?.id?.toString() === CHAT_ID.toString() && u.message?.text
    );

    for (const u of messages) {
      const text = u.message.text.trim();
      const date = new Date(u.message.date * 1000).toISOString().slice(0, 16).replace('T', ' ');
      console.log(`[${date}] Received: ${text}`);
      const reply = await processMessage(text, date);
      await send(reply);
      console.log(`[${date}] Replied.`);
    }

    if (updates.length > 0) {
      saveOffset(updates[updates.length - 1].update_id + 1);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Poll error:`, err.message);
  }
}

console.log(`Sonar Telegram daemon started (polling every ${POLL_INTERVAL_MS / 1000}s)`);
console.log('Send "help" to your bot to see available commands. Ctrl+C to stop.\n');

// Run immediately, then on interval
await poll();
setInterval(poll, POLL_INTERVAL_MS);
