/**
 * Demo UI for thanaweya-mcq-kit.
 *
 * Plain ES modules and DOM APIs: no framework, no build step. The engine in
 * ../src does all the work; this file only renders it.
 */

import {
  buildSession, gradeSession, t, DIFFICULTY_LABELS, parseSession, serializeSession,
} from '../src/index.js';

const STORAGE_KEY = 'thanaweya-mcq-kit:session';
const SUBJECT_LABELS = {
  ar: { physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء' },
  en: { physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology' },
};

const state = {
  bank: null,
  language: 'ar',
  session: null,
  index: 0,
  answers: {},
  revealed: new Set(),
  result: null,
};

const el = (id) => document.getElementById(id);

function subjectLabel(subject) {
  const table = SUBJECT_LABELS[state.language] || SUBJECT_LABELS.ar;
  return table[subject] || subject;
}

function difficultyLabel(difficulty) {
  const label = DIFFICULTY_LABELS[difficulty];
  return label ? (label[state.language] || label.ar) : difficulty;
}

function persist() {
  if (!state.session || state.result) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    session: state.session,
    answers: state.answers,
    index: state.index,
    revealed: [...state.revealed],
    language: state.language,
  }));
}

function clearPersisted() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---------------------------------------------------------------- start screen */

function renderStart() {
  const subjects = [...new Set(state.bank.questions.map((question) => question.subject))];
  const subjectSelect = el('subject-select');
  subjectSelect.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = state.language === 'ar' ? 'كل المواد' : 'All subjects';
  subjectSelect.append(allOption);

  subjects.forEach((subject) => {
    const option = document.createElement('option');
    option.value = subject;
    const count = state.bank.questions.filter((question) => question.subject === subject).length;
    option.textContent = `${subjectLabel(subject)} (${count})`;
    subjectSelect.append(option);
  });

  const countSelect = el('count-select');
  countSelect.innerHTML = '';
  [5, 10, 15].filter((value) => value <= state.bank.questions.length).forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = String(value);
    countSelect.append(option);
  });
  const allCount = document.createElement('option');
  allCount.value = 'all';
  allCount.textContent = state.language === 'ar' ? `كل الأسئلة (${state.bank.questions.length})` : `All (${state.bank.questions.length})`;
  countSelect.append(allCount);
  countSelect.value = String(Math.min(10, state.bank.questions.length));

  const byDifficulty = {};
  state.bank.questions.forEach((question) => {
    byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] || 0) + 1;
  });
  el('bank-summary').textContent = state.language === 'ar'
    ? `${state.bank.questions.length} سؤالًا أصليًا · ${Object.entries(byDifficulty).map(([key, value]) => `${difficultyLabel(key)}: ${value}`).join(' · ')}`
    : `${state.bank.questions.length} original questions · ${Object.entries(byDifficulty).map(([key, value]) => `${difficultyLabel(key)}: ${value}`).join(' · ')}`;

  show('start');
}

/* ---------------------------------------------------------------- quiz screen */

function show(screen) {
  el('screen-start').classList.toggle('hidden', screen !== 'start');
  el('screen-quiz').classList.toggle('hidden', screen !== 'quiz');
  el('screen-result').classList.toggle('hidden', screen !== 'result');
}

function currentQuestion() {
  return state.session.questions[state.index];
}

function renderQuestion() {
  show('quiz');
  const question = currentQuestion();
  const total = state.session.questions.length;
  const position = state.index + 1;

  el('progress-label').textContent = state.language === 'ar'
    ? `${t(state.language, 'question')} ${position} ${t(state.language, 'of')} ${total}`
    : `${t(state.language, 'question')} ${position} ${t(state.language, 'of')} ${total}`;
  el('difficulty-badge').textContent = `${subjectLabel(question.subject)} · ${difficultyLabel(question.difficulty)}`;

  const percent = Math.round((state.index / total) * 100);
  const bar = el('progress-bar');
  bar.style.width = `${percent}%`;
  bar.parentElement.setAttribute('aria-valuenow', String(percent));

  el('question-stem').textContent = question.stem;

  const list = el('options-list');
  list.innerHTML = '';
  const answered = state.answers[question.id];
  const revealed = state.revealed.has(question.id);
  const isMulti = question.type === 'multi';
  const correctIndices = isMulti ? (question.answerIndices ?? []) : [question.answerIndex];
  const chosen = isMulti ? (Array.isArray(answered) ? answered : []) : answered;

  question.options.forEach((option, optionIndex) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.dataset.index = String(optionIndex);
    button.innerHTML = `<span class="key">${optionIndex + 1}</span><span>${escapeHtml(option)}</span>`;
    if (isMulti && !revealed) {
      button.setAttribute('aria-pressed', String(chosen.includes(optionIndex)));
      if (chosen.includes(optionIndex)) button.classList.add('chosen');
    }
    if (revealed) {
      button.disabled = true;
      if (correctIndices.includes(optionIndex)) button.classList.add('correct');
      else if (Array.isArray(chosen) ? chosen.includes(optionIndex) : optionIndex === chosen) button.classList.add('wrong');
    }
    button.addEventListener('click', () => selectOption(optionIndex));
    item.append(button);
    list.append(item);
  });

  const feedback = el('feedback');
  if (revealed) {
    feedback.classList.remove('hidden');
    const isCorrect = isMulti
      ? chosen.length === correctIndices.length && correctIndices.every((index) => chosen.includes(index))
      : answered === question.answerIndex;
    const verdict = el('feedback-verdict');
    verdict.textContent = isCorrect ? t(state.language, 'correct') : t(state.language, 'wrong');
    verdict.className = `verdict ${isCorrect ? 'correct' : 'wrong'}`;
    const answerText = correctIndices.map((index) => question.options[index]).join(' / ');
    el('feedback-answer').textContent = `${t(state.language, 'correctAnswerIs')}: ${answerText}`;
    el('feedback-explanation').textContent = `${t(state.language, 'explanation')}: ${question.explanation}`;
    el('next-btn').disabled = false;
  } else {
    feedback.classList.add('hidden');
    // A multi-answer question needs at least one ticked option before moving on.
    el('next-btn').disabled = isMulti ? chosen.length === 0 : true;
  }

  const isLast = state.index === total - 1;
  el('next-btn').textContent = isLast ? t(state.language, 'finish') : t(state.language, 'next');
  el('skip-btn').classList.toggle('hidden', revealed);
  persist();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function selectOption(optionIndex) {
  const question = currentQuestion();
  if (state.revealed.has(question.id)) return;
  if (question.type === 'multi') {
    const current = Array.isArray(state.answers[question.id]) ? [...state.answers[question.id]] : [];
    const at = current.indexOf(optionIndex);
    if (at === -1) current.push(optionIndex);
    else current.splice(at, 1);
    state.answers[question.id] = current.sort((left, right) => left - right);
    renderQuestion();
    return;
  }
  state.answers[question.id] = optionIndex;
  state.revealed.add(question.id);
  renderQuestion();
}

function nextQuestion() {
  if (state.index >= state.session.questions.length - 1) {
    finish();
    return;
  }
  state.index += 1;
  renderQuestion();
}

function skipQuestion() {
  const question = currentQuestion();
  state.revealed.add(question.id);
  renderQuestion();
}

/* -------------------------------------------------------------- result screen */

function finish() {
  state.result = gradeSession(state.session, state.answers);
  clearPersisted();
  renderResult();
}

function renderResult() {
  show('result');
  const result = state.result;
  el('score-value').textContent = `${Math.round(result.scorePercent)}%`;
  el('score-ring').style.setProperty('--score', String(result.scorePercent));
  el('score-line').textContent = state.language === 'ar'
    ? `${result.correct} من ${result.total} إجابة صحيحة · ${result.unanswered} بدون إجابة`
    : `${result.correct} of ${result.total} correct · ${result.unanswered} unanswered`;

  const breakdown = el('breakdown');
  breakdown.innerHTML = '';
  Object.entries(result.byDifficulty)
    .filter(([, tally]) => tally.total > 0)
    .forEach(([difficulty, tally]) => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `<span>${difficultyLabel(difficulty)}</span><span>${tally.correct} / ${tally.total}</span>`;
      breakdown.append(row);
    });

  const review = el('review-list');
  review.innerHTML = '';
  state.session.questions.forEach((question, index) => {
    const item = result.items[index];
    const li = document.createElement('li');
    const tag = document.createElement('span');
    tag.className = `tag ${item.correct ? 'ok' : 'no'}`;
    tag.textContent = item.answered ? (item.correct ? '✓' : '✕') : '—';
    li.append(document.createTextNode(`${index + 1}. ${question.stem} `));
    li.append(tag);
    const why = document.createElement('span');
    why.className = 'why';
    const answersText = (item.correctIndices ?? [item.correctIndex])
      .map((index) => question.options[index])
      .join(' / ');
    why.textContent = item.answered
      ? `${t(state.language, 'correctAnswerIs')}: ${answersText} — ${question.explanation}`
      : `${t(state.language, 'unanswered')} — ${t(state.language, 'correctAnswerIs')}: ${answersText}`;
    li.append(why);
    review.append(li);
  });
}

/* ------------------------------------------------------------------ language */

function applyLanguage() {
  const dir = state.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = state.language;
  document.documentElement.dir = dir;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(state.language, node.dataset.i18n);
  });
  el('lang-toggle').textContent = state.language === 'ar' ? 'EN' : 'ع';
}

/* -------------------------------------------------------------------- wiring */

function startQuiz(event) {
  event?.preventDefault();
  const subject = el('subject-select').value;
  const countValue = el('count-select').value;
  const count = countValue === 'all' ? state.bank.questions.length : Number(countValue);

  const uiBank = state.bank;

  if (uiBank.questions.length === 0) {
    // Nothing to ask: say so instead of building an empty session and crashing
    // on the first render.
    el('bank-summary').textContent = state.language === 'ar'
      ? 'لا توجد أسئلة متاحة بهذه الاختيارات.'
      : 'No questions match these choices.';
    return;
  }

  state.session = buildSession(uiBank, {
    count,
    seed: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filters: subject ? { subjects: [subject] } : {},
    shuffleOptions: el('shuffle-options').checked,
  });
  state.index = 0;
  state.answers = {};
  state.revealed = new Set();
  state.result = null;
  renderQuestion();
}

function resumeIfSaved() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    state.session = parseSession(serializeSession(saved.session));
    state.answers = saved.answers || {};
    state.index = Math.min(saved.index || 0, state.session.questions.length - 1);
    state.revealed = new Set(saved.revealed || []);
    if (saved.language) state.language = saved.language;
    return true;
  } catch (error) {
    clearPersisted();
    return false;
  }
}

async function boot() {
  const response = await fetch('../data/sample-questions.json');
  state.bank = await response.json();
  applyLanguage();

  el('start-form').addEventListener('submit', startQuiz);
  el('next-btn').addEventListener('click', nextQuestion);
  el('skip-btn').addEventListener('click', skipQuestion);
  el('retry-btn').addEventListener('click', () => {
    state.result = null;
    renderStart();
  });
  el('lang-toggle').addEventListener('click', () => {
    state.language = state.language === 'ar' ? 'en' : 'ar';
    applyLanguage();
    if (state.result) renderResult();
    else if (state.session) renderQuestion();
    else renderStart();
  });

  document.addEventListener('keydown', (event) => {
    if (el('screen-quiz').classList.contains('hidden')) return;
    const question = currentQuestion();
    if (/^[1-9]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      if (index < question.options.length) selectOption(index);
    } else if (event.key === 'Enter' && state.revealed.has(question.id)) {
      nextQuestion();
    }
  });

  if (resumeIfSaved()) {
    applyLanguage();
    renderQuestion();
  } else {
    renderStart();
  }
}

boot().catch((error) => {
  document.querySelector('.app-main').innerHTML = `<section class="card"><h2>تعذر تحميل البيانات</h2><p class="muted">${escapeHtml(error.message)}</p><p class="muted small">شغّل الصفحة من خلال خادم محلي: <code>npm run serve</code> ثم افتح <code>http://localhost:8080/ui/</code>.</p></section>`;
});
