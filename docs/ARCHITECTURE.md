# How the kit fits together

One reading pass for someone who has just opened the repository. Nothing here is required to use the kit; it is the map for changing it.

## The layers

```
data/sample-questions.json   the bank: { schemaVersion, language, direction, questions[] }
        |
   src/schema.js   validates a bank and reports every problem at once
        |
   src/bank.js     filters, merges and summarises banks
        |
   src/engine.js   builds a session, shuffles, grades, serialises
        |
   ui/quiz.js      the demo UI: renders a session, nothing else
```

`src/rng.js` is the only source of randomness: a seeded generator, so the same seed produces the same paper, the same option order and the same session. `src/i18n.js` holds the Arabic and English strings the UI and the engine share. `src/index.js` re-exports the public surface; anything not exported there is internal and can change.

## What each module owns

| Module | Owns | Does not own |
|---|---|---|
| `schema.js` | question shape, id uniqueness, option and key rules | whether a question is scientifically right |
| `bank.js` | filtering by subject/chapter/difficulty, merging banks, bank statistics | session state |
| `engine.js` | selection, seeded shuffling, grading, serialisation | rendering, storage |
| `ui/quiz.js` | DOM, events, screen state | selection or grading logic |

The split matters because the engine is the part other projects depend on: `mcq-exam-paper` reads the bank format and does its own selection, and `mcq-bank-lint` reads the same format to audit keys. Changing the bank format is a cross-repository change; changing the UI is not.

## Data flow of one quiz

1. The UI loads `data/sample-questions.json` and calls `validateBank`. A bank with any error is refused before a session exists.
2. `startQuiz` reads the controls, builds a filter, and calls `buildSession` with a seed derived from the clock plus a random suffix.
3. `buildSession` filters, selects by the difficulty mix, shuffles options per question with the seeded generator, and returns a session object with a `questions[]` array where each question carries its shuffled options and its key in the shuffled space.
4. The UI renders one question at a time. Single-answer questions lock on the first click; multi-answer questions toggle.
5. `gradeSession` compares answers to keys and returns counts and a percentage. The UI shows the review list from the same session object, so the review cannot disagree with the grade.
6. `serializeSession` and `deserializeSession` round-trip a session, so a quiz can be stored and resumed.

## Tests

- `test/engine.test.js` — selection, seeded reproducibility, grading, serialisation.
- `test/answers.test.js` — the answer-key audit over the real bank, with documented whitelist entries.
- `test/schema.test.js`, `test/bank.test.js` — validation and bank utilities.
- `test/review-packet.test.js` — the reviewer packet (`review/`) cannot drift from the bank.

Run `npm test` and `npm run validate`. The linter cross-check in `CONTRIBUTING.md` is a separate tool and a separate run.

## Where the content rules live

- `docs/QUESTION_AUTHORING.md` — how to write a question and what the audit checks.
- `docs/REVIEW_QUEUE.md` — which batches are mechanically checked and which have had a subject review.
- `docs/REVIEW_FINDINGS.md` — what the reviewers found, what was changed, and what is still unverified.
- `review/` — the packet a reviewer reads.

Content and code are reviewed differently on purpose: the tests can prove a key agrees with its explanation, and no test can prove the explanation is right.
