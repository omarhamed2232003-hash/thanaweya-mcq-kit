# Where this stands

As of 28 November 2026. Version 0.28.6. **No tag, no release, no visibility change.**

## Verified, and how

- The suite passes locally and in CI on Node 20, 22 and 24 (CI run 46084537927 on commit d8294929). The CI log carries the count; this page does not restate it.
- `npm run validate` accepts the bank: 241 questions, 66 physics / 60 chemistry / 53 biology / 62 maths, every id unique.
- **Key audit** — a test recomputes the arithmetic in every explanation and checks that the value the explanation finishes on is the marked option. This is the check that caught real errors earlier in the project.
- **Documentation truth** — tests fail if a documentation link does not resolve, if an exported function is undocumented, or if any document restates a test count.
- **Visual** — the demo, a printed exam paper and the teacher packet were rendered and read as images, not just asserted by tests: the packet prints to 77 pages with the key highlighted, the Arabic letters أ/ب/ج/د correct and a sign-off line per chapter.

## Reviewed by a person

- Independent review rounds in November 2026: physics and chemistry, then biology and mathematics, then two follow-up rounds on the mathematics replacements. Every verdict was applied by question id and recorded in `docs/REVIEW_FINDINGS.md`, together with what each round did **not** cover.
- Those reviewers saw the marked key. That is why `npm run build:packet -- --blind --sample 20` exists.

## Not verified

- **No subject-teacher sign-off.** The bank is mechanically checked and independently reviewed; it has never been signed by a teacher of the subject. `docs/TEACHER_REVIEW.md` is the route to that, and it has not been run yet.
- **No Ministry of Education alignment** beyond one ATP figure in a biology question. Complex numbers, sequences and the 2D dot product are marked borderline for syllabus placement and that is undecided.
- Chapter names in the bank are English data keys, not translations; the teacher packet says so in its introduction.

## Cross-repo truth

The register row for this repository in the Central KB carries the same version, commit and CI run as this page. If the two disagree, the repository is right and the row is stale.

## Pending decisions

- **Tag and release are gated on Omar's review of the README and the release notes.** Nothing is tagged; no GitHub Release exists; visibility is unchanged.
- No npm publish unless Omar asks for it. A tag is not a publish.

## What this page is not

It is not a release announcement and it is not a quality claim. It is the shortest honest answer to "where does this actually stand", written so the reviewer does not have to reconstruct it from the changelog and the findings files.
