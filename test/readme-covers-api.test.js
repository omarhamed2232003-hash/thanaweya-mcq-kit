import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as api from '../src/index.js';

const docs = await readFile(new URL('../docs/API.md', import.meta.url), 'utf8');

test('every exported function is named in docs/API.md', () => {
  const exported = Object.keys(api).filter((name) => typeof api[name] === 'function').sort();
  assert.ok(exported.length > 0, 'the entry point exports nothing');
  const missing = exported.filter((name) => !docs.includes(name));
  assert.deepEqual(missing, [], `undocumented exports: ${missing.join(', ')}`);
});
