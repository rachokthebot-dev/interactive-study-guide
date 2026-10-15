# {{COURSE}} — interactive study guide

Short reading chunks, live models, retrieval checkpoints spaced through the
material, and a quiz per chapter. One self-contained HTML file per chapter — no
build step, no dependencies, no network calls. Opens from `file://`, works
offline, deploys to any static host unchanged.

```
index.html          chapter hub
chNN-slug.html      one self-contained chapter (the deliverable)
build.py            assembles chapters from src/ — authoring-time only
verify.mjs          headless checks; run before claiming anything works
src/                shared engine + per-chapter content
```

## Working on it

```bash
python3 build.py                     # rebuild every chapter
python3 -m http.server 8000

npm i -D playwright && npx playwright install chromium
node verify.mjs http://localhost:8000/ch01-....html src/ch01/spec.json
```

`verify.mjs` fails on any console error, checks the item bank for authoring
bugs, drives every slider, confirms the spaced-recall queue survives a reload,
and grades the quiz against a key read from the page's own data. `spec.json`
pins model outputs to hand-computed values.

## Deploying

The built files are static and self-contained, so any host works: GitHub Pages
(push and enable Pages on the branch root), Netlify, S3, or a folder on an
internal server. Nothing needs a build step on the host.

## Progress

Saved per-browser in `localStorage`, so it survives a reload but does not follow
a learner across devices. The export button copies their missed items as a
prompt they can paste into Claude for extra drilling.
