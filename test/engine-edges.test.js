import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSummary, gradeSession, mixTargets } from '../src/engine.js';

const question = (id, overrides = {}) => ({
  id,
  subject: 'physics',
  stem: `سؤال ${id}`,
  options: ['أ', 'ب', 'ج', 'د'],
  answerIndex: 1,
  explanation: 'لأن',
  difficulty: 'easy',
  ...overrides,
});

const session = (questions) => ({ seed: 's', questions, answers: {} });

test('a mix that adds up to nothing asks for zero of everything', () => {
  assert.deepEqual(mixTargets({}, 0), { easy: 0, medium: 0, hard: 0, advanced: 0 });
  assert.deepEqual(mixTargets({ easy: 0, medium: 0, hard: 0, advanced: 0 }, 10),
    { easy: 0, medium: 0, hard: 0, advanced: 0 });
  assert.deepEqual(mixTargets({ easy: -1, medium: 0, hard: 0, advanced: 0 }, 10),
    { easy: 0, medium: 0, hard: 0, advanced: 0 });
});

test('a mix that adds up to the count is honoured exactly', () => {
  assert.deepEqual(mixTargets({ easy: 5, medium: 3, hard: 1, advanced: 1 }, 10),
    { easy: 5, medium: 3, hard: 1, advanced: 1 });
});

test('grading accepts an array of answers in question order', () => {
  const result = gradeSession(session([question('q1'), question('q2')]), [1, 0]);
  assert.equal(result.correct, 1);
  assert.equal(result.answered, 2);
});

test('grading accepts a map keyed by question id', () => {
  const result = gradeSession(session([question('q1'), question('q2')]), { q2: 1 });
  assert.equal(result.correct, 1);
  assert.equal(result.answered, 1);
});

test('grading with nothing answered scores zero but does not throw', () => {
  const result = gradeSession(session([question('q1')]), undefined);
  assert.equal(result.correct, 0);
  assert.equal(result.answered, 0);
  assert.equal(result.total, 1);
});

test('the summary line is written in the language asked for', () => {
  const result = { correct: 7, total: 10, scorePercent: 70 };
  assert.equal(formatSummary(result, 'en'), '7 of 10 correct (70%)');
  assert.equal(formatSummary(result), '7 من 10 صحيح (70٪)');
  assert.equal(formatSummary(result, 'ar'), '7 من 10 صحيح (70٪)');
});
