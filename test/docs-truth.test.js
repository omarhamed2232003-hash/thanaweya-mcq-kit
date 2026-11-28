import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// A test count written into prose goes stale the next time a test is added, and
// a stale number in a release checklist is a claim nobody rechecks. The CI log
// is the authority, so docs must not restate a count.
const root = fileURLToPath(new URL('../', import.meta.url));
const skip = new Set(['node_modules', '.git', 'review', 'screenshots']);
const exempt = /^(CHANGELOG\.md|docs\/REVIEW_FINDINGS\.md)$/;

const files = [];
const walk = (directory) => {
  for (const name of readdirSync(directory)) {
    if (skip.has(name)) continue;
    const full = join(directory, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.md')) files.push(relative(root, full));
  }
};
walk(root);

test('no document states a test count that will go stale', () => {
  const offenders = [];
  for (const file of files) {
    if (exempt.test(file)) continue;
    const text = readFileSync(join(root, file), 'utf8');
    for (const match of text.matchAll(/\b\d+\s*(?:\/\s*\d+\s*)?tests?\b/gi)) {
      offenders.push(`${file}: ${match[0]}`);
    }
  }
  assert.deepEqual(offenders, [], `documents with a hardcoded test count:\n${offenders.join('\n')}`);
});

test('the status page and package.json state the same version', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const status = readFileSync(join(root, 'STATUS.md'), 'utf8');
  const stated = status.match(/Version (\d+\.\d+\.\d+)\./);
  assert.ok(stated, 'STATUS.md does not state a version');
  assert.equal(stated[1], pkg.version, 'STATUS.md and package.json disagree about the version');
});
