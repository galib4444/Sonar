/**
 * Build config for the Bekar Apply Chrome extension.
 *
 * Entry points mirror what the public/ HTML pages and manifest.json expect.
 *
 * Usage:
 *   node esbuild.config.mjs           # one-shot build to dist/
 *   node esbuild.config.mjs --watch   # rebuild on change
 */

import * as esbuild from 'esbuild';
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const watch = process.argv.includes('--watch');

// entry -> output path inside dist/
const entries = {
  'src/background.ts': 'background.js',
  'src/content.ts': 'content.js',
  'src/popup/popup.ts': 'popup/popup.js',
  'src/onboarding/onboarding.ts': 'onboarding/onboarding.js',
  'src/dashboard/dashboard.ts': 'dashboard/dashboard.js',
  'src/settings/settings.ts': 'settings/settings.js',
  'src/jobs/jobs.ts': 'jobs/jobs.js',
  'src/profiles/profiles.ts': 'profiles/profiles.js',
  'src/data/data.tsx': 'data/data.js',
  'src/chat/chat.ts': 'chat/chat.js',
  'src/tutorial/tutorial.ts': 'tutorial/tutorial.js',
  'src/resume-tailor/resume-tailor.ts': 'resume-tailor/resume-tailor.js',
};

rmSync(dist, { recursive: true, force: true });

// Static assets first so build outputs win on any collision.
cpSync(path.join(root, 'public'), dist, { recursive: true });

const contexts = await Promise.all(
  Object.entries(entries).map(([entry, out]) =>
    esbuild.context({
      entryPoints: [path.join(root, entry)],
      outfile: path.join(dist, out),
      bundle: true,
      format: 'iife',
      target: 'chrome109',
      sourcemap: watch ? 'inline' : false,
      minify: !watch,
      logLevel: 'warning',
      loader: { '.css': 'css', '.md': 'text' },
      define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
    })
  )
);

if (watch) {
  await Promise.all(contexts.map((c) => c.watch()));
  console.log('[esbuild] watching…');
} else {
  await Promise.all(contexts.map((c) => c.rebuild()));
  await Promise.all(contexts.map((c) => c.dispose()));
  console.log('[esbuild] build complete → dist/');
}
