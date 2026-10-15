# interactive-study-guide

A [Claude Code](https://claude.com/claude-code) skill that builds **interactive,
self-teaching study guides** for any subject.

Not a document with a quiz bolted on. Each chapter is short reading chunks, live
models the learner can push on, and retrieval checkpoints that interrupt reading
and come back at them on a schedule.

**Output is one self-contained HTML file per chapter** — no build step, no
dependencies, no network calls. Opens from `file://`, works offline, and deploys
to any static host unchanged. The skill itself never deploys anything; that's
your call, in a separate step.

## Install

```bash
git clone https://github.com/rachokthebot-dev/interactive-study-guide \
  ~/.claude/skills/interactive-study-guide
```

Then just ask: *"make me a study guide on X"*, *"turn these notes into something
interactive"*, *"onboarding material for our auth service"*.

It asks for the subject and audience, your source material, how many chapters,
and whether you want quizzes — then builds **one chapter first** for you to
review before writing the rest.

## What a chapter contains

- **Short chunks** rather than one long wall, so a checkpoint is never far away.
- **Live models.** Each applet computes real arithmetic from the slider values —
  no lookup tables, no tweening between pre-baked answers. Every model publishes
  a fidelity ledger saying what's genuinely computed and what's simplified.
- **Spaced retrieval checkpoints.** Miss an item and it returns at the next
  checkpoint; get it right and it returns two later; two correct recalls retire
  it. Items answered correctly collapse so attention lands on what you got wrong.
- **An optional end-of-chapter quiz**, interleaved rather than blocked, with a
  per-topic breakdown of where to revise.
- **Export** — copies your outstanding missed items as a prompt to paste back
  into Claude for extra drilling.

## Why it's built this way

| Choice | Evidence |
|---|---|
| Retrieval checkpoints spaced through the chapter, not a quiz at the end | Spaced retrieval vs massed, g ≈ 0.74 — the largest effect available |
| A deliberately plain schedule | Expanding vs uniform intervals, g = 0.034 — indistinguishable. Successful retrievals are what count, not interval cleverness |
| Quiz interleaved across topics | Interleaved quizzing, d ≈ 0.35 |
| Every distractor is a named misconception with its own rebuttal | Implausible distractors measure nothing — and it's how generated quizzes fail by default |
| Models compute rather than assert | Several traps only land when you watch the number move |

More in [`references/pedagogy.md`](references/pedagogy.md), including an honest
list of what this format is *bad* at.

## Verification is part of the skill

These pages fail silently — one thrown error gives a clean-looking screen with
dead sliders and empty question cards. The shipped `verify.mjs` fails on any
console error, checks the item bank for authoring bugs (no correct answer, two
correct answers, a distractor with no explanation, a classify row outside its
category list, a quiz that misses a topic), drives every slider, confirms the
spaced-recall queue survives a reload, and grades the quiz against a key read
from the page's own data.

`spec.json` pins model outputs to hand-computed values. In practice it has
caught both a model bug and an arithmetic slip in a hand-worked answer.

## Layout

```
SKILL.md                  the skill: intake questions, rules, verify gate
references/
  build-order.md          the authoring sequence — models before prose
  models.md               the compute/draw shape, SVG helpers, markup
  item-writing.md         where real distractors come from
  pedagogy.md             the evidence, and what this format can't do
assets/template/          a complete working chapter — open it before editing
```

The template is a finished chapter — *The Five Foundations of Economics*, four
working models, five checkpoints and a quiz. Built for
[a real course guide](https://rachokthebot-dev.github.io/econ-1a-study-guide/).

## Licence

MIT.
