import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist']);

const markdownFiles = (dir) => readdirSync(dir).flatMap((name) => {
  if (SKIP_DIRS.has(name)) return [];
  const path = join(dir, name);
  if (statSync(path).isDirectory()) return markdownFiles(path);
  return name.endsWith('.md') ? [path] : [];
});

/** Relative links in a Markdown file, with anchors and query strings stripped. */
const localLinks = (text) => [...text.matchAll(/\]\(([^)\s]+)\)/g)]
  .map((match) => match[1])
  .filter((target) => !/^(https?:|mailto:|#|tel:)/.test(target))
  .map((target) => target.split('#')[0].split('?')[0])
  .filter(Boolean);

test('every relative link in the documentation points at a file that exists', () => {
  const files = markdownFiles(root);
  assert.ok(files.length > 0, 'no Markdown files found');

  const broken = [];
  for (const file of files) {
    for (const target of localLinks(readFileSync(file, 'utf8'))) {
      const resolved = resolve(dirname(file), target);
      try {
        statSync(resolved);
      } catch {
        broken.push(`${file.slice(root.length + 1)} -> ${target}`);
      }
    }
  }
  assert.deepEqual(broken, [], `broken links:\n${broken.join('\n')}`);
});
