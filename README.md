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
npm test          # 32 اختبارًا للمحرك والمخطط والبيانات
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
  sample-questions.json   283 سؤالًا أصليًا في الفيزياء والكيمياء والأحياء والرياضيات
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

الأسئلة الـ283 المرفقة كتبت خصيصًا لهذا المستودع، بشرح لكل إجابة وتوزيع متوازن للإجابات الصحيحة على المواضع الأربعة. الملف `data/sample-questions.json` يحمل `licenseNote` يوضح ذلك. عند إضافة أسئلة جديدة: محتوى أصلي فقط، ولا نسخ من امتحانات أو كتب محمية بحقوق نشر، ولا ادعاء بأنها أسئلة رسمية.

## الاختبارات

- 32 اختبارًا عبر `node:test` (محرك، مخطط، بيانات).
- تشغيل محلي: `npm test`.
- CI: `.github/workflows/test.yml` على Node 20 و22.

## الترخيص

MIT — راجع [LICENSE](LICENSE).

## English summary

A zero-dependency, Arabic-first (RTL) multiple-choice quiz engine. Pure selection, seeded shuffling, difficulty mix (30/40/20/10 by default), grading with per-question explanations, session serialization and a JSON question-bank schema with validation that reports every problem at once. Ships with a vanilla RTL demo UI (single-answer and multi-answer questions) and 283 original sample questions across physics, chemistry, biology and maths. Run `npm test`, `npm run validate`, or `npm run serve`. MIT licensed.

## Answer-key audit

`npm test` includes an audit of every question's marked answer against its own
explanation: the arithmetic shown in the explanation is recomputed, the value
the explanation finishes on must be the marked option, and no two options may be
the same answer. Questions where an explanation contains an intermediate
equation are listed in the test with the reason they are excluded.
