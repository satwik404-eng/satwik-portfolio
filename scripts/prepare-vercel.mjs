import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

const exported = new URL('../out/', import.meta.url);
const output = new URL('../.vercel/output/', import.meta.url);
const inlineScripts = new Set();

for (const entry of await readdir(exported, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const html = await readFile(entry.parentPath + '/' + entry.name, 'utf8');
  // Next emits complete script elements in its static HTML. Hash the script
  // text as the browser sees it after HTML newline normalization.
  for (const [, attributes, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!script || /(?:^|\s)src\s*=/i.test(attributes)) continue;
    const hash = createHash('sha256').update(script.replace(/\r\n?/g, '\n')).digest('base64');
    inlineScripts.add(`'sha256-${hash}'`);
  }
}

if (!inlineScripts.size) throw new Error('No inline scripts found in the static portfolio export');

const policy = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'wasm-unsafe-eval' ${[...inlineScripts].sort().join(' ')}`,
  "script-src-attr 'none'",
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
].join('; ');

const routes = [
  {
    src: '/.*',
    headers: {
      'Content-Security-Policy': policy,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    continue: true,
  },
  { src: '/', dest: '/index.html' },
  { handle: 'filesystem' },
  { src: '/.*', dest: '/404.html', status: 404 },
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(exported, new URL('static/', output), { recursive: true });
await writeFile(new URL('config.json', output), JSON.stringify({ version: 3, routes }, null, 2) + '\n');
