import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestion } from '../src/schema.js';
import { shuffleOptions, gradeAnswer, buildSession } from '../src/engine.js';
import { createRng } from '../src/rng.js';

const multi = {
  id: 'phy-multi-900',
  type: 'multi',
  subject: 'physics',
  grade: '3',
  chapter: 'units',
  difficulty: 'medium',
  stem: 'أي من التالي وحدة أساسية؟',
  options: ['المتر', 'الكيلوجرام', 'النيوتن', 'الثانية'],
  answerIndices: [0, 1, 3],
  explanation: 'المتر والكيلوجرام والثانية وحدات أساسية، والنيوتن وحدة مشتقة.',
  tags: ['units'],
};

const codes = (question) => validateQuestion(question).map((error) => error.code);

test('a well-formed multi question validates', () => {
  assert.deepEqual(validateQuestion(multi), []);
});

test('multi questions must use answerIndices, not answerIndex', () => {
  assert.ok(codes({ ...multi, answerIndices: undefined }).includes('missing_answer'));
  assert.ok(codes({ ...multi, answerIndices: [0] }).includes('missing_answer'));
  assert.ok(codes({ ...multi, answerIndex: 0 }).includes('answer_index_not_allowed'));
  assert.ok(codes({ ...multi, answerIndices: [0, 0, 1] }).includes('duplicate_answer'));
  assert.ok(codes({ ...multi, answerIndices: [0, 1, 9] }).includes('answer_out_of_range'));
  assert.ok(codes({ ...multi, answerIndices: [0, 1, 2, 3] }).includes('no_wrong_option'));
});

test('shuffling options keeps every correct index pointing at the same text', () => {
  const correctTexts = multi.answerIndices.map((index) => multi.options[index]).sort();
  for (let seed = 0; seed < 20; seed += 1) {
    const shuffled = shuffleOptions(multi, createRng(`seed-${seed}`));
    const after = shuffled.answerIndices.map((index) => shuffled.options[index]).sort();
    assert.deepEqual(after, correctTexts);
    assert.equal(shuffled.options.length, multi.options.length);
  }
});

test('grading a multi answer needs the exact set', () => {
  const exact = gradeAnswer(multi, [0, 1, 3]);
  assert.equal(exact.correct, true);
  assert.equal(exact.partialScore, 1);

  const missingOne = gradeAnswer(multi, [0, 1]);
  assert.equal(missingOne.correct, false);
  assert.ok(missingOne.partialScore > 0 && missingOne.partialScore < 1);

  const extraWrong = gradeAnswer(multi, [0, 1, 2, 3]);
  assert.equal(extraWrong.correct, false);

  const everyOption = gradeAnswer(multi, [0, 1, 2, 3]);
  assert.equal(everyOption.correct, false, 'ticking everything must never be correct');

  const skipped = gradeAnswer(multi, []);
  assert.equal(skipped.answered, false);
  assert.equal(skipped.correct, false);
  assert.equal(skipped.partialScore, 0);
});

test('a session grades multi and single questions side by side', () => {
  const bank = {
    schemaVersion: 1,
    questions: [
      multi,
      {
        id: 'phy-single-900',
        type: 'single',
        subject: 'physics',
        grade: '3',
        chapter: 'units',
        difficulty: 'easy',
        stem: 'ما وحدة القوة؟',
        options: ['النيوتن', 'الجول', 'الواط'],
        answerIndex: 0,
        explanation: 'وحدة القوة هي النيوتن.',
      },
    ],
  };
  const session = buildSession(bank, { count: 2, seed: 'multi-session' });
  const multiPrepared = session.questions.find((question) => question.type === 'multi');
  const singlePrepared = session.questions.find((question) => question.type === 'single');
  const result = gradeAnswer(multiPrepared, [...multiPrepared.answerIndices]);
  assert.equal(result.correct, true);
  assert.equal(gradeAnswer(singlePrepared, singlePrepared.answerIndex).correct, true);
});
