/** UI strings. Arabic is the default because the kit targets RTL audiences first. */

export const STRINGS = {
  ar: {
    dir: 'rtl',
    start: 'ابدأ الاختبار',
    question: 'سؤال',
    of: 'من',
    next: 'التالي',
    previous: 'السابق',
    finish: 'عرض النتيجة',
    skip: 'تخطي',
    correct: 'إجابة صحيحة',
    wrong: 'إجابة غير صحيحة',
    correctAnswerIs: 'الإجابة الصحيحة',
    explanation: 'الشرح',
    result: 'النتيجة',
    score: 'الدرجة',
    retry: 'اختبار جديد',
    review: 'مراجعة الإجابات',
    unanswered: 'لم تُجب',
    difficulty: 'المستوى',
    subject: 'المادة',
    questionCount: 'عدد الأسئلة',
    noQuestions: 'لا توجد أسئلة مطابقة للاختيار الحالي.',
    progress: 'التقدم',
  },
  en: {
    dir: 'ltr',
    start: 'Start quiz',
    question: 'Question',
    of: 'of',
    next: 'Next',
    previous: 'Previous',
    finish: 'See result',
    skip: 'Skip',
    correct: 'Correct',
    wrong: 'Not correct',
    correctAnswerIs: 'Correct answer',
    explanation: 'Explanation',
    result: 'Result',
    score: 'Score',
    retry: 'New quiz',
    review: 'Review answers',
    unanswered: 'Not answered',
    difficulty: 'Difficulty',
    subject: 'Subject',
    questionCount: 'Questions',
    noQuestions: 'No questions match the current filters.',
    progress: 'Progress',
  },
};

export function t(language, key) {
  const table = STRINGS[language] || STRINGS.ar;
  return table[key] ?? key;
}

export function direction(language) {
  return (STRINGS[language] || STRINGS.ar).dir;
}
