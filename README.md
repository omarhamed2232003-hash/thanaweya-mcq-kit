# thanaweya-mcq-kit

محرك أسئلة اختيار من متعدد عربي (RTL) بدون أي تبعيات، مع محتوى تجريبي أصلي.
Arabic-first multiple-choice quiz engine with zero dependencies and original sample content.

- **بدون تبعيات**: يعمل بـ JavaScript وحدها. لا npm install، لا أدوات بناء.
- **عربي أولًا**: واجهة RTL كاملة، ونصوص جاهزة بالعربية والإنجليزية.
- **محرك نقي**: الاختيار والخلط والتصحيح والملخصات في `src/`، بلا DOM وبلا شبكة، فيعمل في المتصفح وفي Node وفي الاختبارات.
- **قابل لإعادة الاستخدام والتوسع**: بنك أسئلة بصيغة JSON بسيطة، مخطط موثّق، وأدوات تحقق تعطي كل الأخطاء مرة واحدة.
- **محتوى أصلي فقط**: الأسئلة المرفقة كُتبت لهذا المشروع، وليست منقولة من أي امتحان أو كتاب رسمي، ولا تُقدَّم على أنها مطابقة لمنهج معيّن.

## البدء السريع

```bash
npm test          # المحرك والمخطط والبيانات وتدقيق المفاتيح
npm run validate  # التحقق من كل بنوك الأسئلة داخل data/
npm run serve     # خادم محلي على المنفذ 8080
# ثم افتح http://localhost:8080/ui/
```

لا حاجة إلى `npm install`: لا توجد حزم خارجية.

## بنية المشروع

```
src/
  schema.js    مخطط السؤال والتحقق منه (أخطاء عربية وإنجليزية)
  rng.js       مولّد أرقام عشوائية ببذرة ثابتة (نتائج قابلة للتكرار)
  engine.js    الاختيار، خلط الخيارات، التصحيح، الملخصات، حفظ الجلسة
  i18n.js      نصوص الواجهة بالعربية والإنجليزية
  index.js     الواجهة العامة للحزمة
ui/
  index.html   صفحة تجريبية جاهزة
  quiz.js      تحكم الواجهة (DOM عادي، بدون إطار عمل)
  quiz.css     تنسيق RTL مع وضع فاتح وداكن
data/
  sample-questions.json   241 سؤالًا أصليًا في الفيزياء والكيمياء والأحياء والرياضيات
docs/
  QUESTION_SCHEMA.md      شرح كل حقل وقواعد التحقق
  INTEGRATION.md          كيف تُدمج المحرك في موقعك أو تطبيقك
test/                     اختبارات node:test
```

## مثال سريع

```js
import { buildSession, gradeSession } from './src/index.js';

const bank = await (await fetch('./data/sample-questions.json')).json();

const session = buildSession(bank, {
  count: 10,
  seed: 'class-2027-01',       // نفس البذرة = نفس الاختبار
  filters: { subjects: ['physics'] },
  mix: { easy: 30, medium: 40, hard: 20, advanced: 10 },
});

// في الواجهة: اعرض session.questions، وضع إجابة الطالب في كائن {id: index}
const result = gradeSession(session, { 'phy-ohm-001': 2 });
console.log(result.scorePercent, result.byDifficulty);
```

## مخطط السؤال

```json
{
  "id": "phy-ohm-001",
  "type": "single",
  "subject": "physics",
  "grade": "3",
  "chapter": "electricity",
  "difficulty": "easy",
  "stem": "نص السؤال",
  "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
  "answerIndex": 0,
  "explanation": "شرح الإجابة الصحيحة",
  "tags": ["ohm-law"]
}
```

القواعد الكاملة وأكواد الأخطاء في [docs/QUESTION_SCHEMA.md](docs/QUESTION_SCHEMA.md)، وطريقة الدمج في [docs/INTEGRATION.md](docs/INTEGRATION.md).

كتابة سؤال جديد: [docs/QUESTION_AUTHORING.md](docs/QUESTION_AUTHORING.md).

## المحتوى

الأسئلة الـ241 المرفقة كتبت خصيصًا لهذا المستودع، بشرح لكل إجابة وتوزيع متوازن للإجابات الصحيحة على المواضع الأربعة. الملف `data/sample-questions.json` يحمل `licenseNote` يوضح ذلك. عند إضافة أسئلة جديدة: محتوى أصلي فقط، ولا نسخ من امتحانات أو كتب محمية بحقوق نشر، ولا ادعاء بأنها أسئلة رسمية.

## الاختبارات

- الاختبارات عبر `node:test` بلا أي تبعيات: المحرك، المخطط، البيانات، تدقيق المفاتيح، حزمة المراجعة، وروابط الوثائق. العدد يظهر في مخرجات `npm test` وفي CI.
- تشغيل محلي: `npm test`.
- CI: `.github/workflows/test.yml` على Node 20 و22.

## Part of a set

- [mcq-bank-lint](https://github.com/omarhamed2232003-hash/mcq-bank-lint) — audits each key against its own explanation.
- [mcq-bank-diff](https://github.com/omarhamed2232003-hash/mcq-bank-diff) — what changed between two versions of a bank.
- [mcq-exam-paper](https://github.com/omarhamed2232003-hash/mcq-exam-paper) — a printable paper and key from the same bank.

`docs/PIPELINE.md` shows how the four compose, and where each one stops.

## الترخيص

MIT — راجع [LICENSE](LICENSE).

## نسخة بملف واحد

```bash
npm run build:demo          # يكتب demo.html في جذر المستودع
```

`demo.html` يحمل التنسيق والسكربت والبنك كله داخله، فيفتح من القرص مباشرة بلا خادم وبلا شبكة. مفيد لمن يريد تجربة الأسئلة على جهاز بلا إنترنت، وللتأكد من أن الواجهة تعمل مع البنك كما هو.

## تضمين المحرك في موقع

`docs/EXAM_SITE_EMBED.md` يشرح ثلاث طرق للتضمين: صفحة واحدة تحمل البنك كله، أو مجموعة فرعية لكل موضوع، أو تصحيح على الخادم. وفيه تنبيه صريح: أي تصحيح في المتصفح يعني أن مفتاح الإجابة موجود في الصفحة، وهذا مقبول للتدريب لا للامتحان المحسوب.

## بنية الكود

`docs/API.md` يسرد كل ما تصدّره المكتبة بدالة وتوقيع لكل اسم. و`docs/ARCHITECTURE.md` يشرح الطبقات: المخطط، البنك، المحرك، الواجهة، وأين تنتهي مسؤولية كل ملف. و`schema/question.schema.json` يصف صيغة البنك بصيغة JSON Schema ليستطيع المحرر إكمال الحقول، و`docs/SCHEMA.md` يوضح أنه للوصف فقط وأن `npm run validate` هو المدقق الفعلي.

## مراجعة المحتوى

قبل أي إصدار، الأسئلة تحتاج مراجعة بشرية من متخصص. حزمة المراجع كاملة في `review/`: كل سؤال مجموعًا بحسب الدفعة التي أضافته (`review/questions-by-batch.md`)، والبيانات نفسها (`review/batches.json`)، ودليل يشرح ما تم فحصه آليًا وما يُطلب من المراجع (`review/REVIEWER_GUIDE.md`).

## English summary

A zero-dependency, Arabic-first (RTL) multiple-choice quiz engine. Pure selection, seeded shuffling, difficulty mix (30/40/20/10 by default), grading with per-question explanations, session serialization and a JSON question-bank schema with validation that reports every problem at once. Ships with a vanilla RTL demo UI (single-answer and multi-answer questions) and 241 original sample questions across physics, chemistry, biology and maths. Run `npm test`, `npm run validate`, or `npm run serve`. MIT licensed.

## Answer-key audit

`npm test` includes an audit of every question's marked answer against its own
explanation: the arithmetic shown in the explanation is recomputed, the value
the explanation finishes on must be the marked option, and no two options may be
the same answer. Questions where an explanation contains an intermediate
equation are listed in the test with the reason they are excluded.

## Status and limits

- No tag and no release yet: the first release waits on a subject-teacher sign-off of the content.
- The bank has been through mechanical checks and two independent reviews (science and wording), but not a Ministry of Education textbook check.
- The sample content is not curriculum-aligned and is not presented as official material.
- The engine is general; the demo UI is a demonstration, not a product.
