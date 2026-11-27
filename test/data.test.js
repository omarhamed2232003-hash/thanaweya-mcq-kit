import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateBank, DIFFICULTIES } from '../src/schema.js';

const bank = JSON.parse(readFileSync(fileURLToPath(new URL('../data/sample-questions.json', import.meta.url)), 'utf8'));

test('the sample bank passes validation', () => {
  const result = validateBank(bank);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('every question carries an explanation and the bank carries a licence note', () => {
  assert.ok(bank.licenseNote && bank.licenseNote.length > 20);
  bank.questions.forEach((question) => {
    assert.ok(question.explanation.trim().length > 10, question.id);
  });
});

test('the sample bank covers every difficulty level', () => {
  const present = new Set(bank.questions.map((question) => question.difficulty));
  DIFFICULTIES.forEach((difficulty) => assert.ok(present.has(difficulty), difficulty));
});

test('question ids are unique and follow the documented pattern', () => {
  const ids = bank.questions.map((question) => question.id);
  assert.equal(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.match(id, /^[a-z]+-[a-z0-9-]+-\d{3}$/));
});

test('correct answers are spread across option positions', () => {
  const singles = bank.questions.filter((question) => (question.type ?? 'single') === 'single');
  const positions = new Set(singles.map((question) => question.answerIndex));
  assert.equal(positions.size, 4, 'correct answers should cover all four option positions');
});

test('the bank keeps a few multi-answer questions for the multi type', () => {
  const multi = bank.questions.filter((question) => question.type === 'multi');
  assert.ok(multi.length >= 3, 'expected at least three multi-answer questions');
  multi.forEach((question) => {
    assert.ok(Array.isArray(question.answerIndices) && question.answerIndices.length >= 2, question.id);
    assert.equal(question.answerIndex, undefined, question.id);
  });
});
