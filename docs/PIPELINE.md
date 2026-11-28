# How the tools fit together

Four small repositories, one job each. This page shows how they compose, so you do not have to read all four READMEs to get a working pipeline.

```
 write questions        audit keys           see what changed        print a paper
 ───────────────►  bank.json  ──►  mcq-bank-lint  ──►  mcq-bank-diff  ──►  mcq-exam-paper
                        │                                                        │
                        └──────────────►  thanaweya-mcq-kit  ◄───────────────────┘
                                          (plays the same bank)
```

## 1. Author against the schema

`schema/question.schema.json` lets an editor complete fields while you type; `npm run validate` is the check that matters, because it enforces the rules a schema cannot express.

## 2. Audit the keys before anyone reads them

```bash
npx mcq-bank-lint data/sample-questions.json --max-warnings 0
```

This proves each key agrees with its own explanation. It does not prove the explanation is right; that is what a reviewer is for.

## 3. See what a change actually did

```bash
npx mcq-bank-diff bank-before.json bank-after.json --format markdown --exit-code
```

A key that moved one option over is the change this catches, and it is the change a human reader misses. In CI, `--exit-code` fails the build on any change; in a pull request, `--format markdown` gives you the comment.

## 4. Print a paper from the same bank

```bash
npx mcq-exam-paper data/sample-questions.json --out paper.html \
  --count 25 --seed "midterm-1" --subject physics --cover --key-csv key.csv
```

The same seed rebuilds the same paper, and the key CSV comes from the same build, so the two cannot drift apart.

## 5. Put it in front of a teacher

```bash
npm run build:packet                        # everything, key visible
npm run build:packet -- --blind --sample 20  # twenty questions, no key, key on the last page
```

Steps 1 to 4 are mechanical: they can be wrong together and still agree with each other. The packet is the step that asks a person. The first version lets a teacher read the marked key and mark what is wrong; the blind version makes them answer before they see it, which is the only way to learn whether the key is reachable from the question alone.

Until a teacher signs a chapter, the honest status of the content is "mechanically checked", not "reviewed". `docs/TEACHER_REVIEW.md` is the session, `STATUS.md` is where the project currently stands.

## 6. Play the same bank in the browser

`npm run serve` in this repository opens the demo UI over the same file. The engine, the paper builder and the linter all read one format, which is the point: a question added once is usable everywhere.

## Where each tool stops

| Tool | Does | Does not |
|---|---|---|
| thanaweya-mcq-kit | plays and grades a bank | prove content is right |
| mcq-bank-lint | key agrees with explanation | judge the explanation |
| mcq-bank-diff | report what changed | say whether the change is good |
| mcq-exam-paper | reproducible printable paper | grade, typeset, solve bidi |
| teacher packet (this repo) | asks a teacher, chapter by chapter | sign for the teacher |

Read together, those lines are the honest description of the whole set: mechanical checks here, human judgement there, and no tool pretending to do the other's job.
