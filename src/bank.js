/**
 * Bank composition helpers.
 *
 * A teacher or an exam site usually has more than one bank file: one per
 * subject, one per term, or one per teacher. These helpers combine them and
 * summarise them without touching the DOM or the filesystem.
 */

import { SCHEMA_VERSION, validateBank } from './schema.js';

/** Count questions by subject, difficulty, chapter and grade. */
export function bankStats(bank) {
  const questions = Array.isArray(bank?.questions) ? bank.questions : [];
  const countBy = (field) => questions.reduce((acc, question) => {
    const value = question?.[field];
    if (value === undefined || value === null || String(value).trim() === '') return acc;
    const key = String(value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: questions.length,
    bySubject: countBy('subject'),
    byDifficulty: countBy('difficulty'),
    byChapter: countBy('chapter'),
    byGrade: countBy('grade'),
  };
}

/**
 * Combine several banks into one.
 *
 * Every bank is validated first. Problems are collected, never thrown, so an
 * editor can show all of them at once. Duplicate question ids across banks are
 * either reported as errors (default) or skipped.
 *
 * @param {object[]} banks
 * @param {{onDuplicateId?: 'error'|'skip', title?: string, language?: string}} [options]
 * @returns {{ok: boolean, bank: object, questions: object[], errors: object[], stats: object}}
 */
export function mergeBanks(banks, options = {}) {
  const { onDuplicateId = 'error', title, language } = options;
  if (!Array.isArray(banks) || banks.length === 0) {
    throw new Error('mergeBanks needs at least one bank');
  }
  if (!['error', 'skip'].includes(onDuplicateId)) {
    throw new Error('onDuplicateId must be "error" or "skip"');
  }

  const errors = [];
  const questions = [];
  const seenIds = new Map();

  banks.forEach((bank, bankIndex) => {
    const result = validateBank(bank);
    if (!result.ok) {
      result.errors.forEach((error) => errors.push({ bank: bankIndex, ...error }));
      return;
    }
    bank.questions.forEach((question, questionIndex) => {
      if (seenIds.has(question.id)) {
        if (onDuplicateId === 'skip') return;
        errors.push({
          bank: bankIndex,
          path: `questions[${questionIndex}].id`,
          code: 'duplicate_id_across_banks',
          message: `Question id "${question.id}" already exists in bank ${seenIds.get(question.id)}.`,
          messageAr: `معرّف السؤال "${question.id}" موجود بالفعل في الملف رقم ${seenIds.get(question.id)}.`,
        });
        return;
      }
      seenIds.set(question.id, bankIndex);
      questions.push(question);
    });
  });

  const merged = {
    schemaVersion: SCHEMA_VERSION,
    language: language ?? banks.find((bank) => typeof bank?.language === 'string')?.language ?? 'ar',
    direction: banks.find((bank) => typeof bank?.direction === 'string')?.direction ?? 'rtl',
    title: title ?? banks.find((bank) => typeof bank?.title === 'string')?.title ?? 'Merged bank',
    licenseNote: 'Merged from the source banks. Each question keeps the licence of the bank it came from.',
    questions,
  };

  return {
    ok: errors.length === 0,
    bank: merged,
    questions,
    errors,
    stats: bankStats(merged),
  };
}
