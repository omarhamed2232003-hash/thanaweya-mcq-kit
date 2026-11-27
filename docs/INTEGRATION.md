# الدمج في مشروعك (Integration)

## 1. في صفحة عادية (بدون أدوات بناء)

```html
<script type="module">
  import { buildSession, gradeSession } from './src/index.js';

  const bank = await (await fetch('./data/my-bank.json')).json();
  const session = buildSession(bank, { count: 10, seed: crypto.randomUUID() });

  // session.questions[i] = { id, stem, options, answerIndex, explanation, ... }
  const result = gradeSession(session, { 'phy-ohm-001': 2 });
</script>
```

انتبه: `fetch` يحتاج خادمًا. افتح الصفحة عبر `npm run serve` أو أي خادم ثابت، لا عبر `file://`.

## 2. مع أي إطار عمل

المحرك لا يعرف شيئًا عن الواجهة. خذ `session.questions` واعرضها كما تريد، ثم مرّر كائن `{ id: selectedIndex }` إلى `gradeSession`. النتيجة تحتوي `items` (لكل سؤال) و`byDifficulty` و`bySubject` و`scorePercent`.

## 3. الجلسة والحفظ

```js
import { serializeSession, parseSession } from './src/index.js';

localStorage.setItem('quiz', serializeSession(session)); // حفظ
const resumed = parseSession(localStorage.getItem('quiz')); // استئناف
```

`parseSession` ترفض أي جلسة بنسخة مخطط غير معروفة، فلا تُقرأ بيانات قديمة بشكل خاطئ.

## 4. التكرار والبذرة

كل شيء يعتمد على `seed`. نفس البذرة ونفس البنك = نفس الاختبار ونفس ترتيب الخيارات. استخدم `seed` مختلفًا لكل محاولة جديدة، واحفظه إن أردت إعادة إنتاج اختبار أو التحقق من شكوى طالب.

## 5. RTL وإمكانية الوصول

- ضع `dir="rtl"` على `<html>` أو على حاوية الاختبار، واستخدم خصائص منطقية في CSS (`margin-inline-start`، `padding-inline-end`) بدل `left/right`.
- كل خيار زر حقيقي `<button>` مع `:focus-visible`، ويمكن الإجابة من لوحة المفاتيح بالأرقام 1..9.
- صفحة العرض التجريبية تستخدم `aria-live` لإعلان تغيّر السؤال، و`role="progressbar"` لشريط التقدم.
- الأرقام العربية والأرقام اللاتينية: النصوص تأتي من `src/i18n.js`، فيمكن تعديلها أو إضافة لغة.

## 6. تخصيص النصوص

`src/i18n.js` يحتوي كائن `STRINGS`. أضف لغة كاملة بمفاتيحها، ثم مرّر رمزها إلى `t(language, key)`. الشكل الافتراضي عربي.

## 7. التحقق قبل النشر

```bash
npm run validate
```

يفشل الأمر (exit code 1) عند أول بنك غير صالح، ويطبع كل الأخطاء مع مسارها. اربطه بـ CI قبل أي نشر.

## دمج أكثر من ملف أسئلة

إذا كان لديك بنك لكل مادة أو لكل فصل، ادمجها في الذاكرة قبل بناء الجلسة:

```js
import { mergeBanks, bankStats, buildSession } from 'thanaweya-mcq-kit';

const merged = mergeBanks([physicsBank, chemistryBank, mathsBank]);
if (!merged.ok) {
  // merged.errors فيه كل مشكلة مع رقم الملف، اعرضها للمحرر
  console.error(merged.errors);
} else {
  console.log(bankStats(merged.bank).bySubject);
  const session = buildSession(merged.bank, { count: 20 });
}
```

- `mergeBanks` يتحقق من كل ملف أولًا ويجمع كل الأخطاء بدل أن يتوقف عند أول خطأ.
- المعرّف المكرر بين ملفين خطأ افتراضيًا، ويمكن تجاهله بـ `{ onDuplicateId: 'skip' }`.
- `bankStats` يعطي العدد الكلي والتوزيع حسب المادة والصعوبة والفصل والصف، مفيد لعرض ملخص قبل الاختبار.
