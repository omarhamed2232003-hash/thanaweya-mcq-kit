# Reviewer guide

This packet exists so a subject teacher can check the question bank without reading the code, and without re-doing the checks a machine already does.

## What is in the packet

- `review/questions-by-batch.md` — every question, grouped by the batch that introduced it. Each entry shows the id, subject and chapter, difficulty, the stem, the options with the marked answer as `[x]`, and the explanation.
- `review/batches.json` — the same grouping as data: batch number, commit, date, count and question ids. It is generated from the repository history, so a question's batch is a fact, not a guess.
- `docs/REVIEW_QUEUE.md` — the summary table, one row per batch, with what each batch has had so far.

## What has already been checked, mechanically

These run on every commit and do not need a reviewer's time:

- **Shape**: unique ids, at least two options, no duplicate options, the key inside the options range, multi-answer questions with two or more correct options and at least one wrong one.
- **Answer key against the explanation**: when the explanation finishes on a value and exactly one option carries that value, that option must be the marked answer. A key that points one option off is caught here.
- **Arithmetic**: the final arithmetic step an explanation shows must recompute (`15 ÷ 5 = 3` fails if it says 4).
- **Answer stated**: a numeric answer has to appear in its own explanation.
- **A second opinion**: the separate `mcq-bank-lint` tool runs against the bank with no suppressions today (`.mcq-lint-allow.json` is empty, and an entry there needs a written reason).

None of that can tell whether an explanation is scientifically right, whether a question is at the right level for the grade, or whether the wording is unambiguous. That is the reviewer's job.

## What a reviewer is asked to do

For each question, in this order:

1. **Answer it without looking at the key.** If your answer differs from `[x]`, that is a finding.
2. **Check the explanation**, not just the answer: is the reasoning correct, and would a student learn the right thing from it?
3. **Check the wording** for ambiguity: could a well-prepared student reasonably read the question a second way?
4. **Check the level**: is this grade 3 (ثانوية عامة) material, and is the difficulty label honest?
5. **Check the science against a current textbook** where the curriculum has changed. A question can be internally consistent and out of date.

Mark each question `ok`, `fix` or `drop`, with one line of reason for anything that is not `ok`. Batch-level comments are welcome too.

## How to report back

Send the id and the verdict. Ids are stable and unique, so `phy-ohm-010 fix: two options are defensible` is enough for the fix to be applied without hunting for the question.

If a whole batch needs rework, say so by batch number; the packet keeps batch membership explicit for exactly that.

## Scope and honesty notes

- All questions were written for this repository. They are not taken from any official exam, textbook or ministry material, and they are not presented as curriculum-aligned. The `licenseNote` in `data/sample-questions.json` says the same.
- The bank is a sample for a quiz engine, not a study plan. Volume was added quickly; the review is what turns it into something to trust.
- Numbers in questions are checked arithmetically, not against any external source, and the bank states that plainly where it matters (for example an ATP yield that depends on the textbook used).
