#!/usr/bin/env node
/**
 * Build one self-contained HTML file: the demo with its CSS, JS and the bank
 * inlined, so it opens from a file:// path with no server and no network.
 *
 * The modules are plain ES modules with no dependencies and no name collisions
 * at the top level, so the bundle is a topological concatenation with the
 * import and export syntax removed. There is no bundler dependency, and there is
 * nothing to install.
 *
 * usage: node scripts/build-demo.mjs [output.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(fileURLToPath(new URL(path, root)), 'utf8');

const html = read('ui/index.html');
const css = read('ui/quiz.css');
const bank = JSON.parse(read('data/sample-questions.json'));

const MODULES = ['src/rng.js', 'src/schema.js', 'src/bank.js', 'src/engine.js', 'src/i18n.js', 'ui/quiz.js'];

const stripModuleSyntax = (source) => source
  .replace(/^import\s+[\s\S]*?from\s+'[^']+';$/gm, '')
  .replace(/^export\s+\{[^}]*\};$/gm, '')
  .replace(/^export\s+(const|let|function|class|async function)/gm, '$1')
  .trim();

const bundle = MODULES.map((path) => {
  const body = stripModuleSyntax(read(path));
  if (/^\s*(import|export)\s/m.test(body)) {
    throw new Error(`${path} still contains module syntax after stripping`);
  }
  return `/* ---- ${path} ---- */\n${body}`;
}).join('\n\n');

// The bank goes into a script tag as JSON. A literal `</script>` inside a
// string would end the tag early, so the sequence is escaped.
const bankJson = JSON.stringify(bank).replace(/<\/script/gi, '<\\/script');

const built = html
  .replace(/<link rel="stylesheet" href="quiz\.css">/, () => `<style>\n${css}\n</style>`)
  .replace(/<script type="module" src="quiz\.js"><\/script>/, () =>
    `<script>window.__BANK__ = ${bankJson};</script>\n<script type="module">\n${bundle}\n</script>`);

for (const marker of ['window.__BANK__', '<style>', 'function boot(']) {
  if (!built.includes(marker)) {
    console.error(`build failed: the output has no ${marker}`);
    process.exit(1);
  }
}

const outputPath = process.argv[2] ?? fileURLToPath(new URL('demo.html', root));
writeFileSync(outputPath, built);
console.log(`wrote ${outputPath}: ${bank.questions.length} questions inlined, ${(built.length / 1024).toFixed(0)} KB`);
