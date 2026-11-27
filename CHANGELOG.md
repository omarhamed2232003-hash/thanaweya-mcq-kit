# Changelog

## 0.17.0

- Eighth question batch: 16 new original questions (4 physics, 4 chemistry,
  4 biology, 4 maths), 3 of them multi-answer, taking the bank to 283
  (76 physics, 72 chemistry, 71 biology, 64 maths; 265 single, 18 multi).
- Mechanical audit only; listed in `docs/REVIEW_QUEUE.md` for a subject reviewer.
- The `mcq-bank-lint` cross-check runs clean: 0 errors, 0 warnings, one
  documented suppression.
## 0.16.0

- Seventh question batch: 16 new original questions (4 physics, 4 chemistry,
  4 biology, 4 maths), 4 of them multi-answer, taking the bank to 267
  (72 physics, 68 chemistry, 67 biology, 60 maths; 252 single, 15 multi).
- Mechanical audit only. The batch is listed in `docs/REVIEW_QUEUE.md` and needs
  a subject reviewer before any release.
- The separate `mcq-bank-lint` cross-check runs clean: 0 errors, 0 warnings,
  1 documented suppression.
## 0.15.1

- `chem-mole-005` states its answer in the explanation now ("6.02×10²³ ذرة"),
  so the cross-check with `mcq-bank-lint` runs clean apart from the one
  documented suppression.
- Added `.mcq-lint-allow.json` with that suppression and its reason, and a
  short section in `docs/QUESTION_AUTHORING.md` on running the linter as a
  second opinion before a batch goes to review.
## 0.15.0

- Sixth question batch: 24 new original questions (8 physics, 6 chemistry,
  5 biology, 5 maths), 7 of them multi-answer, taking the bank to 251
  (68 physics, 64 chemistry, 63 biology, 56 maths; 240 single, 11 multi).
- The batch has had the mechanical answer-key audit only. It is listed in
  `docs/REVIEW_QUEUE.md` and needs a subject reviewer before any release.
- Cross-checked with the separate `mcq-bank-lint` tool: it flags one question
  (`math-alg-005`) whose explanation ends on the value of the second variable.
  That key is correct (x = 7, then y = 3); the linter's "last number wins"
  heuristic is the thing that is wrong, and the existing whitelist entry in
  `test/answers.test.js` documents it.
## 0.14.0

- The demo UI now plays multi-answer questions: options toggle instead of
  locking on the first click, the check moves to the end of the question, and
  the reveal and the review list show every correct option.
- Verified by rendering the demo in a headless browser against a bank of only
  multi-answer questions and reading the screenshots: selection state, reveal
  with correct/wrong marks, and the result review listing all correct options.
- An empty question pool now shows a message instead of building an empty
  session and crashing on the first render.
## 0.13.1

- Fix the demo UI: it assumed every question has `answerIndex`, so a session
  that picked one of the new multi-answer questions would have marked it wrong
  and shown "undefined" as the answer. The demo now builds its session from
  single-answer questions only.
- Multi-answer rendering is written in `ui/quiz.js` but deliberately not
  enabled: it has not been through a visual check yet, and the code says so.
## 0.13.0

- Add 15 more original questions (physics 4, chemistry 4, biology 4, maths 3),
  taking the bank to 227. All pass the answer-key audit.
- Add the batch to docs/REVIEW_QUEUE.md for a subject reviewer.
## 0.12.0

- Add 20 more original questions (physics 5, chemistry 5, biology 5, maths 5),
  taking the bank to 212. All pass the answer-key audit.
- Add the batch to docs/REVIEW_QUEUE.md: it still needs a subject reviewer.
## 0.11.0

- Add multi-answer questions: `"type": "multi"` with `answerIndices`. Schema
  validation, option shuffling and grading all handle both types, and grading
  needs the exact set (no missing and no extra option) with a partial score.
- Add four multi-answer questions (physics, chemistry, biology, maths); bank is
  now 192 questions.
- Add `docs/REVIEW_QUEUE.md`: the batches that have had only the mechanical
  answer-key audit and still need a subject reviewer before any release.
- `npm test` now runs every file in `test/`.
## 0.10.0

- Add 23 more original questions (physics 6, chemistry 6, biology 7, maths 4),
  taking the bank to 188. Two drafts duplicated existing stems and were dropped.
- One new explanation (chem-eq-006) was rewritten so its oxygen count is stated
  as a number; the answer-key audit caught that it only described it in words.
## 0.9.0

- Add 35 original questions (physics 7, chemistry 8, biology 8, maths 12), each
  written for this repo with a worked explanation. Bank is now 165 questions.
- The answer-key audit runs over the new questions too: all pass.
## 0.8.0

- Add `test/answers.test.js`: an answer-key audit that recomputes the arithmetic
  each explanation shows, checks that the value an explanation finishes on is the
  marked option, and rejects duplicate options. Two hand-checked exceptions
  (intermediate "=" steps) are listed in the test with their reasons.
- Audit of all 130 questions against those checks: no key/explanation
  disagreement found.
## 0.7.0 — 2026-11-27

- توسيع البنك من 110 إلى 130 سؤالًا أصليًا: 36 فيزياء، 35 كيمياء، 32 أحياء، 27 رياضيات.
- موضوعات جديدة: العجلة المتغيرة وطاقة حركة السيارة والطاقة بالكيلوواط·ساعة وسرعة الضوء والحمل، حساب الأكسجين في الاحتراق والتعادل والجرافيت وقانون بويل والميثانول، الغشاء البلازمي والتزاوج مع الفرد المتنحي ومصدر أكسجين البناء الضوئي والكريات البيضاء وانتقال الطاقة، المتباينات وفيثاغورس وقاعدة السلسلة والمدى واللوغاريتمات.
- `npm run validate`: 130 سؤالًا سليمة. `npm test`: 39/39.

## 0.6.0 — 2026-11-27

- `src/bank.js`: دالتان جديدتان — `mergeBanks` لدمج عدة ملفات أسئلة مع التحقق من كل ملف وجمع كل الأخطاء، و`bankStats` لتوزيع الأسئلة حسب المادة والصعوبة والفصل والصف.
- المعرّف المكرر بين ملفين يُبلَّغ عنه كخطأ افتراضيًا، ويمكن تجاهله بخيار `onDuplicateId: 'skip'`.
- `test/bank.test.js`: 7 اختبارات للدمج والإحصاءات، والمجموع 39 اختبارًا.
- `docs/INTEGRATION.md`: قسم يشرح الدمج بمثال.
- `npm run validate`: 110 سؤالًا سليمة. `npm test`: 39/39.

## 0.5.0 — 2026-11-27

- توسيع البنك من 90 إلى 110 سؤالًا أصليًا: 31 فيزياء، 30 كيمياء، 27 أحياء، 22 رياضيات.
- موضوعات جديدة: القدرة الكهربائية وكمية الحركة وتحولات المادة وانتشار الصوت والتوازي، تفاعل الإحلال والألكانات والرابطة الثلاثية والأحماض القوية، الريبوسوم والكلوروفيل والهجين والسلسلة الغذائية والجليكوليز، القيمة المطلقة وزوايا المثلث والمنوال وظا 45°.
- `npm run validate`: 110 سؤالًا سليمة. `npm test`: 32/32.

## 0.4.0 — 2026-11-27

- توسيع البنك من 70 إلى 90 سؤالًا أصليًا: 26 فيزياء، 25 كيمياء، 22 أحياء، 17 رياضيات.
- موضوعات جديدة: قانون أوم والعجلة والعلاقة بين التردد والطول الموجي والعدسات المقعرة ووحدات الحرارة، الحجم المولي والتعادل والتوزيع الإلكتروني والقطبية وpH، البلاستيدات والنيوكليوتيدة والخلايا البائية والمحللات والميوزي، نظم المعادلات ومساحة الدائرة ومشتقة الجيب واللوغاريتم والوسيط.
- `docs/QUESTION_AUTHORING.md`: قواعد كتابة سؤال جديد (محتوى أصلي، إجابة واحدة صحيحة، شرح، توزيع الإجابات) وقائمة مراجعة.
- `npm run validate`: 90 سؤالًا سليمة. `npm test`: 32/32.

## 0.3.0 — 2026-11-27

- توسيع البنك من 46 إلى 70 سؤالًا أصليًا: 21 فيزياء، 20 كيمياء، 17 أحياء، 12 رياضيات.
- تغطية أوسع للمناهج: الضغط والزمن الدوري وطاقة الوضع والقدرة، الحسابات المولية والذوبان وسرعة التفاعل والجدول الدوري، التنفس والدم والجهاز العصبي والهرمونات والبيئة والانقسام الميتوزي، الأسس والمتتابعات والاحتمال والفرق بين مربعين.
- كل سؤال جديد بشرح وتاق ومستوى صعوبة، والإجابات الصحيحة ما زالت موزعة على المواضع الأربعة.
- `npm run validate`: 70 سؤالًا سليمة. `npm test`: 32/32.

## 0.2.0 — 2026-11-27

- توسيع بنك الأسئلة من 18 إلى 46 سؤالًا أصليًا: 15 فيزياء، 14 كيمياء، 11 أحياء، 6 رياضيات.
- مادة الرياضيات أضيفت كموضوع جديد في البنك (جبر، مثلثات، هندسة، تفاضل، إحصاء) مع شرح لكل إجابة.
- توزيع الإجابات الصحيحة بقي على المواضع الأربعة كلها، وكل سؤال جديد مصحوب بوسوم `tags` ومستوى صعوبة.
- `npm run validate` يمر على 46 سؤالًا، و`npm test` يمر بـ32 اختبارًا.

## 0.1.0 — 2026-11-27

- الإصدار الأول: محرك أسئلة اختيار من متعدد عربي (RTL) بدون تبعيات.
- `src/schema.js`: مخطط بنك الأسئلة والتحقق منه بأخطاء عربية وإنجليزية.
- `src/engine.js`: اختيار الأسئلة بمرشحات، خلط ببذرة ثابتة، توزيع صعوبة 30/40/20/10، تصحيح، ملخصات، حفظ الجلسة.
- `ui/`: صفحة تجريبية RTL مع وضع فاتح وداكن، دعم لوحة المفاتيح، واستئناف الجلسة.
- `data/sample-questions.json`: 18 سؤالًا أصليًا (فيزياء، كيمياء، أحياء).
- 32 اختبارًا عبر `node:test` وسكربت تحقق للبيانات.
