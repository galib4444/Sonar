#!/usr/bin/env node
/**
 * notify.mjs — send Telegram messages/files to the Sonar chat
 *
 * Usage:
 *   node notify.mjs "your message here"
 *   node notify.mjs --scan-done 5              # "Scan complete — 5 new matches"
 *   node notify.mjs --eval "Stripe" 4.3        # scored notification
 *   node notify.mjs --inbox                    # send current agent-inbox to phone
 *   node notify.mjs --pdf-ready "Stripe" "SWE" # text notification
 *   node notify.mjs --send-pdf path/to/file.pdf "Stripe — SWE Engineer"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dependency needed)
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

async function send(text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.description);
  return json;
}

async function sendPdf(filePath, caption) {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const fileBytes = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  // Build multipart/form-data manually (no external deps)
  const boundary = `----FormBoundary${Date.now()}`;
  const CRLF = '\r\n';

  const parts = [];

  // chat_id field
  parts.push(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}` +
    `${CHAT_ID}`
  );

  // caption field
  if (caption) {
    parts.push(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="caption"${CRLF}${CRLF}` +
      caption
    );
  }

  const header = parts.join(CRLF) + CRLF;
  const fileHeader =
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="document"; filename="${fileName}"${CRLF}` +
    `Content-Type: application/pdf${CRLF}${CRLF}`;
  const footer = `${CRLF}--${boundary}--${CRLF}`;

  const body = Buffer.concat([
    Buffer.from(header + fileHeader, 'utf8'),
    fileBytes,
    Buffer.from(footer, 'utf8'),
  ]);

  const url = `https://api.telegram.org/bot${TOKEN}/sendDocument`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.description);
  return json;
}

// Parse CLI args
const args = process.argv.slice(2);

if (args[0] === '--scan-done') {
  const count = args[1] || '?';
  await send(`🔍 *Scan complete* — ${count} new match${count === '1' ? '' : 'es'} found.\n\nOpen Sonar to evaluate them, or reply here to queue instructions.`);

} else if (args[0] === '--eval') {
  const company = args[1] || 'Unknown';
  const score = args[2] || '?';
  const pass = parseFloat(score) >= 4.0;
  const emoji = pass ? '✅' : '⚠️';
  await send(`${emoji} *${company}* scored *${score}/5*\n${pass ? 'PDF generated — worth applying.' : 'Below 4.0 — probably skip unless you have a reason.'}`);

} else if (args[0] === '--inbox') {
  const inboxPath = path.join(__dirname, 'data', 'agent-inbox.md');
  if (!fs.existsSync(inboxPath)) {
    await send('📭 Agent inbox is empty.');
  } else {
    const content = fs.readFileSync(inboxPath, 'utf8').trim();
    const preview = content.length > 800 ? content.slice(0, 800) + '\n…(truncated)' : content;
    await send(`📋 *Agent Inbox:*\n\`\`\`\n${preview}\n\`\`\``);
  }

} else if (args[0] === '--pdf-ready') {
  const company = args[1] || 'Unknown';
  const role = args[2] || 'role';
  await send(`📄 *PDF ready:* ${company} — ${role}\n\nCheck \`output/\` folder.`);

} else if (args[0] === '--send-pdf') {
  const filePath = args[1];
  const caption = args[2] || '';
  if (!filePath) {
    console.error('Usage: node notify.mjs --send-pdf <path/to/file.pdf> "caption"');
    process.exit(1);
  }
  await sendPdf(path.resolve(filePath), caption);

} else if (args.length > 0) {
  // Free-form message
  await send(args.join(' '));

} else {
  console.log('Usage: node notify.mjs "message"');
  console.log('       node notify.mjs --scan-done <count>');
  console.log('       node notify.mjs --eval <company> <score>');
  console.log('       node notify.mjs --inbox');
  console.log('       node notify.mjs --pdf-ready <company> <role>');
  console.log('       node notify.mjs --send-pdf <file.pdf> "caption"');
  process.exit(0);
}

console.log('✅ Sent');
