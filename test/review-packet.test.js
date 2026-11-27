import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bank = JSON.parse(readFileSync(new URL('../data/sample-questions.json', import.meta.url), 'utf8'));
const packet = JSON.parse(readFileSync(new URL('../review/batches.json', import.meta.url), 'utf8'));
const guide = readFileSync(new URL('../review/REVIEWER_GUIDE.md', import.meta.url), 'utf8');

const bankIds = bank.questions.map((question) => question.id).sort();
const packetIds = packet.batches.flatMap((batch) => batch.ids).sort();

test('every question belongs to exactly one batch in the reviewer packet', () => {
  assert.deepEqual(packetIds, bankIds);
  assert.equal(new Set(packetIds).size, packetIds.length);
});

test('the packet batches add up to the bank size and to the numbers in the guide', () => {
  const total = packet.batches.reduce((sum, batch) => sum + batch.count, 0);
  assert.equal(total, bank.questions.length);
  packet.batches.forEach((batch) => assert.equal(batch.count, batch.ids.length));
  assert.equal(packet.bank.total, bank.questions.length);
});

test('the packet names the checks it does not replace', () => {
  for (const phrase of ['Answer key against the explanation', 'Arithmetic', 'Answer stated']) {
    assert.ok(guide.includes(phrase), `guide is missing ${phrase}`);
  }
});
