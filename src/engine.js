/**
 * Core quiz engine: selection, option shuffling, grading, summaries.
 *
 * The engine is pure. It never touches the DOM, storage or the network, so the
 * same code runs in the browser, in Node, and in tests.
 */

import { createRng } from './rng.js';
import { DIFFICULTIES, validateBank } from './schema.js';

/** Default difficulty mix (percent) used by the Thanaweya question bank. */
export const DEFAULT_MIX = { easy: 30, medium: 40, hard: 20, advanced: 10 };

export const SESSION_VERSION = 1;

/** Keep only the questions matching every filter that was provided. */
export function filterQuestions(questions, filters = {}) {
  const {
    subjects, grades, chapters, difficulties, tags, excludeIds,
  } = filters;

  const asSet = (value) => {
    if (value === undefined || value === null) return null;
    const list = Array.isArray(value) ? value : [value];
    return list.length ? new Set(list.map(String)) : null;
  };

  const subjectSet = asSet(subjects);
  const gradeSet = asSet(grades);
  const chapterSet = asSet(chapters);
  const difficultySet = asSet(difficulties);
  const tagSet = asSet(tags);
  const excluded = asSet(excludeIds);

  return questions.filter((question) => {
    if (excluded && excluded.has(String(question.id))) return false;
    if (subjectSet && !subjectSet.has(String(question.subject))) return false;
    if (gradeSet && !gradeSet.has(String(question.grade ?? ''))) return false;
    if (chapterSet && !chapterSet.has(String(question.chapter ?? ''))) return false;
    if (difficultySet && !difficultySet.has(String(question.difficulty))) return false;
    if (tagSet) {
      const questionTags = Array.isArray(question.tags) ? question.tags.map(String) : [];
      if (!questionTags.some((tag) => tagSet.has(tag))) return false;
    }
    return true;
  });
}

/** Normalize a mix object into integer targets that add up to `count`. */
export function mixTargets(mix, count) {
  const weights = { ...DEFAULT_MIX, ...(mix || {}) };
  const entries = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    weight: Math.max(0, Number(weights[difficulty]) || 0),
  }));
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight === 0 || count <= 0) {
    return Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, 0]));
  }

  const raw = entries.map((entry) => ({ ...entry, exact: (entry.weight / totalWeight) * count }));
  const targets = Object.fromEntries(raw.map((entry) => [entry.difficulty, Math.floor(entry.exact)]));
  let assigned = Object.values(targets).reduce((sum, value) => sum + value, 0);

  const byRemainder = [...raw].sort((a, b) => (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact)));
  let cursor = 0;
  while (assigned < count && byRemainder.length) {
    const entry = byRemainder[cursor % byRemainder.length];
    if (entry.weight > 0) {
      targets[entry.difficulty] += 1;
      assigned += 1;
    }
    cursor += 1;
    if (cursor > count * 4) break;
  }

  return targets;
}

/**
 * Pick questions for one session.
 *
 * Selection is deterministic for a given seed: the pool is shuffled, each
 * difficulty is filled up to its target, then any remaining slots are filled
 * from whatever is left. A subject with too few "advanced" questions therefore
 * still produces a full quiz instead of failing.
 */
export function selectQuestions(questions, config = {}) {
  const {
    count = 10,
    seed = 'default-seed',
    mix = DEFAULT_MIX,
    filters = {},
  } = config;

  const rng = createRng(seed);
  const pool = filterQuestions(questions, filters);
  const requested = Math.max(0, Math.min(Number(count) || 0, pool.length));
  const buckets = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, []]));

  for (const question of rng.shuffle(pool)) {
    const bucket = buckets[question.difficulty];
    if (bucket) bucket.push(question);
  }

  const targets = mixTargets(mix, requested);
  const selected = [];
  const leftovers = [];

  for (const difficulty of DIFFICULTIES) {
    const bucket = buckets[difficulty];
    const take = Math.min(targets[difficulty], bucket.length);
    selected.push(...bucket.slice(0, take));
    leftovers.push(...bucket.slice(take));
  }

  if (selected.length < requested) {
    selected.push(...rng.shuffle(leftovers).slice(0, requested - selected.length));
  }

  return {
    questions: rng.shuffle(selected),
    meta: {
      requested: Number(count) || 0,
      selected: selected.length,
      available: pool.length,
      truncated: selected.length < (Number(count) || 0),
      seed: rng.seed,
    },
  };
}

/** Shuffle a question's options and remap whichever answer field it uses. */
export function shuffleOptions(question, rng) {
  const order = rng.shuffle(question.options.map((_, index) => index));
  const options = order.map((index) => question.options[index]);
  const shuffled = { ...question, options, optionOrder: order };
  if (question.type === 'multi') {
    shuffled.answerIndices = [...(question.answerIndices ?? [])]
      .map((index) => order.indexOf(index))
      .sort((left, right) => left - right);
  } else {
    shuffled.answerIndex = order.indexOf(question.answerIndex);
  }
  return shuffled;
}

/**
 * Build a ready-to-play session.
 * @param {object} bank validated question bank
 * @param {object} config { count, seed, mix, filters, shuffleOptions }
 */
export function buildSession(bank, config = {}) {
  const validation = validateBank(bank);
  if (!validation.ok) {
    const detail = validation.errors.map((error) => `${error.path}: ${error.message}`).join('; ');
    throw new Error(`Cannot build a session from an invalid bank: ${detail}`);
  }

  const { questions, meta } = selectQuestions(bank.questions, config);
  const rng = createRng(`${config.seed ?? 'default-seed'}:options`);
  const shouldShuffleOptions = config.shuffleOptions !== false;

  const prepared = questions.map((question) => (shouldShuffleOptions
    ? shuffleOptions(question, rng)
    : { ...question, options: [...question.options], optionOrder: question.options.map((_, i) => i) }));

  return {
    schemaVersion: SESSION_VERSION,
    createdAt: new Date().toISOString(),
    seed: meta.seed,
    mix: { ...DEFAULT_MIX, ...(config.mix || {}) },
    filters: { ...(config.filters || {}) },
    questions: prepared,
    meta,
  };
}

/**
 * Grade a single answer.
 *
 * A "single" question takes one index (or null when skipped). A "multi"
 * question takes an array of indices and is correct only when the selected set
 * is exactly the correct set: no missing option and no extra one.
 */
export function gradeAnswer(question, selected) {
  if (question.type === 'multi') {
    const correctIndices = [...(question.answerIndices ?? [])].sort((left, right) => left - right);
    const correctSet = new Set(correctIndices);
    const picked = Array.isArray(selected) ? selected.filter((value) => Number.isInteger(value)) : [];
    const selectedIndices = [...new Set(picked)].sort((left, right) => left - right);
    const hits = selectedIndices.filter((index) => correctSet.has(index)).length;
    const misses = selectedIndices.length - hits;
    const answered = selectedIndices.length > 0;
    const correct = answered && misses === 0 && hits === correctSet.size;
    // Partial score rewards the options found and subtracts the wrong picks,
    // so ticking every option cannot earn credit. Range: 0 to 1.
    const raw = correctSet.size === 0 ? 0 : (hits - misses) / correctSet.size;
    return {
      id: question.id,
      type: 'multi',
      answered,
      correct,
      selectedIndices: answered ? selectedIndices : [],
      correctIndices,
      partialScore: Math.round(Math.max(0, Math.min(1, raw)) * 100) / 100,
      explanation: question.explanation,
    };
  }

  const answered = Number.isInteger(selected);
  return {
    id: question.id,
    type: 'single',
    answered,
    correct: answered && selected === question.answerIndex,
    selectedIndex: answered ? selected : null,
    correctIndex: question.answerIndex,
    explanation: question.explanation,
  };
}

/**
 * Grade a whole session.
 * @param {object} session from buildSession
 * @param {object|Array} answers map of question id -> selected index, or an array in question order
 */
export function gradeSession(session, answers) {
  const lookup = (id, index) => {
    if (Array.isArray(answers)) return answers[index];
    if (answers && typeof answers === 'object') return answers[id];
    return undefined;
  };

  const items = session.questions.map((question, index) => gradeAnswer(question, lookup(question.id, index)));
  const total = items.length;
  const correct = items.filter((item) => item.correct).length;
  const answered = items.filter((item) => item.answered).length;

  const emptyTally = () => ({ total: 0, correct: 0 });
  const byDifficulty = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, emptyTally()]));
  const bySubject = {};

  session.questions.forEach((question, index) => {
    const item = items[index];
    const difficulty = byDifficulty[question.difficulty] || (byDifficulty[question.difficulty] = emptyTally());
    difficulty.total += 1;
    if (item.correct) difficulty.correct += 1;

    const subject = bySubject[question.subject] || (bySubject[question.subject] = emptyTally());
    subject.total += 1;
    if (item.correct) subject.correct += 1;
  });

  return {
    total,
    answered,
    unanswered: total - answered,
    correct,
    wrong: answered - correct,
    scorePercent: total === 0 ? 0 : Math.round((correct / total) * 1000) / 10,
    byDifficulty,
    bySubject,
    items,
  };
}

/** Serialize a session so it can be resumed later (localStorage, URL, file). */
export function serializeSession(session) {
  return JSON.stringify(session);
}

/** Parse a stored session, rejecting anything that is not a session of this version. */
export function parseSession(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!parsed || parsed.schemaVersion !== SESSION_VERSION || !Array.isArray(parsed.questions)) {
    throw new Error('Stored session is not a supported session version.');
  }
  return parsed;
}

/** Human-readable summary line, in Arabic by default. */
export function formatSummary(result, language = 'ar') {
  const percent = Math.round(result.scorePercent);
  return language === 'en'
    ? `${result.correct} of ${result.total} correct (${percent}%)`
    : `${result.correct} من ${result.total} صحيح (${percent}٪)`;
}
