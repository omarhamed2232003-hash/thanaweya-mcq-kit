# Release checklist — thanaweya-mcq-kit

This repository has content as well as code, so it has one gate the others do not.

## Before the tag

- [ ] **Omar reads the README and these release notes.** His 5:44 condition: nothing is tagged or released before he has read both.
- [ ] `package.json` version, `CHANGELOG.md` top entry and the tag name agree.
- [ ] CI is green on the default branch (`test.yml`, Node 20 and 22).
- [ ] `npm test` passes locally on a clean clone.
- [ ] A read-through for personal data, secrets, API keys and copied or third-party content. Nothing of that kind ships: no author names, no addresses, no tokens, no scraped text.
- [ ] The scope statement below is still true, and the release notes say what the project does *not* do.
- [ ] No repository transfer, no visibility change, no GitHub Release draft. The Amberline move waits on Omar's per-repo approval.

## At the tag

- [ ] Annotated tag `vX.Y.Z` on the reviewed commit, message `vX.Y.Z: <one line>`.
- [ ] Release body is the text of `docs/RELEASE_NOTES_DRAFT.md` at that commit, unchanged except for the version.
- [ ] Check the published page once after creating it: title, tag, body, and that no attachment or asset was added by accident.

## After the tag

- [ ] No npm publish unless Omar asks for it. A tag is not a publish.
- [ ] Record the tag, the release URL and the CI run in the Central KB row.

## Specific to this repository

- [ ] **Subject-teacher sign-off on the content.** Independent reviews (science and wording, then maths in three rounds) have been done, and the reviewer derived keys independently in the last round, but no teacher who teaches Thanaweya Amma has signed the bank off. Either get that sign-off, or the release notes must say plainly that it is missing — they currently do.
- [ ] The 241 questions are the reviewed set: `docs/REVIEW_FINDINGS.md` lists every replaced id, every fix and the round-3 label corrections, and the reviewer packet hash is pinned by a test.
- [ ] The borderline syllabus placements (complex numbers, sequences, the 2D dot product) are either decided by Omar or still marked borderline in the docs. They are currently marked.
- [ ] The "no textbook alignment beyond the ATP case" limit is in the release notes. It is.
- [ ] The version in `package.json`, the top `CHANGELOG.md` entry and the tag agree, and `npm run validate` reports 241 questions.
