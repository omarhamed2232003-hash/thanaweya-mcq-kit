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
 * With --blind it prints the same questions without the key, the explanation or
 * the highlight, and puts the answer key on its own page at the end. That is for
 * an independent spot check: the teacher answers a sample first, then compares.
 * The earlier reviews all saw the marked key, which is exactly the weakness this
 * mode is for.
 *
 * usage: node scripts/build-teacher-packet.mjs [output.html] [--blind] [--sample N]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const blind = args.includes('--blind');
const sampleAt = args.indexOf('--sample');
const sampleSize = sampleAt === -1 ? null : Number(args[sampleAt + 1]);
if (sampleAt !== -1 && !(Number.isInteger(sampleSize) && sampleSize > 0)) {
  console.error('--sample needs a positive whole number');
  process.exit(1);
}
const outputPath = args.find((argument, index) => !argument.startsWith('--') && !(sampleAt !== -1 && index === sampleAt + 1))
  ?? fileURLToPath(new URL(blind ? 'review/teacher-packet-blind.html' : 'review/teacher-packet.html', root));

const bank = JSON.parse(readFileSync(fileURLToPath(new URL('data/sample-questions.json', root)), 'utf8'));

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SUBJECT_LABELS = { physics: 'الفيزياء', chemistry: 'الكيمياء', biology: 'الأحياء', math: 'الرياضيات' };

// A deterministic sample, spread evenly over the bank so it lands in every
// subject: every stride-th question, in bank order. Same input, same sample.
const sampled = sampleSize === null || sampleSize >= bank.questions.length
  ? bank.questions
  : (() => {
      const stride = bank.questions.length / sampleSize;
      return Array.from({ length: sampleSize }, (_, index) => bank.questions[Math.floor(index * stride)]);
    })();

const bySubject = new Map();
for (const question of sampled) {
  const subject = question.subject ?? 'other';
  if (!bySubject.has(subject)) bySubject.set(subject, new Map());
  const chapters = bySubject.get(subject);
  const chapter = question.chapter ?? 'بدون فصل';
  if (!chapters.has(chapter)) chapters.set(chapter, []);
  chapters.get(chapter).push(question);
}

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

const marked = (question) => (Array.isArray(question.answerIndices) ? question.answerIndices : [question.answerIndex]);

const renderQuestion = (question, index) => blind
  ? `
  <article class="q">
    <p class="stem"><span class="num">${index}.</span> ${escapeHtml(question.stem)}</p>
    <ul class="options">
      ${question.options.map((option, position) => `<li><span class="letter">${LETTERS[position] ?? position + 1})</span> ${escapeHtml(option)}</li>`).join('\n      ')}
    </ul>
    <p class="answer">إجابتي: ...............</p>
    <p class="meta">${escapeHtml(question.id)}</p>
  </article>`
  : `
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

const keySheet = blind
  ? `
<section class="subject">
  <h2>مفتاح الإجابة — لا تنظر إليه قبل أن تجيب</h2>
  <p class="intro">قارن إجاباتك بما هنا. كل صف: معرّف السؤال ثم الحرف الصحيح.</p>
  <table class="key">
    <thead><tr><th>المعرّف</th><th>الإجابة</th><th>المعرّف</th><th>الإجابة</th></tr></thead>
    <tbody>
      ${(() => {
        const rows = sampled.map((question) => [question.id, marked(question).map((position) => LETTERS[position] ?? String(position + 1)).join('، ')]);
        const half = Math.ceil(rows.length / 2);
        return Array.from({ length: half }, (_, index) => {
          const left = rows[index];
          const right = rows[index + half] ?? ['', ''];
          return `<tr><td class="id">${escapeHtml(left[0])}</td><td>${escapeHtml(left[1])}</td><td class="id">${escapeHtml(right[0])}</td><td>${escapeHtml(right[1])}</td></tr>`;
        }).join('\n      ');
      })()}
    </tbody>
  </table>
  <p class="signoff">عدد ما أجبت عنه صحيحًا: ................ من ${sampled.length}</p>
</section>`
  : '';

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
  .key { width: 100%; border-collapse: collapse; font-size: .9rem; }
  .key th, .key td { border-bottom: 1px solid #ddd; padding: .3rem .5rem; text-align: right; }
  .key .id { direction: ltr; text-align: left; color: #444; }
  @media print { body { margin: 0; max-width: none; } .subject > h2 { break-before: page; } }
</style>
</head>
<body>
<h1>حزمة مراجعة المعلم</h1>
${blind
  ? `<p class="intro">${sampled.length} سؤالًا مسحوبة بانتظام من ${bank.questions.length}، بلا إجابة ولا شرح. أجب عليها بنفسك أولًا، ثم اقلب الصفحة الأخيرة وقارن. الغرض فحص مستقل: المراجعات السابقة رأت الإجابة مظللة، وهذا ما يعالجه هذا الوضع.</p>`
  : `<p class="intro">${sampled.length} سؤالًا أصليًا، ${chapterCount} فصلًا، مرتّبة بالمادة ثم بالفصل. الإجابة الصحيحة مظللة ومكتوبة، والشرح تحت كل سؤال. اكتب ملاحظاتك في السطر أسفل كل فصل، أو اكتب رقم السؤال وملاحظتك في آخر الصفحة.</p>`}
<p class="intro">أسماء الفصول مكتوبة كما هي في البنك (بالإنجليزية) لأنها مفاتيح بيانات، وليست ترجمة.</p>
<p class="intro">${blind
  ? `ما تم فحصه آليًا: أن الإجابة المسجلة في البنك هي القيمة التي ينتهي إليها الشرح، وأن الحساب في الشرح يعيد نفس النتيجة. ما لم يُفحص: هل هذه الإجابة صحيحة في نظر معلم المادة، ومطابقة المنهج.`
  : `ما تم فحصه آليًا: أن الإجابة المظللة هي القيمة التي ينتهي إليها الشرح، وأن الحساب في الشرح يعيد نفس النتيجة. ما لم يُفحص: صحة الشرح نفسه، ومطابقة المنهج. هذه هي المهمة.`}</p>
${sections}
<section class="subject">
  <h2>ملاحظات عامة</h2>
  <p class="signoff">راجع البنك كله: ................................ التاريخ: ................</p>
  <p class="signoff">أسئلة تحتاج تعديلًا (اكتب المعرّف والسبب):</p>
  <p class="signoff">&nbsp;</p>
  <p class="signoff">&nbsp;</p>
</section>
${keySheet}
</body>
</html>`;

writeFileSync(outputPath, html);
console.log(`wrote ${outputPath}: ${sampled.length} questions, ${chapterCount} chapters, ${bySubject.size} subjects${blind ? ' (blind: no key, no explanations)' : ''}`);
