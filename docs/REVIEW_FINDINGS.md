# Review findings, applied

Two independent reviewers read the bank on 27 November 2026, one for physics and chemistry (148 questions) and one for biology and maths (135 questions). Neither found a wrong answer key. Their verdicts are applied here, by id.

## Counts

| | Physics + chemistry | Biology + maths | Total |
|---|---|---|---|
| Read | 148 | 135 | 283 |
| Pass | 121 | 132 | 253 |
| Fix requested | 27 | 3 | 30 |
| Wrong key | 0 | 0 | 0 |

After applying: **283 questions -> 230**. 53 near-duplicates dropped, 8 questions rewritten, 4 difficulty labels corrected, 1 id corrected.

## Near-duplicates dropped (53)

The reviewers flagged clusters of near-identical questions (36 g of water asked three times, 6 ohm in parallel with 3 ohm four times, sin 30 three times, coin toss three times, B cells three times, mitochondria four times, osmosis three times). In each cluster the earliest question was kept and the later copies were removed, which is the rule the physics reviewer asked for.

bio-cell-001, bio-cell-004, bio-cell-005, bio-cell-006, bio-cell-008, bio-dna-003, bio-eco-003, bio-enzyme-003, bio-genetics-008, bio-hormone-002, bio-immunity-003, bio-immunity-004, bio-mitosis-002, bio-osmosis-002, bio-photo-006, bio-photo-007, bio-photo-011, bio-resp-003, chem-acid-005, chem-bond-001, chem-bond-005, chem-bond-006, chem-conc-005, chem-mole-001, chem-mole-008, chem-mole-010, chem-mole-013, chem-mole-016, chem-organic-003, chem-ph-004, math-alg-008, math-alg-009, math-calc-008, math-geom-007, math-geom-010, math-log-004, math-num-007, math-prob-002, math-prob-004, math-stat-006, math-trig-004, math-trig-007, math-trig-008, phy-accel-001, phy-elec-002, phy-elec-010, phy-energy-002, phy-energy-009, phy-momentum-001, phy-ohm-008, phy-ohm-010, phy-wave-006, phy-wave-008

The same list is in `review/batches.json` under `removedByReview`.

## Questions rewritten (8)

| id | What changed |
|---|---|
| `chem-mole-002` | "molecules in any substance" -> "molecules in 0.5 mol of water": ionic and metallic substances have no molecules |
| `chem-mole-015` | "molecules in one mole of any substance" -> "particles (molecules, ions or atoms)", with the explanation saying why |
| `chem-ph-002` | the pH 9 answer reworded to "a weakly alkaline medium", and the explanation now separates the strength of the medium from the strength of the base |
| `phy-heat-004` | the stem asks for the main method in liquids and gases; the melting distractor is replaced by radiation, and the explanation says conduction and radiation also occur there |
| `phy-multi-003` | the overlapping "increase its speed" / "double its speed" pair is replaced: options are now increase mass, double speed, raise it, reduce mass, with key mass + double speed |
| `bio-enzyme-018` | "تفسخ" replaced by the correct term for denaturation, and relabelled easy |
| `bio-resp-005` | aligned to the Egyptian textbook figure: "about 36 to 38 ATP" is now the key, and the explanation records that international sources say 30 to 32 |
| `phy-series-004` | renamed phy-parallel-004: the question is about parallel resistors, not a series |

## Difficulty labels corrected (4)

`chem-oxidation-013` (advanced to easy, it is recall), `phy-kin-006` (hard to easy, one-step formula), `chem-mole-003` (hard to easy, one-step), `bio-enzyme-018` (hard to easy).

## Maths level: 43 questions flagged, not deleted

The maths reviewer judged 43 questions to be prep-stage level rather than Thanaweya Amma. They are kept, not deleted, and listed here so the decision stays explicit:

math-alg-001, math-trig-001, math-geom-001, math-stat-001, math-alg-003, math-geom-002, math-prob-001, math-alg-004, math-trig-002, math-alg-005, math-geom-003, math-stat-002, math-alg-006, math-geom-004, math-stat-003, math-trig-003, math-alg-007, math-geom-005, math-stat-004, math-alg-008, math-geom-006, math-trig-004, math-stat-005, math-prob-002, math-geom-007, math-alg-009, math-alg-010, math-trig-005, math-stat-006, math-prob-003, math-multi-001, math-alg-011, math-geom-008, math-trig-006, math-stat-007, math-alg-012, math-geom-009, math-trig-007, math-num-007, math-geom-010, math-trig-008, math-prob-004, math-stat-008

The next step is a decision, not a quiet edit: either relabel them with a `grade` that matches their level, or replace them with Thanaweya-level items. That decision is Omar's.

## What the review did not cover

- **Book alignment is unverified.** Neither reviewer checked against Ministry of Education textbooks; `bio-resp-005` was the one place where a textbook figure was known to differ, and it now follows the book. Treat the rest as reviewed for science and wording, not for curriculum alignment.
- Neither reviewer read the code, the engine or the demo UI.
- The reviewers worked from the packet (`review/questions-by-batch.md`), so a question dropped before they read it was never seen by them; there were none.

## Maths replacement (27 November, evening)

Omar decided the 43 flagged maths questions should be replaced rather than relabelled.

- Of the 43 flagged ids, 11 had already been dropped in the duplicate pass above, so 32 were still in the bank.
- Those 32 were removed and replaced with 43 new Thanaweya Amma-level maths questions (limits, derivatives and their applications, integration, complex numbers, sequences and series, logarithms and exponentials, trigonometric identities and equations, vectors, solid geometry, probability and statistics).
- The bank is now **241 questions**, 62 of them maths.
- The new questions carry new ids (batch 15 in `review/batches.json`) rather than reusing the old ones, so nothing in this document is ambiguous about which question a verdict referred to.

Replaced ids:

math-alg-001, math-alg-003, math-alg-004, math-alg-005, math-alg-006, math-alg-007, math-alg-008, math-alg-009, math-alg-010, math-alg-011, math-alg-012, math-geom-001, math-geom-002, math-geom-003, math-geom-004, math-geom-005, math-geom-006, math-geom-007, math-geom-008, math-geom-009, math-geom-010, math-multi-001, math-num-007, math-prob-001, math-prob-002, math-prob-003, math-prob-004, math-stat-001, math-stat-002, math-stat-003, math-stat-004, math-stat-005, math-stat-006, math-stat-007, math-stat-008, math-trig-001, math-trig-002, math-trig-003, math-trig-004, math-trig-005, math-trig-006, math-trig-007, math-trig-008

The 43 new questions have had the mechanical checks only (shape, key against explanation, arithmetic, answer stated, the external linter). They need an independent subject review before they count as reviewed, and that review is arranged separately.

## Maths review, round 2 (27 November, evening)

The 43 replacement questions were reviewed independently: **15 pass, 14 fix, 14 fail**, no wrong keys. The failures were level failures, not correctness failures: items a prep or first-secondary student could answer.

### The 14 failed items were replaced

math-cplx-001, math-deriv-008, math-limit-005, math-logx-001, math-logx-002, math-logx-003, math-prob2-001, math-series-004, math-solid-001, math-stat2-001, math-trigo-001, math-trigo-003, math-trigo-005, math-vec-001

They are replaced by 14 calculus questions at medium or hard level (chain rule, quotient rule, tangent line, optimisation, stationary points, substitution integrals, a definite integral by substitution, two areas under a curve, and two limits needing rationalising or a double-angle identity). New ids again (`math-deriv-009` to `math-integ-011`, `math-limit-006`, `math-limit-007`), so no verdict is ambiguous. The bank stays at **241 questions**.

### The 14 fix items were fixed

- `math-limit-001` was a near-duplicate of `math-limit-005` (same factor-and-cancel template), so it now asks for the limit of `(س³ − 8) ÷ (س − 2)`, a different factorisation.
- `math-limit-004` and `math-integ-006` were labelled hard and are standard items: both are now medium.
- `math-appl-003` had an implausible option ("not defined"); it now offers "has a minimum at every point" instead.
- `math-series-002` had a weak distractor ("infinite"); it is now 12.
- `math-series-003` and `math-trigo-002` were too basic for the grade and are now labelled medium.
- `math-trigo-004` stays as is: "smallest positive solution" is correct even though 150° also solves the equation, and it is labelled medium.

### Placement marked borderline, not silently kept

The reviewer judged these topics to sit earlier in the syllabus. They are kept, and marked borderline here rather than pretended to be certain: `math-cplx-002`, `math-cplx-003`, `math-cplx-004` (complex numbers, largely second secondary), `math-series-001` (sequences), `math-vec-002` (2D dot product, second secondary). If the placement is wrong, the fix is to move them to the grade that matches, not to delete them.

### What this review still does not cover

- The reviewer saw the marked key while reading. That makes a wrong key less likely to slip through the key check and more likely to be anchored on the key while reading the explanation. A subject-teacher sign-off is still needed before release, and that is now stated in the packet too.
- Textbook alignment remains unchecked beyond the ATP case in biology.

## Maths review, round 3 (27 November, evening)

The 14 calculus replacements were reviewed independently: **14 pass, 0 fix, 0 fail**, and the reviewer derived each key independently rather than checking it against the marked one.

Label corrections applied:

| id | Was | Now | Why |
|---|---|---|---|
| `math-deriv-009` | medium | easy | single chain-rule step |
| `math-deriv-011` | medium | easy | single chain-rule step |
| `math-integ-009` | medium | easy | one definite integral of a power |
| `math-integ-010` | hard | medium | substitution, but a standard one |
| `math-integ-011` | hard | medium | area between a parabola and the axis |

### What this review does not establish

- **Independent derivation is not a teacher sign-off.** The reviewer worked the answers out rather than trusting the key, which is the strongest check so far, but the questions still have not been signed off by a subject teacher who teaches the curriculum.
- **No Ministry of Education textbook check.** Nothing here is confirmed against the current textbook, beyond the ATP case in biology, which follows the book.
- The borderline placement of complex numbers, sequences and the 2D dot product is still a decision, not a finding.
