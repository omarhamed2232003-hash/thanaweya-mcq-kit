# Batches waiting for an independent review

> 27 Nov 2026: the physics+chemistry and biology+maths reviews are in and applied. See `docs/REVIEW_FINDINGS.md` for the counts, the 53 dropped duplicates, the 8 rewrites and the 43 maths questions still to decide on. The table below records which batches those verdicts covered.

The answer-key audit in `npm test` is mechanical: it checks that each marked answer agrees with the question's own explanation, that the arithmetic in the explanation recomputes, and that no two options are the same. It cannot tell whether an explanation is scientifically right.

This file lists the question batches that have only had the mechanical pass. Each needs a subject reviewer before the repository is tagged or released.

| Batch | Added in | Questions | Mechanical check | Needs |
|---|---|---|---|---|
| First 130 | 0.1.0-0.7.0 | 130 (36 physics, 35 chemistry, 32 biology, 27 maths) | answer-key audit, hand-read keys, arithmetic recomputed | subject review |
| Second batch | 0.9.0 | 35 (7 physics, 8 chemistry, 8 biology, 12 maths) | answer-key audit | subject review |
| Third batch | 0.10.0 | 23 (6 physics, 6 chemistry, 7 biology, 4 maths) | answer-key audit; one explanation rewritten after the audit flagged it | subject review |
| Multi-answer batch | 0.11.0 | 4 multi-answer questions (physics, chemistry, biology, maths) | answer-key audit, multi-type tests | subject review |
| Fifth batch | 0.13.0 | 15 (4 physics, 4 chemistry, 4 biology, 3 maths) | answer-key audit | subject review |
| Eighth batch | 0.17.0 | 16 (4 physics, 4 chemistry, 4 biology, 4 maths; 3 multi-answer) | answer-key audit, cross-checked with mcq-bank-lint | subject review |
| Seventh batch | 0.16.0 | 16 (4 physics, 4 chemistry, 4 biology, 4 maths; 4 multi-answer) | answer-key audit, cross-checked with mcq-bank-lint | subject review |
| Sixth batch | 0.15.0 | 24 (8 physics, 6 chemistry, 5 biology, 5 maths; 7 multi-answer) | answer-key audit, cross-checked with mcq-bank-lint | subject review |
| Fourth batch | 0.12.0 | 20 (5 physics, 5 chemistry, 5 biology, 5 maths) | answer-key audit | subject review; one ATP question (bio-resp-004) states "about 30", which depends on the textbook used |

How to review a batch:

1. Read each stem and ask whether exactly the marked option(s) answer it.
2. For numeric questions, recompute without looking at the explanation.
3. For biology and chemistry, check the wording against a current textbook: a question can be internally consistent and still be out of date.
4. Record the reviewer's name, date and any corrections in this file.

A reviewer pass is a person's judgement, not a test result. Do not describe a batch as reviewed until someone has actually read it.

## The reviewer packet

Everything a reviewer needs is in `review/`:

- `review/questions-by-batch.md` — every question grouped by the batch that introduced it, with the key marked and the explanation under it;
- `review/batches.json` — the same grouping as data (batch, commit, date, ids), generated from the repository history;
- `review/REVIEWER_GUIDE.md` — what has already been checked mechanically, what a reviewer is asked to do, and how to report back.

`test/review-packet.test.js` fails if the packet and the bank drift apart, so the packet cannot silently go stale.
