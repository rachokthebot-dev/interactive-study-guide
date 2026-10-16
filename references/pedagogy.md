# Why the guide is shaped this way

The design choices are not stylistic. Each one is doing a specific job, and
knowing which job lets you adapt the format without breaking it.

## The effects worth building around

| Effect | Size | What it buys |
|---|---|---|
| **Spaced retrieval practice** vs massed | g ≈ 0.74 | The single largest lever available. Testing yourself, spread out. |
| Spacing alone | g ≈ 0.28 | Gaps help even without testing. |
| **Interleaving** topics in practice | d ≈ 0.35 | Mixing beats blocking, though it feels worse while doing it. |
| Expanding vs uniform intervals | g ≈ 0.034 | **Nothing.** Schedule cleverness is not where the value is. |

That last row is the one that shapes the engine. Since interval *shape* doesn't
reliably matter, the scheduler is deliberately plain and optimises for the thing
that does: the **number of successful retrievals**.

## The schedule

```
box 0  never seen          → asked at its home checkpoint
box 1  answered wrong      → comes back at the NEXT checkpoint
box 2  one correct recall  → comes back two checkpoints later
box 3  two correct recalls → retires to the quiz only
```

Items answered at their home checkpoint are not re-asked there on a reload —
they appear collapsed for review and return through the due queue instead.

The rail counts an item as done once it has been answered **correctly** — box 2
or box 3 — not once it reaches box 3. Requiring box 3 looks tidier and is a
trap: an item homed at one of the last two checkpoints has no later checkpoint
to return at, so it can never earn a second recall, and a learner who answered
everything correctly sees something like 69%. The schedule still uses the
distinction; the progress bar must not. `verify.mjs` simulates a flawless run
and fails if it does not reach 100%.

This is not FSRS and should not be. FSRS earns its keep scheduling across days;
this runs inside one reading session, where the job is just to guarantee
spaced repeats happen at all. If a learner wants cross-day scheduling, the
export button hands them their missed items to drill elsewhere.

## Why chunks, and why they're interrupted

Reading is a weak encoding activity and it *feels* strong — fluency gets
mistaken for mastery. The checkpoint exists to break that illusion at the
moment it forms. This is also why correct answers collapse and wrong ones stay
open: the learner's attention should end up on what they got wrong.

## Why the models must compute

A figure that animates a pre-baked result teaches the result. A figure that
computes teaches the *mechanism*, and — more importantly — lets the learner
falsify their own belief by pushing a slider and seeing something they didn't
expect. Several traps only land this way: you can tell someone that living
expenses don't belong in opportunity cost, or you can let them switch it on and
watch the number inflate.

It also keeps you honest. Writing the real computation surfaces the places where
you didn't actually understand the material.

## The fidelity ledger

Every chapter ends with a table of what is genuinely computed, and what is
scaled down or assumed. Learners who know which numbers to trust can use the
model as evidence; learners who don't will either over-trust it or dismiss it.
It costs ten lines and it is the difference between a toy and an instrument.

## What this format is bad at

Be honest with the user when one of these applies:

- **Open-ended judgement.** Essay-grading, design critique, anything where the
  answer is a paragraph. Checkpoints can't grade it.
- **Motor or social skill.** Interviewing, lab technique, playing an instrument.
- **Material with no stable answers.** Fast-moving or genuinely contested
  topics, where confident feedback would be misleading.
- **Very short material.** Under about three chunks, a good one-page document
  beats a guide and takes an hour less.

In those cases say so and offer the nearest thing that works — often a document
with a few checkpoints, or one chapter rather than six.
