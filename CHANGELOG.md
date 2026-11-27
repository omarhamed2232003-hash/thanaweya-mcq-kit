# Changelog

## 0.26.1

- `docs/QUESTION_AUTHORING.md`: says the allowance file is empty today and why,
  adds the schema file so an editor knows the fields, and states the rule that a
  batch is not reviewed until a person has read it (with a pointer to
  `docs/REVIEW_QUEUE.md`).
- `review/REVIEWER_GUIDE.md` no longer claims the linter runs with one
  suppression; there are none.
## 0.26.0

- `docs/API.md`: every export with its signature and one line on what it does,
  in groups (building a session, grading, sessions, validation, banks,
  randomness, text, defaults). `test/readme-covers-api.test.js` fails if an
  export is missing from it.
## 0.25.2

- `npm run validate -- --json` prints one JSON report (`{ ok, banks: [{ file,
  ok, questions, errors }] }`), so a build can read the result instead of
  scraping the text. The text report is unchanged.
- The script lists the banks in a stable order and keeps the exit code: 1 when
  any bank is invalid.
## 0.25.1

- `docs/REVIEW_QUEUE.md` rewritten to say what actually happened: every batch is
  now in one table with its mechanical check and its review, the maths
  replacements carry both rounds, and a separate section lists what the reviews
  did not do (no teacher sign-off, no textbook check, the two rounds where the
  reviewer saw the marked key). It was still describing the pre-review state.
- README no longer prints a test count, which had gone stale twice; the count is
  in the `npm test` output and in CI.
## 0.25.0

- `docs/EXAM_SITE_EMBED.md`: the embedding guide for a site — three shapes
  (whole bank in the page, a subset per topic, grading on a server), what to call
  and in what order, session persistence, the single-file build, and a plain
  statement of where the answer key ends up in each shape. Client-side grading
  exposes the key; that is fine for practice and not for marks.
- `test/docs-links.test.js`: every relative link in the documentation must point
  at a file that exists. Tests 81/81.
## 0.24.0

- `npm run build:demo`: one self-contained `demo.html` with the CSS, the script
  and the whole bank inlined, so it opens from a file path with no server and no
  network. No bundler dependency: the modules have no top-level name collisions,
  so the build is a topological concatenation with the module syntax removed, and
  a test fails if module syntax survives or the inlined bank does not parse.
- The demo reads `window.__BANK__` when it is present, so the served demo and the
  single-file build run the same code path.
- Fixed: the subject label map had no entry for maths, so the subject showed as
  `math` in both languages. It now reads رياضيات / Maths. A test fails if a
  subject appears in the bank with no UI label.
- Verified visually: the built file opened in headless Chrome from a file path,
  the subject list filled with 241 questions (66 physics, 60 chemistry,
  53 biology, 62 maths) and the maths label rendered in Arabic.
## 0.23.1

- `docs/PIPELINE.md`: how the four tools compose (author, lint, diff, print,
  play), with the commands and a table of where each one stops.
- CI matrix now runs Node 20, 22 and 24.
## 0.23.0

- `schema/question.schema.json`: the bank format as JSON Schema (draft 2020-12),
  for editors and for another language reading the shape without running
  JavaScript. `docs/SCHEMA.md` says how to point an editor at it and that
  `npm run validate` stays the authoritative check.
- `test/schema-file.test.js`: fails if the schema file drifts from the
  validator — schemaVersion, the difficulty list and the type list must match
  `src/schema.js` — and checks the real bank against the constraints the file
  states. Tests 56/56.
## 0.22.3

- `RELEASE_CHECKLIST.md`: what has to happen before the first tag, split into
  before, at, and after, with the repository-specific gates underneath.
- `docs/RELEASE_NOTES_DRAFT.md`: draft first-release notes for Omar to read
  next to the README, including a plain "what it does not do" section. Draft
  only: nothing is tagged or published.
## 0.22.2

- `docs/ARCHITECTURE.md`: the layers (schema, bank, engine, UI), what each
  module owns and does not own, the data flow of one quiz, where the tests sit
  and where the content rules live.
- README gains a "Status and limits" section that says what is true today: no
  release yet, reviewed but not signed off by a subject teacher, no textbook
  check, sample content not curriculum-aligned.
- README: test counts corrected from 32 to 53, Arabic sections grouped ahead of
  the English summary, architecture doc linked from the project structure.
## 0.22.1

- Round 3 review of the 14 calculus replacements: 14 pass, keys derived
  independently rather than checked against the marked one.
- Difficulty labels corrected: math-deriv-009, math-deriv-011 and
  math-integ-009 to easy; math-integ-010 and math-integ-011 to medium.
- docs/REVIEW_FINDINGS.md records the outcome and, plainly, what it does not
  establish: independent derivation is not a teacher sign-off, and no Ministry
  of Education textbook check has been done.
## 0.22.0

- Second maths review applied: 15 pass, 14 fix, 14 fail of the 43 replacement
  questions, no wrong keys. The 14 failures were level failures.
- The 14 failed items are replaced with 14 calculus questions at medium or hard
  level (chain and quotient rules, tangent, optimisation, stationary points,
  substitution integrals, definite integral by substitution, two areas under a
  curve, two limits needing rationalising or a double-angle identity). Bank
  stays at 241.
- The 14 fix items are fixed: a near-duplicate limit rewritten to a different
  factorisation, two difficulty labels lowered, one implausible option
  replaced, one weak distractor replaced, two basic items relabelled medium.
- Complex numbers, sequences and the 2D dot product are marked borderline for
  placement in `docs/REVIEW_FINDINGS.md` rather than quietly kept.
- Recorded in the docs and in the packet: the reviewer saw the marked key, so a
  subject-teacher sign-off is still required before release.
## 0.21.0

- Maths replacement, on Omar's decision: the 43 questions the maths reviewer
  judged prep-stage level are replaced with 43 new Thanaweya Amma-level
  questions (limits, derivatives and applications, integration, complex
  numbers, sequences and series, logarithms, trigonometric identities and
  equations, vectors, solid geometry, probability, statistics).
- 32 of the 43 flagged ids were still in the bank (11 had already been dropped
  as duplicates); those 32 are gone and the 43 new questions carry new ids, so
  no verdict in `docs/REVIEW_FINDINGS.md` is ambiguous. The bank is now 241.
- The new questions have had the mechanical checks only. They are batch 15 in
  the reviewer packet and are waiting for an independent subject review.
- The stale linter suppression for `math-alg-005` is removed, since that
  question no longer exists; the linter now runs with no suppressions at all.
## 0.20.0

- Independent review applied. Two reviewers read the bank (physics and
  chemistry: 148 questions; biology and maths: 135). 253 passed, 30 asked for a
  fix, 0 wrong keys. Details in `docs/REVIEW_FINDINGS.md`.
- 53 near-duplicates dropped, keeping the earliest question in each cluster:
  the bank is now 230 questions.
- 8 questions rewritten for science or wording (chem-mole-002, chem-mole-015,
  chem-ph-002, phy-heat-004, phy-multi-003, bio-enzyme-018, bio-resp-005, and
  phy-series-004 renamed phy-parallel-004 because the question is parallel, not
  series). bio-resp-005 now follows the textbook figure of 36 to 38 ATP.
- 4 difficulty labels corrected to easy.
- 43 maths questions were judged prep-stage level. They are kept and listed in
  `docs/REVIEW_FINDINGS.md`: relabelling or replacing them is a decision, not a
  quiet edit.
- The review did not check textbook alignment beyond the ATP case, and that
  limit is written down rather than implied.
- One test fixed: the grading test assumed the first seeded question was
  single-answer, which stopped being true once the bank shrank.
## 0.19.0

- `CONTRIBUTING.md` now carries the review workflow: what the mechanical checks
  cover and what they do not, where the reviewer packet lives, that every new
  batch needs a row in `docs/REVIEW_QUEUE.md`, and a short checklist for adding
  a question (original content, explanation ends on the right value, arithmetic
  recomputes, validate/test/linter, then the batch row).
- No question changes.
## 0.18.0

- Reviewer packet under `review/`: `questions-by-batch.md` lays out all 283
  questions grouped by the batch that introduced them (key marked, explanation
  under each), `batches.json` carries the same grouping as data, and
  `REVIEWER_GUIDE.md` says what is already checked mechanically, what a
  reviewer is asked to do and how to report back.
- Batch membership is derived from the repository history (each commit that
  touched the bank), not hand-listed, so it cannot drift from the truth.
- `test/review-packet.test.js` fails if the packet and the bank disagree: every
  question in exactly one batch, batch counts adding up, and the guide naming
  the checks it does not replace. Tests 53/53.
- No new questions in this release; the effort went into review-readiness.
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
