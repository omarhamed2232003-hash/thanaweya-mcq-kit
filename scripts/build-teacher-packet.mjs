#!/usr/bin/env node
/**
 * Build a printable review packet for a subject teacher: every question with its
 * marked answer and its explanation, grouped by subject and chapter, with a
 * sign-off line per chapter.
 *
 * The point is that a teacher can print it, mark it with a pen and hand it back.
 * It is not a quiz and it does not hide the key: a reviewer has to see the key to
 * judge it.
 *
 * usage: node scripts/build-teacher-packet.mjs [output.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const outputPath = process.argv[2] ?? fileURLToPath(new URL('review/teacher-packet.html', root));

const bank = JSON.parse(readFileSync(fileURLToPath(new URL('data/sample-questions.json', root)), 'utf8'));

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SUBJECT_LABELS = { physics: 'الفيزياء', chemistry: 'الكيمياء', biology: 'الأحياء', math: 'الرياضيات' };

const bySubject = new Map();
for (const question of bank.questions) {
  const subject = question.subject ?? 'other';
  if (!bySubject.has(subject)) bySubject.set(subject, new Map());
  const chapters = bySubject.get(subject);
  const chapter = question.chapter ?? 'بدون فصل';
  if (!chapters.has(chapter)) chapters.set(chapter, []);
  chapters.get(chapter).push(question);
}

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

const marked = (question) => (Array.isArray(question.answerIndices) ? question.answerIndices : [question.answerIndex]);

const renderQuestion = (question, index) => `
  <article class="q">
    <p class="stem"><span class="num">${index}.</span> ${escapeHtml(question.stem)}</p>
    <ul class="options">
      ${question.options.map((option, position) => `<li class="${marked(question).includes(position) ? 'correct' : ''}"><span class="letter">${LETTERS[position] ?? position + 1})</span> ${escapeHtml(option)}</li>`).join('\n      ')}
    </ul>
    <p class="answer">الإجابة: ${marked(question).map((position) => LETTERS[position] ?? String(position + 1)).join('، ')}</p>
    <p class="explanation">${escapeHtml(question.explanation)}</p>
    <p class="meta">${escapeHtml(question.id)} · ${escapeHtml(question.difficulty)}</p>
  </article>`;

const sections = [...bySubject.entries()].sort().map(([subject, chapters]) => `
  <section class="subject">
    <h2>${escapeHtml(SUBJECT_LABELS[subject] ?? subject)}</h2>
    ${[...chapters.entries()].sort().map(([chapter, questions]) => `
      <section class="chapter">
        <h3>${escapeHtml(chapter)} <span class="count">(${questions.length} سؤالًا)</span></h3>
        ${questions.map((question, index) => renderQuestion(question, index + 1)).join('\n')}
        <p class="signoff">راجع الفصل: ................................ التاريخ: ................ أية ملاحظات: ................................</p>
      </section>`).join('\n')}
  </section>`).join('\n');

const chapterCount = [...bySubject.values()].reduce((sum, chapters) => sum + chapters.size, 0);

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>حزمة مراجعة المعلم — thanaweya-mcq-kit</title>
<style>
  body { font-family: "Segoe UI", Tahoma, sans-serif; line-height: 1.7; color: #111; margin: 2rem auto; max-width: 52rem; }
  h1 { font-size: 1.6rem; margin-bottom: .2rem; }
  .intro { color: #444; margin-top: 0; }
  h2 { font-size: 1.3rem; border-bottom: 2px solid #111; padding-bottom: .3rem; margin-top: 2.5rem; break-before: page; }
  h3 { font-size: 1.05rem; margin-top: 1.6rem; color: #222; }
  .count { font-weight: normal; color: #666; font-size: .9rem; }
  .q { margin: 1rem 0 1.4rem; break-inside: avoid; }
  .stem { margin: 0 0 .4rem; font-weight: 600; }
  .num { color: #555; }
  .options { margin: 0 0 .4rem; padding: 0; list-style: none; }
  .letter { color: #555; }
  .options .correct { background: #e8f5e9; font-weight: 600; }
  .answer { margin: .2rem 0; color: #14532d; font-size: .95rem; }
  .explanation { margin: .2rem 0; color: #333; font-size: .95rem; }
  .meta { margin: 0; color: #777; font-size: .78rem; direction: ltr; text-align: right; }
  .signoff { margin: 1.2rem 0 2rem; padding-top: .6rem; border-top: 1px dashed #999; color: #333; }
  @media print { body { margin: 0; max-width: none; } .subject > h2 { break-before: page; } }
</style>
</head>
<body>
<h1>حزمة مراجعة المعلم</h1>
<p class="intro">${bank.questions.length} سؤالًا أصليًا، ${chapterCount} فصلًا، مرتّبة بالمادة ثم بالفصل. الإجابة الصحيحة مظللة ومكتوبة، والشرح تحت كل سؤال. اكتب ملاحظاتك في السطر أسفل كل فصل، أو اكتب رقم السؤال وملاحظتك في آخر الصفحة.</p>
<p class="intro">أسماء الفصول مكتوبة كما هي في البنك (بالإنجليزية) لأنها مفاتيح بيانات، وليست ترجمة.</p>
<p class="intro">ما تم فحصه آليًا: أن الإجابة المظللة هي القيمة التي ينتهي إليها الشرح، وأن الحساب في الشرح يعيد نفس النتيجة. ما لم يُفحص: صحة الشرح نفسه، ومطابقة المنهج. هذه هي المهمة.</p>
${sections}
<section class="subject">
  <h2>ملاحظات عامة</h2>
  <p class="signoff">راجع البنك كله: ................................ التاريخ: ................</p>
  <p class="signoff">أسئلة تحتاج تعديلًا (اكتب المعرّف والسبب):</p>
  <p class="signoff">&nbsp;</p>
  <p class="signoff">&nbsp;</p>
</section>
</body>
</html>`;

writeFileSync(outputPath, html);
console.log(`wrote ${outputPath}: ${bank.questions.length} questions, ${chapterCount} chapters, ${bySubject.size} subjects`);
