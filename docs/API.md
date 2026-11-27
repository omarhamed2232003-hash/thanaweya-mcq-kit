# API reference

Everything the package exports, in one page. Every name here is exported from `src/index.js`; anything not listed is internal and may change. `test/readme-covers-api.test.js` fails if an export is missing from this file.

## Building a session

```js
import { buildSession, filterQuestions, selectQuestions, mixTargets } from 'thanaweya-mcq-kit';
```

| Export | Signature | What it does |
|---|---|---|
| `buildSession` | `(bank, config = {})` | The one call most users need: filters, selects by the difficulty mix, shuffles options with a seeded generator and returns a session object. |
| `filterQuestions` | `(questions, filters = {})` | Keeps the questions that match `{ subjects, chapters, difficulties, grades, tags, ids }`. |
| `selectQuestions` | `(questions, config = {})` | Picks questions for a count and a mix; the step `buildSession` uses. |
| `mixTargets` | `(mix, count)` | How many questions each difficulty contributes for a count. Rounds the way the engine does, so you can predict a session before building it. |
| `shuffleOptions` | `(question, rng)` | Shuffles one question's options and moves its key with them. Takes an rng, so the shuffle is reproducible. |

## Grading

| Export | Signature | What it does |
|---|---|---|
| `gradeSession` | `(session, answers)` | Grades a whole session. `answers` is a map of id to selection, or an array in question order. Returns counts, a percentage and a per-question list. |
| `gradeAnswer` | `(question, selected)` | Grades one question: `answered`, `correct`, and the selected indices normalised to an array. |
| `formatSummary` | `(result, language = 'ar')` | One human-readable line for a result, in Arabic or English. |

## Sessions and storage

| Export | Signature | What it does |
|---|---|---|
| `serializeSession` | `(session)` | A plain object safe to `JSON.stringify`, carrying `SESSION_VERSION`. |
| `parseSession` | `(raw)` | Reads a serialised session; returns `null` for anything it cannot read, including a different `SESSION_VERSION`. |
| `SESSION_VERSION` | `1` | Bumped when the serialised shape changes. |

## Validation

| Export | Signature | What it does |
|---|---|---|
| `validateBank` | `(bank)` | Every problem at once: `{ ok, errors, questionCount }`. Use it before starting a session. |
| `validateQuestion` | `(question, index = 0)` | The same checks for one question. |
| `assertValidBank` | `(bank)` | Throws with every problem in the message; for scripts and tests. |
| `SCHEMA_VERSION` | `1` | The bank format version the validator expects. |
| `DIFFICULTIES` | `['easy', 'medium', 'hard', 'advanced']` | The difficulty values, in order. |
| `DIFFICULTY_LABELS` | `{ easy, medium, hard, advanced }` | Arabic and English labels for each difficulty. |

## Banks

| Export | Signature | What it does |
|---|---|---|
| `mergeBanks` | `(banks, options = {})` | Merges several banks, validating each and collecting every error. A duplicate id is an error unless `onDuplicateId: 'skip'`. |
| `bankStats` | `(bank)` | Counts by subject, difficulty, chapter and grade. |

## Randomness

| Export | Signature | What it does |
|---|---|---|
| `createRng` | `(seed)` | A seeded generator; the same seed gives the same sequence on every platform. |
| `mulberry32` | `(seed)` | The generator `createRng` wraps, if you want it directly. |
| `hashString` | `(input)` | Turns any text into the numeric seed `createRng` takes, so a seed can be a readable string. |

## Text

| Export | Signature | What it does |
|---|---|---|
| `t` | `(language, key)` | The shared UI string for a key. |
| `direction` | `(language)` | `'rtl'` or `'ltr'` for a language. |
| `STRINGS` | `{ ar, en }` | The string tables themselves. |

## Defaults

| Export | Signature | What it does |
|---|---|---|
| `DEFAULT_MIX` | `{ easy: 30, medium: 40, hard: 20, advanced: 10 }` | The default difficulty mix, in percent. |
