import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bankStats, mergeBanks } from '../src/bank.js';
import { validateBank } from '../src/schema.js';

const sample = JSON.parse(readFileSync(fileURLToPath(new URL('../data/sample-questions.json', import.meta.url)), 'utf8'));

const miniBank = (questions, title = 'mini') => ({
  schemaVersion: 1, language: 'ar', direction: 'rtl', title, licenseNote: 'written for this test', questions,
});

const question = (id, subject = 'physics', difficulty = 'easy') => ({
  id, subject, difficulty, stem: 'سؤال تجريبي؟', options: ['أ', 'ب'], answerIndex: 0,
  explanation: 'شرح تجريبي كافٍ للاختبار.', tags: ['test'],
});

test('bankStats counts by subject and difficulty', () => {
  const stats = bankStats(sample);
  assert.equal(stats.total, sample.questions.length);
  assert.equal(Object.values(stats.bySubject).reduce((a, b) => a + b, 0), sample.questions.length);
  assert.equal(Object.values(stats.byDifficulty).reduce((a, b) => a + b, 0), sample.questions.length);
});

test('mergeBanks combines two valid banks', () => {
  const result = mergeBanks([miniBank([question('phy-a-001')]), miniBank([question('phy-b-001')], 'second')]);
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 2);
  assert.equal(validateBank(result.bank).ok, true);
  assert.equal(result.stats.total, 2);
});

test('mergeBanks reports duplicate ids across banks', () => {
  const result = mergeBanks([miniBank([question('phy-a-001')]), miniBank([question('phy-a-001')])]);
  assert.equal(result.ok, false);
  assert.equal(result.questions.length, 1);
  assert.equal(result.errors[0].code, 'duplicate_id_across_banks');
});

test('mergeBanks can skip duplicates instead of failing', () => {
  const result = mergeBanks(
    [miniBank([question('phy-a-001')]), miniBank([question('phy-a-001'), question('phy-a-002')])],
    { onDuplicateId: 'skip' },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.questions.map((item) => item.id), ['phy-a-001', 'phy-a-002']);
});

test('mergeBanks collects problems from an invalid bank instead of throwing', () => {
  const broken = miniBank([{ ...question('phy-a-001'), answerIndex: 9 }]);
  const result = mergeBanks([miniBank([question('phy-b-001')]), broken]);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].bank, 1);
  assert.equal(result.questions.length, 1);
});

test('mergeBanks rejects an empty list and a bad option', () => {
  assert.throws(() => mergeBanks([]), /at least one bank/);
  assert.throws(() => mergeBanks([miniBank([question('phy-a-001')])], { onDuplicateId: 'rename' }), /onDuplicateId/);
});

test('merging the sample bank with itself is caught as duplicates', () => {
  const result = mergeBanks([sample, sample]);
  assert.equal(result.ok, false);
  assert.equal(result.questions.length, sample.questions.length);
  assert.equal(result.errors.length, sample.questions.length);
});
