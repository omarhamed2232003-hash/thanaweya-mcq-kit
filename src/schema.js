/**
 * Question bank schema and validation.
 *
 * The kit ships one bank format on purpose: a plain JSON file that a teacher,
 * a script or a CMS can produce. Validation returns a list of problems instead
 * of throwing, so an editor can show every error at once.
 */

export const SCHEMA_VERSION = 1;

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'advanced'];

export const DIFFICULTY_LABELS = {
  easy: { ar: 'سهل', en: 'Easy' },
  medium: { ar: 'متوسط', en: 'Medium' },
  hard: { ar: 'صعب', en: 'Hard' },
  advanced: { ar: 'متقدم', en: 'Advanced' },
};

const REQUIRED_STRING_FIELDS = ['id', 'subject', 'stem', 'explanation'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function addError(errors, path, code, message, messageAr) {
  errors.push({ path, code, message, messageAr });
}

/** Validate a single question. Returns an array of errors (empty when valid). */
export function validateQuestion(question, index = 0) {
  const errors = [];
  const at = `questions[${index}]`;

  if (!isPlainObject(question)) {
    addError(errors, at, 'not_an_object', 'Question must be an object.', 'السؤال يجب أن يكون كائنًا.');
    return errors;
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    const value = question[field];
    if (typeof value !== 'string' || value.trim() === '') {
      addError(errors, `${at}.${field}`, 'required_string',
        `"${field}" must be a non-empty string.`, `الحقل "${field}" مطلوب ويجب ألا يكون فارغًا.`);
    }
  }

  const type = question.type ?? 'single';
  if (type !== 'single' && type !== 'multi') {
    addError(errors, `${at}.type`, 'unsupported_type',
      '"type" must be "single" (one correct option) or "multi" (several correct options).',
      'نوع السؤال يجب أن يكون "single" (إجابة واحدة) أو "multi" (أكثر من إجابة صحيحة).');
  }

  if (!DIFFICULTIES.includes(question.difficulty)) {
    addError(errors, `${at}.difficulty`, 'invalid_difficulty',
      `"difficulty" must be one of: ${DIFFICULTIES.join(', ')}.`,
      `مستوى الصعوبة يجب أن يكون واحدًا من: ${DIFFICULTIES.join('، ')}.`);
  }

  const { options } = question;
  if (!Array.isArray(options) || options.length < 2) {
    addError(errors, `${at}.options`, 'too_few_options',
      'A question needs at least two options.', 'السؤال يحتاج خيارين على الأقل.');
  } else {
    options.forEach((option, optionIndex) => {
      if (typeof option !== 'string' || option.trim() === '') {
        addError(errors, `${at}.options[${optionIndex}]`, 'empty_option',
          'Options must be non-empty strings.', 'الخيارات يجب ألا تكون فارغة.');
      }
    });
    const normalized = options.map((option) => String(option).trim());
    if (new Set(normalized).size !== normalized.length) {
      addError(errors, `${at}.options`, 'duplicate_option',
        'Options must be distinct.', 'لا يجوز تكرار نفس الخيار داخل السؤال.');
    }
    if (options.length > 8) {
      addError(errors, `${at}.options`, 'too_many_options',
        'At most eight options are supported.', 'الحد الأقصى ثمانية خيارات.');
    }
  }

  if (type === 'multi') {
    if (question.answerIndex !== undefined) {
      addError(errors, `${at}.answerIndex`, 'answer_index_not_allowed',
        'A "multi" question uses "answerIndices", not "answerIndex".',
        'سؤال "multi" يستخدم "answerIndices" وليس "answerIndex".');
    }
    const { answerIndices } = question;
    if (!Array.isArray(answerIndices) || answerIndices.length < 2) {
      addError(errors, `${at}.answerIndices`, 'missing_answer',
        '"answerIndices" must list at least two correct options.',
        'الحقل "answerIndices" يجب أن يحتوي على خيارين صحيحين على الأقل.');
    } else if (answerIndices.some((value) => !Number.isInteger(value))) {
      addError(errors, `${at}.answerIndices`, 'answer_not_integer',
        '"answerIndices" must contain integers only.', 'كل القيم في "answerIndices" يجب أن تكون أرقامًا صحيحة.');
    } else {
      if (new Set(answerIndices).size !== answerIndices.length) {
        addError(errors, `${at}.answerIndices`, 'duplicate_answer',
          '"answerIndices" must not repeat an option.', 'لا يجوز تكرار نفس الخيار في "answerIndices".');
      }
      if (Array.isArray(options)) {
        if (answerIndices.some((value) => value < 0 || value >= options.length)) {
          addError(errors, `${at}.answerIndices`, 'answer_out_of_range',
            '"answerIndices" points outside the options list.', '"answerIndices" يشير إلى خيار غير موجود.');
        } else if (options.length <= answerIndices.length) {
          addError(errors, `${at}.options`, 'no_wrong_option',
            'A multi-answer question needs at least one wrong option.',
            'سؤال متعدد الإجابات يحتاج خيارًا خاطئًا واحدًا على الأقل.');
        }
      }
    }
  } else {
    const { answerIndex } = question;
    if (!Number.isInteger(answerIndex)) {
      addError(errors, `${at}.answerIndex`, 'missing_answer',
        '"answerIndex" must be an integer.', 'الحقل "answerIndex" يجب أن يكون رقمًا صحيحًا.');
    } else if (Array.isArray(options) && (answerIndex < 0 || answerIndex >= options.length)) {
      addError(errors, `${at}.answerIndex`, 'answer_out_of_range',
        '"answerIndex" points outside the options list.', '"answerIndex" يشير إلى خيار غير موجود.');
    }
  }

  if (question.tags !== undefined && (!Array.isArray(question.tags)
    || question.tags.some((tag) => typeof tag !== 'string'))) {
    addError(errors, `${at}.tags`, 'invalid_tags', '"tags" must be an array of strings.',
      'الحقل "tags" يجب أن يكون مصفوفة نصوص.');
  }

  return errors;
}

/** Validate a whole bank. */
export function validateBank(bank) {
  const errors = [];

  if (!isPlainObject(bank)) {
    addError(errors, 'bank', 'not_an_object', 'Bank must be an object.', 'الملف يجب أن يكون كائنًا.');
    return { ok: false, errors, questionCount: 0 };
  }

  if (bank.schemaVersion !== SCHEMA_VERSION) {
    addError(errors, 'schemaVersion', 'schema_version',
      `"schemaVersion" must be ${SCHEMA_VERSION}.`, `رقم نسخة المخطط يجب أن يكون ${SCHEMA_VERSION}.`);
  }

  if (!Array.isArray(bank.questions) || bank.questions.length === 0) {
    addError(errors, 'questions', 'no_questions', 'Bank must contain a "questions" array.',
      'الملف يجب أن يحتوي على مصفوفة "questions".');
    return { ok: false, errors, questionCount: 0 };
  }

  const seenIds = new Set();
  bank.questions.forEach((question, index) => {
    errors.push(...validateQuestion(question, index));
    if (isPlainObject(question) && typeof question.id === 'string') {
      if (seenIds.has(question.id)) {
        addError(errors, `questions[${index}].id`, 'duplicate_id',
          `Duplicate question id "${question.id}".`, `معرّف السؤال "${question.id}" مكرر.`);
      }
      seenIds.add(question.id);
    }
  });

  return { ok: errors.length === 0, errors, questionCount: bank.questions.length };
}

/** Throwing wrapper for tests and scripts. */
export function assertValidBank(bank) {
  const result = validateBank(bank);
  if (!result.ok) {
    const detail = result.errors.map((error) => `${error.path}: ${error.message}`).join('\n');
    throw new Error(`Invalid question bank:\n${detail}`);
  }
  return result;
}
