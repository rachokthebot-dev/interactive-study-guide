# Writing questions

The quality of a guide is decided here, not in the prose. A question with
implausible wrong answers measures nothing, and generated questions fail this
way by default — models reliably judge mistakes plausible that no real learner
would make.

## The standard

A distractor is good if a learner who hasn't mastered the material would
**actually pick it**. The psychometric bar is that it attracts more than 5% of
low performers. Practically: every distractor should be a *named mistake* you
could describe to a teacher.

Write the wrong answers **first**. Then make the right one, and check it isn't
the longest or most hedged option — length and caveats are a tell learners read
without knowing it.

## Where real distractors come from

| Source | Example |
|---|---|
| **Inverting a ratio** | pricing the wrong good in an opportunity-cost table |
| **Sign errors** | dropping the minus that distinguishes inferior from normal |
| **Using the total where the change was asked** | giving the new quantity, not the difference |
| **Applying a rule one level up** | comparing against *average* cost in a marginal decision |
| **Answering the adjacent question** | giving absolute advantage when asked for comparative |
| **A true statement that doesn't answer it** | correct, irrelevant, and very attractive |
| **The intuitive-but-wrong folk answer** | "trade is zero-sum", "sunk costs should count" |

That last row is the most valuable. If the material has a result that offends
common sense, the common-sense answer is your best distractor.

## Every distractor carries its rebuttal

```js
{ t: 'The rise in enrolment, because that is what the policy was meant to encourage',
  why: 'That is the <em>direct</em> effect — the outcome the designers aimed at. Indirect effects are the ones nobody put in the announcement.' }
```

The `why` addresses **that specific choice**, not the question in general. A
learner who picked it should finish reading knowing exactly where their
reasoning went wrong. The correct option needs no `why` unless it adds something.

## Item types

```js
// multiple choice — exactly one { ok: true }
{ id: 'x1', home: 1, fnd: 2, type: 'mcq', short: 'Six-word label',
  stem: 'Question, <em>HTML allowed</em>.',
  opts: [ { t: 'Right', ok: true }, { t: 'Wrong', why: 'Because…' }, … ] }

// numeric — worked explanation is REQUIRED, and should name the wrong answers
{ id: 'x2', home: 2, fnd: 1, type: 'numeric', short: 'Label',
  stem: '…', pre: '$', answer: 118000, tol: 0,
  why: 'Explicit 42,000 + implicit 76,000 = <strong>118,000</strong>. Including living costs gives 148,000, the most common error.' }

// classify — rows into categories; every row.cat must be in cats
{ id: 'x3', home: 3, fnd: 4, type: 'classify', short: 'Label',
  stem: '…', cats: ['A', 'B'],
  rows: [ { t: 'Thing', cat: 'A' }, … ],
  why: 'The giveaway in each case…' }
```

- `short` is the collapsed label after a correct answer — six words, no more.
- `fnd` indexes the chapter's `FND` topic array, and drives the quiz breakdown.
  **Every topic in `FND` must appear in the quiz** or the verifier fails.
- `home` is the checkpoint the item debuts at. The scheduler handles the rest.
- `tol` on numerics: `0` for exact, `0.01` for two decimals. Choose deliberately.

## Checkpoint vs quiz

**Checkpoint items** (`BANK`) interrupt reading and give immediate feedback.
2–3 per checkpoint, on the chunk just read. They are the pedagogy.

**Quiz items** (`QUIZ`) are a separate pool, graded at the end with no feedback
until submission, and **interleaved** — shuffle the topics rather than blocking
them, because mixing beats grouping (d ≈ 0.35) even though it feels harder.

Don't reuse checkpoint items in the quiz. The quiz should ask the same ideas in
unfamiliar clothes — that's the point of testing transfer rather than recall of
a specific wording.

## Calibrating difficulty

Aim for a learner who has read the chunk properly to get roughly 70–80%. If
everything is answerable from the sentence directly above it, you have written a
reading-comprehension test, not a retrieval test. Make at least one item per
checkpoint require combining two things.
