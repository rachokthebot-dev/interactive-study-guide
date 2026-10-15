# Build order

Six phases per chapter, in this order. The ordering is not stylistic: phase 2
decides the shape of everything else, and prose written before the model is
almost always thrown away.

The recurring failure is writing the explanation first. It feels like progress
and it locks in a story before you know what the model can show.

---

## Phase 1 — Find the computable core

Ask: **what in this chapter can actually be computed?** You are looking for the
smallest thing that produces a number or a state the learner can change.

| The material is | The model is |
|---|---|
| a formula or identity | a calculator that shows the inputs moving the output |
| a trade-off or optimum | a slider past the optimum, with the cost of being wrong shown |
| a system with feedback | a small simulation at reduced scale |
| a procedure or algorithm | a stepper that runs it on real input |
| a classification | a decision path where the learner sets the attributes |
| a protocol or pipeline | a packet/request walked through, carrying real state |

If a chapter has no computable core, it gets **no applet** — a good table and a
sharp checkpoint beat a decorative widget. Two real models across a chapter beat
four fake ones.

**Non-quantitative subjects still have models.** "How our auth service works"
has token lifetimes, retry budgets, cache hit rates and failure modes. "Writing
a good incident report" has a scoring rubric you can apply to a sample. Look for
anything with a threshold, a budget, a rate, or a branch.

## Phase 2 — Write `models.js` first

**This is the lesson.** Everything else presents it. Write it before there is
anything to look at.

- Real arithmetic, real algorithm, reduced scale.
- A pure `compute(params)` that takes inputs and returns derived values. No DOM,
  no drawing inside it.
- A `draw(params, model)` that renders SVG from the computed values only.
- Hand-compute two or three outputs and put them in `spec.json` **now**.

See `references/models.md` for the structure and the helpers available.

## Phase 3 — Chunk the material

Four chunks per chapter is the target; six is the ceiling. A chunk is one idea,
readable in two or three minutes, ending at a natural place to be tested.

Give every chunk a job. If you cannot say what a learner can do after it that
they could not do before, merge it into its neighbour.

Order chunks so each one earns the next. The last chunk of most chapters should
be *what the exam/review/interview actually asks* — the patterns, and the error
each is hunting for. Learners rate that chunk highest.

## Phase 4 — Write the item bank

Per chapter: **2–3 items per checkpoint**, and **8–12 quiz items** if quizzes are
on. Assign each item a `home` checkpoint and a topic (`fnd`).

Write the *wrong* answers first. If you cannot think of three mistakes a real
learner would make, you do not understand the material well enough to test it
yet — go back and find out what people get wrong.

See `references/item-writing.md`.

## Phase 5 — Write the prose

Now, and only now. The prose connects the chunks to the models, and it can be
short because the models carry the work. Cut every sentence that does not change
what the learner can do.

Use the card styles for emphasis rather than bold paragraphs:
`.card.accent` for the rule, `.card.trap` for the mistake, plain `.card` for an
aside. Tables beat lists for anything with two or more dimensions.

## Phase 6 — Verify, then show them one chapter

Run the full check from SKILL.md. Then stop and show the learner a single
chapter before writing the rest. Corrections are cheap now and expensive after
six more chapters exist.

---

## Adding a chapter

```bash
mkdir src/ch02 && cp src/ch01/* src/ch02/      # start from a working chapter
# edit meta.json first: id, file, num, title, anchors, navTicks, toc
python3 build.py
```

`anchors` lists where each checkpoint's "continue reading" link points —
one entry per checkpoint, last one `"quiz"`. `navTicks` maps a nav link to the
checkpoint number it completes, which drives the done-state on the nav pills.

## Chapters without a quiz

Omit the `#quiz` section from `body.html` and set `var QUIZ = [];` in `bank.js`.
The engine detects this and skips mounting; the checkpoints still work, and
`verify.mjs` adapts.
