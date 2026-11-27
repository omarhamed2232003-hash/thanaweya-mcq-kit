# Embedding the engine in a site

This is the guide for putting the kit on a page: what to load, what to call, and — more important — where the answer key ends up. Read the last section before you decide which shape to use.

## What you are embedding

Two things, and they are independent:

- `src/engine.js` and its neighbours: pure functions, no DOM, no storage, no network.
- The bank: one JSON file that `validateBank` checks before anything runs.

The engine has no dependencies and no build step, so it can be served as plain ES modules or bundled by whatever the host site already uses.

## Shape A — one page, the whole bank in the browser

The simplest thing that works, and what the demo does:

```html
<script type="module">
  import { buildSession, gradeSession, validateBank } from '/vendor/thanaweya-mcq-kit/src/index.js';

  const bank = await (await fetch('/banks/thanaweya-2026.json')).json();
  const check = validateBank(bank);
  if (!check.ok) {
    console.error('refusing to start: the bank has errors', check.errors);
    throw new Error('invalid bank');
  }

  const session = buildSession(bank, { count: 20, seed: crypto.randomUUID() });
  // render session.questions, then:
  const result = gradeSession(session, answers);
</script>
```

Validate first and refuse to start. A bank with a broken key produces wrong grades silently, which is worse than a page that says it cannot load.

## Shape B — a subset per topic page

`filterQuestions` and `buildSession` take filters, so a chapter page can load the whole bank and build a session from one chapter:

```js
const session = buildSession(bank, {
  count: 15,
  seed: pageSeed,
  filters: { subjects: ['math'], chapters: ['derivatives'] },
});
```

The seed is what makes a paper reproducible. Use something the page can show the user (a short code) if they may need to come back to the same set.

## Shape C — grading on a server

If the questions are worth marks, do not grade in the browser. The browser should send the chosen indices and receive only the result:

```
POST /api/grade
{ "sessionId": "...", "answers": { "math-deriv-003": 2, "phy-heat-007": [1, 3] } }
→ 200 { "correct": 17, "total": 20, "items": [{ "id": "...", "correct": false }] }
```

The server holds the bank, calls `gradeSession`, and returns per-question correctness — and decides separately whether to send the explanation for a question the user got wrong. Everything client-side in shapes A and B ships the key with the questions, so anyone who opens the network tab has the answers.

## Where the answer key ends up

| Shape | Key in the browser | Fine for |
|---|---|---|
| A, B | yes, in the bank JSON | practice, revision, self-testing |
| C | no | anything that counts |

There is no clever middle: shuffling options and hiding indices is obfuscation, not security, because the correct option still has to be identified somewhere the browser can reach. Say so on the page if the distinction matters to your users.

## Session persistence

`serializeSession` and `parseSession` round-trip a session, so a quiz survives a refresh:

```js
localStorage.setItem('thanaweya:session', JSON.stringify(serializeSession(session)));
```

Namespace the storage key. `parseSession` returns null for anything it cannot read, so a stale value from an older version is ignored rather than crashing the page.

## One file, no server

`npm run build:demo` produces a single `demo.html` with the CSS, the script and the whole bank inlined. It opens from a file path with no server and no network, which is useful for a classroom machine or for checking that a bank works before publishing it. The build is a concatenation, not a bundle: the modules have no top-level name collisions, and a test fails if that stops being true.

## Checklist before you embed

- [ ] Pin a version or a commit; the bank format is versioned (`schemaVersion`) and `validateBank` refuses a mismatch.
- [ ] Call `validateBank` at load and refuse to start on errors.
- [ ] Decide the shape by asking whether the questions count for marks, not by what is easier.
- [ ] Keep the `licenseNote` from the bank visible somewhere on the page: the questions are original and are not official material.
- [ ] No personal data in the page or the bank; a name field on a practice page is a data-protection decision, not a UI one.
