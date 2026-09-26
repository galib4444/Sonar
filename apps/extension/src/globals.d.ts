// Declares the Firefox native `browser` global using @types/webextension-polyfill shapes.
// The actual object is injected by Firefox at runtime; TypeScript doesn't know about it
// unless we declare it here.
import type _Browser from 'webextension-polyfill';

declare global {
  const browser: _Browser;
}

// esbuild's `.md` loader ('text') bundles a Markdown file as its raw string
// contents — used to embed packages/profile/resume-preferences.md at build
// time so the /resume skill's learned rules reach the extension's prompts.
declare module '*.md' {
  const content: string;
  export default content;
}

export {};
