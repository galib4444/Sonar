#!/usr/bin/env node
/**
 * Local bridge between the Bekar Apply extension and this repo's files.
 * Everything here runs on your machine, binds to 127.0.0.1 only, and every
 * data route requires a token generated on first run — nothing outside this
 * process can read or write through it without that token.
 *
 * Routes:
 *   GET  /health        no auth — {ok, hasProfile}, so the extension can
 *                        show "bridge reachable" without exposing data.
 *   GET  /profile        auth — returns apps/extension/extension-profile.json
 *                        verbatim (404 if it hasn't been exported yet).
 *   POST /applications    auth — { applications: JobApplication[] } →
 *                        appended to apps/scanner/data/applications.md.
 *   POST /answers         auth — { question, answer } → appended to
 *                        application-answers.learned.md, a sibling of
 *                        application-answers.md (outside the repo — same
 *                        place the export script reads its answer bank
 *                        from). Never written into the repo.
 *   POST /resume-feedback auth — { message, timestamp, jobTitle?, company? }
 *                        → appended to resume-feedback.learned.md, outside
 *                        the repo. Raw feedback typed into the Resume
 *                        Tailor chat panel, queued for a `/resume learn` pass.
 *
 * Run:  node server.mjs   (or  npm start  from this directory)
 * The token is generated once into .token (gitignored) and printed below —
 * paste it into the extension's Settings → Local Bridge.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { appendApplications } from '../scanner/lib/applications-store.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..'); // Sonar/
const outerRoot = path.resolve(repoRoot, '..');   // "No More Bekaring" (not a git repo)

const PORT = Number(process.env.BRIDGE_PORT) || 4100;
const HOST = '127.0.0.1';

const PROFILE_PATH = path.join(repoRoot, 'apps', 'extension', 'extension-profile.json');
const APPLICATIONS_PATH = path.join(repoRoot, 'apps', 'scanner', 'data', 'applications.md');
const LEARNED_ANSWERS_PATH = path.join(outerRoot, 'application-answers.learned.md');
const RESUME_FEEDBACK_PATH = path.join(outerRoot, 'resume-feedback.learned.md');
const TOKEN_PATH = path.join(here, '.token');

function loadOrCreateToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    return fs.readFileSync(TOKEN_PATH, 'utf8').trim();
  }
  const token = crypto.randomBytes(24).toString('hex');
  fs.writeFileSync(TOKEN_PATH, token + '\n', { mode: 0o600 });
  return token;
}

const TOKEN = loadOrCreateToken();

function isAuthorized(req) {
  const header = req.headers['authorization'] || '';
  const presented = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(presented);
  const b = Buffer.from(TOKEN);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sendJSON(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function readBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function ensureLearnedFile() {
  if (fs.existsSync(LEARNED_ANSWERS_PATH)) return;
  const header =
    '# Application Answer Bank — Learned by Bekar Apply\n\n' +
    'Free-text answers the extension captured from forms you filled in by\n' +
    'hand, because it did not already have a value. Review before reusing —\n' +
    'these are unvetted drafts, not the curated answers in application-answers.md.\n' +
    'Self-ID, salary, and other sensitive fields are never written here.\n';
  fs.writeFileSync(LEARNED_ANSWERS_PATH, header, { mode: 0o600 });
}

function appendLearnedAnswer(question, answer) {
  ensureLearnedFile();
  const q = String(question ?? '').trim().replace(/\s+/g, ' ');
  const a = String(answer ?? '').trim();
  if (!q || !a) throw new Error('question and answer are both required');
  const entry = `\n---\n\n## ${q}\n\n${a}\n\n> Learned from the extension on ${new Date().toISOString().slice(0, 10)} — review before reuse.\n`;
  fs.appendFileSync(LEARNED_ANSWERS_PATH, entry);
}

function ensureResumeFeedbackFile() {
  if (fs.existsSync(RESUME_FEEDBACK_PATH)) return;
  const header =
    '# Resume Tailor Feedback — Learned by Bekar Apply\n\n' +
    "Free-text feedback typed into the Resume Tailor chat panel — what didn't\n" +
    'work about a tailored draft and what to change. Raw and unvetted; feed it\n' +
    'to `/resume learn` to turn recurring complaints into real, approved rules.\n';
  fs.writeFileSync(RESUME_FEEDBACK_PATH, header, { mode: 0o600 });
}

function appendResumeFeedback(entry) {
  ensureResumeFeedbackFile();
  const message = String(entry?.message ?? '').trim();
  if (!message) throw new Error('message is required');
  const context = [entry?.jobTitle, entry?.company].filter(Boolean).join(' @ ');
  const when = entry?.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString();
  const heading = context || when.slice(0, 10);
  const block = `\n---\n\n## ${heading}\n\n${message}\n\n> ${when}\n`;
  fs.appendFileSync(RESUME_FEEDBACK_PATH, block);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  // No permissive CORS headers are ever sent — a plain webpage's cross-origin
  // fetch to this server gets no Access-Control-Allow-Origin and the browser
  // blocks it from reading (or, for the JSON POSTs here, from even sending)
  // the response. The extension's background service worker is a privileged
  // context and isn't subject to that; it reaches this server via
  // host_permissions instead, same as it does for Ollama.

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJSON(res, 200, { ok: true, hasProfile: fs.existsSync(PROFILE_PATH) });
  }

  if (!isAuthorized(req)) {
    return sendJSON(res, 401, { ok: false, error: 'Missing or wrong bridge token' });
  }

  try {
    if (req.method === 'GET' && url.pathname === '/profile') {
      if (!fs.existsSync(PROFILE_PATH)) {
        return sendJSON(res, 404, {
          ok: false,
          error: 'extension-profile.json not found. Run export-extension-profile.ts from packages/profile first.',
        });
      }
      const raw = fs.readFileSync(PROFILE_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(raw);
    }

    if (req.method === 'POST' && url.pathname === '/applications') {
      const body = await readBody(req);
      const apps = Array.isArray(body.applications) ? body.applications : [];
      const result = appendApplications(APPLICATIONS_PATH, apps);
      return sendJSON(res, 200, { ok: true, ...result });
    }

    if (req.method === 'POST' && url.pathname === '/answers') {
      const body = await readBody(req);
      appendLearnedAnswer(body.question, body.answer);
      return sendJSON(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/resume-feedback') {
      const body = await readBody(req);
      appendResumeFeedback(body);
      return sendJSON(res, 200, { ok: true });
    }

    return sendJSON(res, 404, { ok: false, error: 'Not found' });
  } catch (err) {
    return sendJSON(res, 400, { ok: false, error: err instanceof Error ? err.message : 'Bad request' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Bekar Apply bridge listening on http://${HOST}:${PORT}`);
  console.log(`Token (paste into extension Settings → Local Bridge): ${TOKEN}`);
  console.log(`Profile file:  ${PROFILE_PATH}`);
  console.log(`Applications:  ${APPLICATIONS_PATH}`);
  console.log(`Learned file:  ${LEARNED_ANSWERS_PATH}`);
  console.log(`Resume fdbk:   ${RESUME_FEEDBACK_PATH}`);
});
