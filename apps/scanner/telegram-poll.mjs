#!/usr/bin/env node
/**
 * telegram-poll.mjs — drain new Telegram replies into data/agent-inbox.md
 *
 * Run this at the start of a session to pick up commands you sent from your phone.
 *
 * Usage:
 *   node telegram-poll.mjs          # drain new messages, print summary
 *   node telegram-poll.mjs --dry    # print what would be added, don't write
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

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const DRY = process.argv.includes('--dry');
const offsetFile = path.join(__dirname, 'data', '.telegram-offset');
const inboxPath = path.join(__dirname, 'data', 'agent-inbox.md');

// Read last known update offset
let offset = 0;
if (fs.existsSync(offsetFile)) {
  offset = parseInt(fs.readFileSync(offsetFile, 'utf8').trim(), 10) || 0;
}

// Fetch updates from Telegram
const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&limit=100&timeout=0`;
const res = await fetch(url);
const json = await res.json();

if (!json.ok) {
  console.error('Telegram API error:', json.description);
  process.exit(1);
}

const updates = json.result || [];

// Filter to messages from our chat only, text messages only
const messages = updates
  .filter(u => u.message?.chat?.id?.toString() === CHAT_ID.toString() && u.message?.text)
  .map(u => ({
    id: u.update_id,
    date: new Date(u.message.date * 1000).toISOString().slice(0, 16).replace('T', ' '),
    text: u.message.text.trim(),
  }));

if (messages.length === 0) {
  console.log('No new messages.');
} else {
  console.log(`${messages.length} new message(s):`);
  for (const m of messages) {
    console.log(`  [${m.date}] ${m.text}`);
  }

  if (!DRY) {
    // Append to agent-inbox.md
    const header = fs.existsSync(inboxPath) ? '' : '# Agent Inbox\n\n';
    const entries = messages
      .map(m => `- [ ] [${m.date}] ${m.text}`)
      .join('\n');
    fs.appendFileSync(inboxPath, header + entries + '\n');
    console.log(`\nAppended to data/agent-inbox.md`);
  } else {
    console.log('\n(dry run — nothing written)');
  }
}

// Advance offset past all seen updates
if (updates.length > 0 && !DRY) {
  const nextOffset = updates[updates.length - 1].update_id + 1;
  fs.writeFileSync(offsetFile, String(nextOffset));
}
