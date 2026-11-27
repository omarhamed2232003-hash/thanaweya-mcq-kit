# The bank schema file

`schema/question.schema.json` describes the bank format in JSON Schema (draft 2020-12). It exists for two reasons:

- an editor can complete fields and flag a wrong difficulty or a missing key while the author types;
- another language can read the shape without running JavaScript, which matters because the format is meant to outlive this engine.

**It is not the validator.** `npm run validate` is authoritative: it checks every problem at once and reports both an Arabic and an English message. The schema file cannot express the rules that matter most, such as "the value the explanation finishes on must be the marked option".

## Pointing an editor at it

In VS Code, either add a `$schema` key to your bank file:

```json
{ "$schema": "../schema/question.schema.json", "schemaVersion": 1, "questions": [] }
```

or map it in `.vscode/settings.json`:

```json
{ "json.schemas": [ { "fileMatch": ["data/*.json"], "url": "./schema/question.schema.json" } ] }
```

## Keeping it honest

`test/schema-file.test.js` fails if the schema file drifts from the validator: the `schemaVersion` constant, the difficulty list and the type list must match `src/schema.js`, and every question in the real bank must satisfy the constraints the file states. A new difficulty therefore cannot be added to one place and forgotten in the other.
