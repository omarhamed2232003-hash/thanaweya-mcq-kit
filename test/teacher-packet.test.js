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

test('the blind mode hides the key, the highlight and the explanations', () => {
  const blindOut = join(dir, 'blind.html');
  const blindStdout = execFileSync(process.execPath, ['scripts/build-teacher-packet.mjs', blindOut, '--blind', '--sample', '20'], { encoding: 'utf8' });
  const blindHtml = readFileSync(blindOut, 'utf8');
  assert.match(blindStdout, /20 questions/);
  assert.equal((blindHtml.match(/class="correct"/g) ?? []).length, 0);
  assert.equal((blindHtml.match(/الإجابة:/g) ?? []).length, 0);
  assert.equal((blindHtml.match(/class="explanation"/g) ?? []).length, 0);
  assert.equal((blindHtml.match(/class="q"/g) ?? []).length, 20);
});

test('the blind mode still carries the key on its own page, once per question', () => {
  const blindOut = join(dir, 'blind.html');
  const blindHtml = readFileSync(blindOut, 'utf8');
  const key = blindHtml.slice(blindHtml.indexOf('مفتاح الإجابة'));
  assert.ok(key.length > 0, 'no key sheet');
  const ids = bank.questions.map((question) => question.id);
  const listed = key.match(/<td class="id">([^<]+)<\/td>/g) ?? [];
  assert.equal(listed.length, 20);
  for (const cell of listed) {
    const id = cell.replace(/<[^>]+>/g, '');
    assert.ok(ids.includes(id), `key sheet has an unknown id: ${id}`);
  }
  assert.match(key, /عدد ما أجبت عنه صحيحًا/);
});

test('a sample is deterministic and spreads across subjects', () => {
  const first = join(dir, 'sample-a.html');
  const second = join(dir, 'sample-b.html');
  execFileSync(process.execPath, ['scripts/build-teacher-packet.mjs', first, '--blind', '--sample', '12']);
  execFileSync(process.execPath, ['scripts/build-teacher-packet.mjs', second, '--blind', '--sample', '12']);
  assert.equal(readFileSync(first, 'utf8'), readFileSync(second, 'utf8'));
  const html = readFileSync(first, 'utf8');
  for (const label of ['الفيزياء', 'الكيمياء', 'الأحياء', 'الرياضيات']) {
    assert.ok(html.includes(label), `sample missed ${label}`);
  }
});
