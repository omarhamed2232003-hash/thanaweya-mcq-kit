# Release notes — draft for Omar to read

**Status: DRAFT. Not published. Nothing is tagged.**

## What this is

An Arabic-first (RTL) multiple-choice quiz engine with no dependencies, plus 241 original sample questions in physics, chemistry, biology and maths. It builds a quiz session, shuffles options reproducibly from a seed, mixes difficulty, grades with a per-question explanation, and serialises a session so it can be resumed. A vanilla RTL demo UI ships with it.

## What is in it

- **Engine** — seeded selection, difficulty mix (30/40/20/10 by default), option shuffling, grading for single-answer and multi-answer questions, session save and resume.
- **Bank schema and validation** — a JSON format with a validator that reports every problem at once rather than the first.
- **241 original questions** — 66 physics, 60 chemistry, 53 biology, 62 maths, each with a worked explanation, written for this repository. No copied exam or textbook content, and nothing presented as official material.
- **Answer-key audit** — a test that recomputes the arithmetic in every explanation and checks that the value the explanation finishes on is the marked option.
- **Reviewer packet** — `review/` groups every question by the batch that introduced it, with a guide saying what is checked mechanically and what a human is asked to do.
- **Docs** — authoring rules, architecture, review findings, review queue.

## What it does not do

- It is not curriculum-aligned, and the sample content is not official material.
- The content has been through mechanical checks and independent reviews, but **not a subject-teacher sign-off**, and not a Ministry of Education textbook check beyond the ATP figure in one biology question.
- The demo UI is a demonstration, not a product: no accounts, no storage, no analytics.
- No Arabic bidi heuristic is shipped; mixed Arabic/Latin stems are the author's job (documented in the authoring guide).

## Install and run

```bash
git clone https://github.com/omarhamed2232003-hash/thanaweya-mcq-kit.git
cd thanaweya-mcq-kit
npm test          # 53 tests
npm run validate  # 241 questions
npm run serve     # the demo
```

MIT licensed. Node 20 or newer.

## For the published body

Replace this paragraph with the version and date, and keep the "what it does not do" section as it stands. It is the honest part, and it is the part a teacher will check first.
