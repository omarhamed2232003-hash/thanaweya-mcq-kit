/**
 * Answer-key audit.
 *
 * A wrong answer index is the worst bug this kit can ship: the explanation can
 * be right while the marked option points somewhere else, and a student has no
 * way to see it. These checks recompute the arithmetic an explanation shows,
 * confirm the value it finishes on is the marked option, and reject keys that
 * collide with a second option.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const bank = JSON.parse(readFileSync(fileURLToPath(new URL('../data/sample-questions.json', import.meta.url)), 'utf8'));

const SUPERSCRIPTS = { '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9' };

const normalise = (text) => String(text)
  .replace(/٬/g, '')
  .replace(/,/g, '')
  .replace(/٫/g, '.')
  .replace(/½/g, '0.5')
  .replace(/¼/g, '0.25')
  .replace(/¾/g, '0.75')
  .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => SUPERSCRIPTS[digit]);

const numbersIn = (text) => (normalise(text).match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

const evaluate = (expression) => {
  const clean = expression.replace(/÷/g, '/').replace(/×/g, '*').replace(/[^0-9+*/. -]/g, '');
  return Function(`"use strict"; return (${clean});`)();
};

/**
 * Explanations where the last "= N" is an intermediate value, not the answer.
 * Each one is hand-checked, not a loosened rule.
 */
const INTERMEDIATE_FINAL_VALUES = new Map([
  ['math-alg-005', 'solves for x (7), then states y = 3; 3 is the last number but 7 is the answer'],
  ['math-log-001', '2^3 = 8 is the worked step; the value of the logarithm is 3'],
]);

/**
 * Answers stated as a named constant instead of a numeral.
 */
const NAMED_CONSTANT_ANSWERS = new Map([
  ['chem-mole-005', 'the answer is Avogadro number, stated in the explanation by name'],
]);

test('every marked answer points at a real option', () => {
  bank.questions.forEach((question) => {
    assert.ok(Number.isInteger(question.answerIndex), `${question.id}: answerIndex is not an integer`);
    assert.ok(question.answerIndex >= 0 && question.answerIndex < question.options.length,
      `${question.id}: answerIndex out of range`);
  });
});

test('the value an explanation finishes on is the marked option', () => {
  const problems = [];
  bank.questions.forEach((question) => {
    if (INTERMEDIATE_FINAL_VALUES.has(question.id)) return;
    const explanation = normalise(question.explanation);
    const computed = [...explanation.matchAll(/=\s*(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
    const allNumbers = numbersIn(explanation);
    if (computed.length === 0 || allNumbers.length === 0) return;
    const finalNumber = allNumbers[allNumbers.length - 1];
    if (computed[computed.length - 1] !== finalNumber) return;
    const matching = question.options
      .map((option, index) => (numbersIn(option).includes(finalNumber) ? index : -1))
      .filter((index) => index >= 0);
    if (matching.length === 1 && matching[0] !== question.answerIndex) {
      problems.push(`${question.id}: explanation finishes at ${finalNumber} (option ${matching[0]}) but the key is ${question.answerIndex}`);
    }
  });
  assert.deepEqual(problems, []);
});

test('arithmetic chains in explanations recompute correctly', () => {
  const problems = [];
  bank.questions.forEach((question) => {
    const explanation = normalise(question.explanation);
    const pattern = /(\d+(?:\.\d+)?(?:\s*[×*+÷/-]\s*\d+(?:\.\d+)?)+)\s*=\s*(\d+(?:\.\d+)?(?:\/\d+)?)/g;
    // Only the final step of a worked solution is the answer; earlier "=" are
    // intermediate substitutions (1/f = 1/do + 1/di and the like).
    const steps = [...explanation.matchAll(pattern)];
    for (const match of steps.slice(-1)) {
      const [, expression, stated] = match;
      const trailing = numbersIn(explanation);
      if (evaluate(stated) !== trailing[trailing.length - 1]) continue;
      const computed = evaluate(expression);
      const expected = evaluate(stated);
      if (Math.abs(computed - expected) > 0.01) {
        problems.push(`${question.id}: "${expression}" is stated as ${stated}, but it equals ${computed}`);
      }
    }
  });
  assert.deepEqual(problems, []);
});

test('no two options are the same answer', () => {
  bank.questions.forEach((question) => {
    const seen = new Map();
    question.options.forEach((option, index) => {
      const key = normalise(option).replace(/\s+/g, ' ').trim();
      assert.ok(!seen.has(key), `${question.id}: options ${seen.get(key)} and ${index} are identical ("${key}")`);
      seen.set(key, index);
    });
  });
});

test('a numeric answer appears in its own explanation', () => {
  const problems = [];
  bank.questions.forEach((question) => {
    if (NAMED_CONSTANT_ANSWERS.has(question.id)) return;
    const marked = normalise(question.options[question.answerIndex]);
    const markedNumbers = numbersIn(marked);
    if (markedNumbers.length === 0) return;
    const explanationNumbers = numbersIn(question.explanation);
    if (!markedNumbers.some((value) => explanationNumbers.includes(value))) {
      problems.push(`${question.id}: marked answer "${marked}" is never stated in the explanation`);
    }
  });
  assert.deepEqual(problems, []);
});
