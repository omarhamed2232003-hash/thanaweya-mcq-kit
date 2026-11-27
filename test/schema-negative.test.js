import test from 'node:test';
import assert from 'node:assert/strict';
import { assertValidBank, validateBank, validateQuestion } from '../src/schema.js';

const question = (overrides = {}) => ({
  id: 'phy-test-001',
  subject: 'physics',
  stem: 'سؤال؟',
  options: ['أ', 'ب', 'ج', 'د'],
  answerIndex: 1,
  explanation: 'لأن ١ + ١ = ٢.',
  difficulty: 'easy',
  ...overrides,
});

const codes = (question) => validateQuestion(question).map((error) => error.code);
const bankCodes = (bank) => validateBank(bank).errors.map((error) => error.code);

test('a non-object question is reported once, not field by field', () => {
  assert.deepEqual(codes('not a question'), ['not_an_object']);
  assert.deepEqual(codes(null), ['not_an_object']);
  assert.deepEqual(codes(['array']), ['not_an_object']);
});

test('each required string field is reported when missing or blank', () => {
  for (const field of ['id', 'subject', 'stem', 'explanation']) {
    assert.deepEqual(codes(question({ [field]: '   ' })), ['required_string'], field);
    assert.deepEqual(codes(question({ [field]: 42 })), ['required_string'], field);
  }
});

test('an unsupported type is reported', () => {
  assert.deepEqual(codes(question({ type: 'essay' })), ['unsupported_type']);
});

test('a difficulty outside the list is reported', () => {
  assert.deepEqual(codes(question({ difficulty: 'expert' })), ['invalid_difficulty']);
});

test('the options list is checked for size, blanks, repeats and length', () => {
  assert.deepEqual(codes(question({ options: ['أ'] })), ['too_few_options', 'answer_out_of_range']);
  assert.deepEqual(codes(question({ options: 'أ,ب' })), ['too_few_options']);
  assert.deepEqual(codes(question({ options: ['أ', ''] })), ['empty_option']);
  assert.deepEqual(codes(question({ options: ['أ', 'أ'] })), ['duplicate_option']);
  assert.deepEqual(codes(question({ options: ['أ', ' أ '] })), ['duplicate_option']);
  assert.deepEqual(codes(question({ options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] })), ['too_many_options']);
});

test('a multi question may not carry answerIndex', () => {
  const errors = validateQuestion(question({ type: 'multi', answerIndices: [1, 2], answerIndex: 1 }));
  assert.deepEqual(errors.map((error) => error.code), ['answer_index_not_allowed']);
});

test('a multi question needs at least two correct options', () => {
  const errors = validateQuestion(question({ type: 'multi', answerIndices: [1], answerIndex: undefined }));
  assert.equal(errors.length, 1);
  assert.match(errors[0].path, /answerIndices/);
});

test('an index outside the options list is reported', () => {
  assert.ok(codes(question({ answerIndex: 9 })).length > 0);
  assert.ok(codes(question({ answerIndex: -1 })).length > 0);
  assert.ok(codes(question({ type: 'multi', answerIndices: [1, 9], answerIndex: undefined })).length > 0);
});

test('tags must be a list of strings', () => {
  assert.deepEqual(codes(question({ tags: 'tag' })), ['invalid_tags']);
  assert.deepEqual(codes(question({ tags: [1] })), ['invalid_tags']);
  assert.deepEqual(codes(question({ tags: ['ok'] })), []);
});

test('a bank that is not an object is refused', () => {
  assert.deepEqual(bankCodes([]), ['not_an_object']);
  assert.equal(validateBank(null).questionCount, 0);
});

test('a wrong schemaVersion and an empty question list are refused', () => {
  assert.deepEqual(bankCodes({ schemaVersion: 99, questions: [question()] }), ['schema_version']);
  assert.deepEqual(bankCodes({ schemaVersion: 1, questions: [] }), ['no_questions']);
  assert.deepEqual(bankCodes({ schemaVersion: 1, questions: 'nope' }), ['no_questions']);
});

test('a duplicate id is reported against the second question', () => {
  const bank = { schemaVersion: 1, questions: [question(), question()] };
  const errors = validateBank(bank).errors;
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'duplicate_id');
  assert.equal(errors[0].path, 'questions[1].id');
});

test('assertValidBank throws with every problem in the message', () => {
  const bank = { schemaVersion: 1, questions: [question({ id: '' }), question({ difficulty: 'expert' })] };
  assert.throws(() => assertValidBank(bank), (error) => {
    assert.match(error.message, /questions\[0\]\.id/);
    assert.match(error.message, /questions\[1\]\.difficulty/);
    return true;
  });
});

test('assertValidBank returns the count for a valid bank', () => {
  const bank = { schemaVersion: 1, questions: [question()] };
  assert.equal(assertValidBank(bank).questionCount, 1);
});
