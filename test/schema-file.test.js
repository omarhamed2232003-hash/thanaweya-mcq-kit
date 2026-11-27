import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DIFFICULTIES, SCHEMA_VERSION } from '../src/schema.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('the editor schema agrees with the validator', async () => {
  const schema = await readJson('../schema/question.schema.json');
  const question = schema.$defs.question;

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.properties.schemaVersion.const, SCHEMA_VERSION,
    'schemaVersion in the schema file must match SCHEMA_VERSION in src/schema.js');
  assert.deepEqual(question.properties.difficulty.enum, DIFFICULTIES,
    'difficulty enum must list exactly the difficulties the validator accepts');
  assert.deepEqual(question.properties.type.enum, ['single', 'multi']);
});

test('the schema requires the fields the validator requires', async () => {
  const schema = await readJson('../schema/question.schema.json');
  const required = schema.$defs.question.required;
  for (const field of ['id', 'subject', 'stem', 'options', 'explanation', 'difficulty']) {
    assert.ok(required.includes(field), `schema must require ${field}`);
  }
});

test('the real bank fits the constraints the schema file states', async () => {
  const schema = await readJson('../schema/question.schema.json');
  const bank = await readJson('../data/sample-questions.json');
  const questionSchema = schema.$defs.question;

  assert.equal(bank.schemaVersion, schema.properties.schemaVersion.const);
  assert.ok(schema.properties.direction.enum.includes(bank.direction));

  for (const question of bank.questions) {
    assert.ok(questionSchema.required.every((field) => question[field] !== undefined),
      `${question.id} is missing a required field`);
    assert.ok(questionSchema.properties.difficulty.enum.includes(question.difficulty),
      `${question.id} has a difficulty outside the schema enum`);
    assert.ok(questionSchema.properties.type.enum.includes(question.type ?? 'single'),
      `${question.id} has a type outside the schema enum`);
    assert.ok(question.options.length >= questionSchema.properties.options.minItems,
      `${question.id} has fewer options than the schema allows`);
    assert.equal(new Set(question.options).size, question.options.length,
      `${question.id} repeats an option`);
    if ((question.type ?? 'single') === 'multi') {
      assert.ok(Array.isArray(question.answerIndices) && question.answerIndices.length > 0,
        `${question.id} is multi but carries no answerIndices`);
    } else {
      assert.ok(Number.isInteger(question.answerIndex), `${question.id} carries no answerIndex`);
    }
  }
});
