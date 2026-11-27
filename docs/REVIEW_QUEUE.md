# Review status of every batch

> Status as of 27 November 2026, evening. The verdicts and every changed id are in `docs/REVIEW_FINDINGS.md`.

The answer-key audit in `npm test` is mechanical: it checks that each marked answer agrees with the question's own explanation, that the arithmetic in the explanation recomputes, and that no two options are the same. It cannot tell whether an explanation is scientifically right. That is what the reviews below were for, and what a subject teacher still has to do.

## What has happened

| Batch | Added in | Questions | Mechanical | Independent review |
|---|---|---|---|---|
| First set | 0.1.0 – 0.7.0 | 130 | answer-key audit, keys hand-read, arithmetic recomputed | reviewed 27 Nov (physics+chemistry and biology+maths passes) |
| Second | 0.9.0 | 35 | answer-key audit | reviewed 27 Nov |
| Third | 0.10.0 | 23 | answer-key audit; one explanation rewritten after the audit flagged it | reviewed 27 Nov |
| Multi-answer set | 0.11.0 | 4 | answer-key audit, multi-type tests | reviewed 27 Nov |
| Fourth | 0.12.0 | 20 | answer-key audit | reviewed 27 Nov |
| Fifth | 0.13.0 | 15 | answer-key audit | reviewed 27 Nov |
| Sixth | 0.15.0 | 24 | answer-key audit, cross-checked with `mcq-bank-lint` | reviewed 27 Nov |
| Seventh | 0.16.0 | 16 | answer-key audit, cross-checked with `mcq-bank-lint` | reviewed 27 Nov |
| Eighth | 0.17.0 | 16 | answer-key audit, cross-checked with `mcq-bank-lint` | reviewed 27 Nov |
| Maths replacement | 0.21.0 | 43 new maths questions | answer-key audit | reviewed twice: round 1 (15 pass, 14 fix, 14 fail) and round 2 on the 14 calculus replacements (14 pass, keys derived independently) |

The reviews produced 253 passes, 30 fixes and 0 wrong keys on the first pass; 53 near-duplicate questions were dropped (the earliest in each cluster was kept), 8 questions were rewritten, and 5 difficulty labels were corrected. The bank is 241 questions: 66 physics, 60 chemistry, 53 biology, 62 maths.

## What the reviews did not do

- **No subject-teacher sign-off.** The reviewers worked the answers out, which is the strongest check so far, but no teacher who teaches Thanaweya Amma has signed the bank off.
- **No Ministry of Education textbook check**, beyond the ATP figure in one biology question, which was changed to follow the textbook.
- The syllabus placement of complex numbers, sequences and the 2D dot product is a decision recorded in `docs/REVIEW_FINDINGS.md`, not a finding.
- In rounds 1 and 2 the reviewer saw the marked key while reading. In round 3 the keys were derived independently.

## What a reviewer is asked to do

1. Read each stem and ask whether exactly the marked option (or options) answer it.
2. For numeric questions, recompute without looking at the explanation.
3. For biology and chemistry, check the wording against a current textbook: a question can be internally consistent and still be out of date.
4. Record the reviewer's name, date and any corrections in `docs/REVIEW_FINDINGS.md`.

A reviewer pass is a person's judgement, not a test result. Do not describe the bank as reviewed by a teacher until a teacher has read it.

## The reviewer packet

Everything a reviewer needs is in `review/`:

- `review/questions-by-batch.md` — every question grouped by the batch that introduced it, with the key marked and the explanation under it;
- `review/batches.json` — the same grouping as data (batch, commit, date, ids), generated from the repository history;
- `review/REVIEWER_GUIDE.md` — what is already checked mechanically, what a reviewer is asked to do, and how to report back.

`test/review-packet.test.js` fails if the packet and the bank drift apart, so the packet cannot silently go stale.
