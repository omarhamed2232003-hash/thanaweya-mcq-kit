import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  buildSession, filterQuestions, gradeAnswer, gradeSession, mixTargets, parseSession,
  selectQuestions, serializeSession, shuffleOptions, DEFAULT_MIX,
} from '../src/engine.js';
import { createRng } from '../src/rng.js';

const bankPath = fileURLToPath(new URL('../data/sample-questions.json', import.meta.url));
const bank = JSON.parse(readFileSync(bankPath, 'utf8'));

test('the shipped sample bank is valid and non-trivial', () => {
  assert.equal(bank.schemaVersion, 1);
  assert.ok(bank.questions.length >= 15);
});

test('mix targets add up to the requested count', () => {
  for (const count of [1, 5, 10, 18, 40]) {
    const targets = mixTargets(DEFAULT_MIX, count);
    const sum = Object.values(targets).reduce((total, value) => total + value, 0);
    assert.equal(sum, count, `count ${count}`);
  }
});

test('selection respects a subject filter', () => {
  const { questions } = selectQuestions(bank.questions, { count: 5, filters: { subjects: ['chemistry'] } });
  assert.equal(questions.length, 5);
  assert.ok(questions.every((question) => question.subject === 'chemistry'));
});

test('selection never returns more than the pool holds', () => {
  const biology = bank.questions.filter((q) => q.subject === 'biology').length;
  const result = selectQuestions(bank.questions, { count: 500, filters: { subjects: ['biology'] } });
  assert.equal(result.questions.length, biology);
  assert.equal(result.meta.truncated, true);
});

test('selection is deterministic for one seed', () => {
  const first = selectQuestions(bank.questions, { count: 8, seed: 'fixed' });
  const second = selectQuestions(bank.questions, { count: 8, seed: 'fixed' });
  assert.deepEqual(first.questions.map((q) => q.id), second.questions.map((q) => q.id));
});

test('different seeds produce different orders', () => {
  const first = selectQuestions(bank.questions, { count: 12, seed: 'seed-a' });
  const second = selectQuestions(bank.questions, { count: 12, seed: 'seed-b' });
  assert.notDeepEqual(first.questions.map((q) => q.id), second.questions.map((q) => q.id));
});

test('excluded ids are never selected', () => {
  const excluded = bank.questions.slice(0, 4).map((question) => question.id);
  const { questions } = selectQuestions(bank.questions, { count: 20, filters: { excludeIds: excluded } });
  assert.ok(questions.every((question) => !excluded.includes(question.id)));
});

test('filterQuestions matches on tags', () => {
  const matches = filterQuestions(bank.questions, { tags: ['redox'] });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, 'chem-oxidation-013');
});

test('option shuffling keeps the same correct answer text', () => {
  const question = bank.questions[0];
  const shuffled = shuffleOptions(question, createRng('shuffle-check'));
  assert.equal(shuffled.options[shuffled.answerIndex], question.options[question.answerIndex]);
  assert.deepEqual([...shuffled.options].sort(), [...question.options].sort());
});

test('a built session keeps the answer key pointing at the right option', () => {
  const session = buildSession(bank, { count: 10, seed: 'key-check' });
  session.questions.forEach((question) => {
    const original = bank.questions.find((item) => item.id === question.id);
    assert.equal(question.options[question.answerIndex], original.options[original.answerIndex]);
  });
});

test('buildSession rejects an invalid bank', () => {
  assert.throws(() => buildSession({ schemaVersion: 1, questions: [] }), /invalid bank/i);
});

test('grading marks correct, wrong and unanswered items', () => {
  const session = buildSession(bank, { count: 3, seed: 'grade-check' });
  const answers = { [session.questions[0].id]: session.questions[0].answerIndex };
  const result = gradeSession(session, answers);
  assert.equal(result.total, 3);
  assert.equal(result.correct, 1);
  assert.equal(result.answered, 1);
  assert.equal(result.unanswered, 2);
  assert.equal(result.wrong, 0);
  assert.equal(result.scorePercent, 33.3);
});

test('grading accepts an array of answers in question order', () => {
  const session = buildSession(bank, { count: 2, seed: 'array-check' });
  const result = gradeSession(session, session.questions.map((question) => question.answerIndex));
  assert.equal(result.correct, 2);
  assert.equal(result.scorePercent, 100);
});

test('a wrong answer is reported with the correct index', () => {
  const question = { ...bank.questions[0], options: ['أ', 'ب'], answerIndex: 0 };
  const graded = gradeAnswer(question, 1);
  assert.equal(graded.correct, false);
  assert.equal(graded.correctIndex, 0);
});

test('sessions round-trip through serialization', () => {
  const session = buildSession(bank, { count: 4, seed: 'round-trip' });
  const restored = parseSession(serializeSession(session));
  assert.deepEqual(restored.questions.map((q) => q.id), session.questions.map((q) => q.id));
});

test('parseSession rejects an unknown version', () => {
  assert.throws(() => parseSession('{"schemaVersion":99,"questions":[]}'), /not a supported session/i);
});
