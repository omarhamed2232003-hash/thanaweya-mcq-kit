# كتابة سؤال جديد (Question authoring)

هذا المستودع لا يستقبل أسئلة منقولة. كل سؤال يُكتب من الصفر، ويُراجع قبل الدمج.

## ما يُقبل

1. سؤال أصلي صيغته من عند الكاتب، وليس نسخًا أو إعادة صياغة قريبة من سؤال في امتحان أو كتاب أو بنك أسئلة محمي.
2. إجابة صحيحة واحدة لا تحتمل التأويل، وثلاث مشتتات معقولة تمثل أخطاء شائعة.
3. شرح يوضح خطوات الوصول للإجابة، لا مجرد تكرار الاختيار الصحيح.
4. لغة عربية سليمة، ووحدات مكتوبة بوضوح، والأرقام العربية الشرقية أو الغربية بشرط الثبات داخل السؤال.
5. مستوى صعوبة واحد من `easy` و`medium` و`hard` و`advanced`، ووسوم تصف الموضوع لا مستوى الصعوبة.

## ما لا يُقبل

- نص منقول من امتحان رسمي أو من كتاب مدرسي أو من موقع آخر.
- سؤال يحتاج بيانات حديثة أو رأيًا شخصيًا أو معلومة خلافية.
- بيانات شخصية أو أسماء أشخاص حقيقيين أو معلومات تواصل.
- خياران صحيحان أو سؤال بلا إجابة صحيحة.

## الخطوات

1. اكتب السؤال في محرر نصوص، ثم تحقق من الحساب أو المعلومة مرتين بطريقتين مختلفتين.
2. أضف الصف إلى `data/sample-questions.json` بالحقول: `id` و`subject` و`grade` و`chapter` و`difficulty` و`stem` و`options` و`answerIndex` و`explanation` و`tags`.
3. المعرّف على النمط `subject-topic-001`، ويُزاد الرقم لكل سؤال جديد في الموضوع نفسه.
4. شغّل `npm run validate` ثم `npm test`.
5. راجع توزيع الإجابات الصحيحة على المواضع الأربعة، ولا تدع سؤالًا جديدًا يكدس الإجابات في موضع واحد.
6. أضف سطرًا في `CHANGELOG.md` يوضح عدد الأسئلة الجديدة وموضوعاتها.

## قائمة مراجعة سريعة

- [ ] السؤال أصلي وكتبته بنفسي.
- [ ] إجابة واحدة صحيحة، والمشتتات خاطئة فعلًا.
- [ ] الشرح يوضح الخطوات.
- [ ] الوحدات والرموز مكتوبة صحيحة.
- [ ] `npm run validate` و`npm test` يمران.
- [ ] توزيع `answerIndex` ما زال يغطي المواضع الأربعة.

## Second opinion from the linter

`npm test` audits keys with this repo's own checker. A separate tool, `mcq-bank-lint`, does the same job from the outside and catches things this one does not, so it is worth running before a batch goes to review:

```bash
node ../mcq-bank-lint/bin/mcq-bank-lint.js data/sample-questions.json --allow-file .mcq-lint-allow.json
```

`.mcq-lint-allow.json` holds the findings that are the linter being wrong rather than the bank being wrong. It is **empty today**: the three cases that once needed an entry were fixed at the source instead, which is the outcome to aim for. Each entry needs a `reason`, and the linter reports an entry that suppresses nothing as `unused-allowance`, so the file cannot rot quietly. Add an entry only after checking the question by hand.

## محرر يعرف الحقول

`schema/question.schema.json` يصف صيغة السؤال بـ JSON Schema، فيقترح المحرر الحقول ويشتكي من مستوى صعوبة غير معروف قبل أن تشغّل أي أمر. الملف للوصف فقط: `npm run validate` هو المدقق الفعلي، و`docs/SCHEMA.md` يشرح كيف تربط المحرر به.

## قبل أن يُعدّ السؤال مقروءًا

إضافة سؤال لا تعني أنه رُوجع. القاعدة في `docs/REVIEW_QUEUE.md`: الدفعة تحتاج قارئًا بشريًا، ومراجعة آلية لا تُسمى مراجعة. سجّل الدفعة الجديدة في `docs/REVIEW_QUEUE.md` وفي `CHANGELOG.md`، واذكر ما لم يُفحص (مطابقة الكتاب المدرسي مثلًا).
