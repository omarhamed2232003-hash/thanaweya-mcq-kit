import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestion, validateBank, SCHEMA_VERSION } from '../src/schema.js';

const baseQuestion = () => ({
  id: 'q-1',
  subject: 'physics',
  difficulty: 'easy',
  stem: 'سؤال تجريبي؟',
  options: ['أ', 'ب', 'ج'],
  answerIndex: 0,
  explanation: 'شرح تجريبي.',
});

const baseBank = () => ({ schemaVersion: SCHEMA_VERSION, questions: [baseQuestion()] });

test('a well-formed question has no errors', () => {
  assert.deepEqual(validateQuestion(baseQuestion()), []);
});

test('a well-formed bank validates', () => {
  const result = validateBank(baseBank());
  assert.equal(result.ok, true);
  assert.equal(result.questionCount, 1);
});

test('missing required text fields are reported', () => {
  const question = baseQuestion();
  delete question.stem;
  const errors = validateQuestion(question);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'required_string');
  assert.match(errors[0].path, /stem$/);
});

test('answerIndex outside the option list is rejected', () => {
  const errors = validateQuestion({ ...baseQuestion(), answerIndex: 3 });
  assert.equal(errors[0].code, 'answer_out_of_range');
});

test('a non-integer answerIndex is rejected', () => {
  const errors = validateQuestion({ ...baseQuestion(), answerIndex: '0' });
  assert.equal(errors[0].code, 'missing_answer');
});

test('duplicate options are rejected', () => {
  const errors = validateQuestion({ ...baseQuestion(), options: ['أ', 'أ', 'ج'] });
  assert.equal(errors[0].code, 'duplicate_option');
});

test('fewer than two options is rejected', () => {
  const errors = validateQuestion({ ...baseQuestion(), options: ['أ'], answerIndex: 0 });
  assert.equal(errors[0].code, 'too_few_options');
});

test('an unknown difficulty is rejected', () => {
  const errors = validateQuestion({ ...baseQuestion(), difficulty: 'impossible' });
  assert.equal(errors[0].code, 'invalid_difficulty');
});

test('duplicate ids across the bank are reported', () => {
  const result = validateBank({ schemaVersion: SCHEMA_VERSION, questions: [baseQuestion(), baseQuestion()] });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'duplicate_id'));
});

test('a wrong schema version is rejected', () => {
  const result = validateBank({ schemaVersion: 99, questions: [baseQuestion()] });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, 'schema_version');
});

test('an empty bank is rejected', () => {
  const result = validateBank({ schemaVersion: SCHEMA_VERSION, questions: [] });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, 'no_questions');
});
