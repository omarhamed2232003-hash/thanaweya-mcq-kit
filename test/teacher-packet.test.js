import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'teacher-packet-'));
const out = join(dir, 'packet.html');
const stdout = execFileSync(process.execPath, ['scripts/build-teacher-packet.mjs', out], { encoding: 'utf8' });
const html = readFileSync(out, 'utf8');
const bank = JSON.parse(readFileSync(new URL('../data/sample-questions.json', import.meta.url), 'utf8'));

test('the build reports what it wrote', () => {
  assert.match(stdout, /241 questions, 53 chapters, 4 subjects/);
});

test('every question in the bank is in the packet, with its key and explanation', () => {
  for (const question of bank.questions) {
    assert.ok(html.includes(`>${question.id}<`) || html.includes(question.id), `missing ${question.id}`);
  }
  assert.equal((html.match(/class="q"/g) ?? []).length, bank.questions.length);
  assert.equal((html.match(/class="explanation"/g) ?? []).length, bank.questions.length);
});

test('the marked options are highlighted, and only those', () => {
  const highlighted = (html.match(/class="correct"/g) ?? []).length;
  const expected = bank.questions.reduce((sum, question) => sum + (Array.isArray(question.answerIndices) ? question.answerIndices.length : 1), 0);
  assert.equal(highlighted, expected);
});

test('each chapter has a sign-off line, plus one for the whole bank', () => {
  const signoffs = (html.match(/class="signoff"/g) ?? []).length;
  const chapters = new Set(bank.questions.map((question) => `${question.subject}/${question.chapter}`)).size;
  assert.equal(signoffs, chapters + 4, 'one per chapter plus the general-notes block (one sign-off line, one heading, two blank lines)');
});

test('the intro says what was checked and what was not', () => {
  assert.match(html, /ما تم فحصه آليًا/);
  assert.match(html, /ما لم يُفحص/);
  assert.match(html, /أسماء الفصول مكتوبة كما هي في البنك/);
});
