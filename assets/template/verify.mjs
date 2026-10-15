/* Generic chapter verifier. Works on any chapter in this guide.
 *
 * A page like this fails silently — one throw gives you a clean-looking screen
 * with dead sliders — so this checks four separate things:
 *   1. the page runs at all (zero console errors, every applet drew an SVG)
 *   2. the ITEM BANK is well formed (authoring bugs: no correct answer, two
 *      correct answers, a distractor with no explanation, a classify row whose
 *      category isn't in the category list)
 *   3. every control actually moves the model
 *   4. the full answer path works: checkpoints, spaced recall across a reload,
 *      and the quiz grading to a key derived from the page's own data
 *
 * Optional second arg: a JSON file of {"readoutId": "expected text"} pinning
 * chapter-specific arithmetic to hand-computed values.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const url = process.argv[2];
const spec = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : null;
const errs = [], fails = [];
const ok = (c, label, got) => c
  ? console.log('  ok   ' + label)
  : (fails.push(label), console.log('  FAIL ' + label + (got !== undefined ? ` → got ${got}` : '')));

const b = await chromium.launch();
const p = await b.newPage();
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
await p.goto(url, { waitUntil: 'load' });

const title = await p.title();
console.log('\n### ' + title + '\n');

/* ---- 1. it runs ---- */
const figs = await p.locator('.ap-fig').count();
const svgs = await p.locator('.ap-fig svg').count();
ok(figs > 0 && figs === svgs, `all ${figs} applet(s) drew an SVG`, svgs);
ok((await p.locator('.steps .step').count()) >= figs * 3, 'every applet has a walkthrough');

/* ---- 2. item bank integrity ---- */
const bank = await p.evaluate(() => {
  const probs = [];
  const check = (q, where) => {
    if (!q.short) probs.push(`${q.id}: no short label`);
    if (q.fnd === undefined || !FND[q.fnd - 1]) probs.push(`${q.id}: bad fnd ${q.fnd}`);
    if (q.type === 'mcq') {
      const right = q.opts.filter(o => o.ok);
      if (right.length !== 1) probs.push(`${q.id}: ${right.length} correct options`);
      q.opts.forEach((o, i) => { if (!o.ok && !o.why) probs.push(`${q.id} opt ${i}: distractor has no explanation`); });
      if (q.opts.length < 3) probs.push(`${q.id}: only ${q.opts.length} options`);
    } else if (q.type === 'numeric') {
      if (typeof q.answer !== 'number' || !isFinite(q.answer)) probs.push(`${q.id}: no numeric answer`);
      if (!q.why) probs.push(`${q.id}: numeric with no worked explanation`);
    } else if (q.type === 'classify') {
      if (!q.why) probs.push(`${q.id}: classify with no explanation`);
      q.rows.forEach(r => { if (!q.cats.includes(r.cat)) probs.push(`${q.id}: row cat "${r.cat}" not in cats`); });
    } else probs.push(`${q.id}: unknown type ${q.type}`);
  };
  BANK.forEach(q => check(q, 'BANK'));
  QUIZ.forEach(q => check(q, 'QUIZ'));
  const ids = [...BANK, ...QUIZ].map(q => q.id);
  if (new Set(ids).size !== ids.length) probs.push('duplicate item ids');
  const homes = [...new Set(BANK.map(q => q.home))].sort();
  if (JSON.stringify(homes) !== JSON.stringify(CHAPTER.anchors.map((_, i) => i + 1)))
    probs.push(`BANK homes ${homes} don't match ${CHAPTER.anchors.length} checkpoints`);
  const fndUsed = new Set(QUIZ.map(q => q.fnd));
  if (fndUsed.size < FND.length) probs.push(`quiz covers ${fndUsed.size} of ${FND.length} topics`);
  return { probs, bank: BANK.length, quiz: QUIZ.length, topics: FND.length };
});
bank.probs.forEach(x => { fails.push(x); console.log('  FAIL ' + x); });
ok(bank.probs.length === 0, `item bank well formed (${bank.bank} checkpoint + ${bank.quiz} quiz, ${bank.topics} topics)`);

/* ---- 3. controls move the models ---- */
const ranges = await p.locator('.applet input[type=range]').all();
let moved = 0;
for (const r of ranges) {
  const app = await r.evaluate(n => n.closest('.applet').id);
  const before = await p.locator(`#${app} .ro-grid`).textContent();
  const [min, max, val] = await r.evaluate(n => [+n.min, +n.max, +n.value]);
  await r.fill(String(val === max ? min : max));
  const after = await p.locator(`#${app} .ro-grid`).textContent();
  if (before !== after) moved++;
  await r.fill(String(val));
}
ok(moved === ranges.length, `all ${ranges.length} sliders change their model's readouts`, moved);

const toggles = await p.locator('.applet input[type=checkbox]').all();
for (const t of toggles) { await t.check(); await t.uncheck(); }
ok(true, `${toggles.length} toggle(s) exercised`);

/* ---- chapter-specific arithmetic ---- */
if (spec) {
  console.log('\n  — pinned arithmetic —');
  for (const [id, want] of Object.entries(spec)) {
    const got = (await p.locator('#' + id).textContent()).trim();
    ok(got === want, `#${id} = ${want}`, got);
  }
}

/* ---- 4. the answer path ---- */
const nCk = await p.evaluate(() => CHAPTER.anchors.length);
ok((await p.locator('.check:not(#bigquiz)').count()) === nCk, `${nCk} checkpoints mounted`);
const ck1 = await p.evaluate(() => BANK.filter(q => q.home === 1).length);
ok((await p.locator('#ck1 .q').count()) === ck1, `checkpoint 1 shows its ${ck1} items`);

// answer checkpoint 1: first item right, second wrong (if it's an mcq)
const first = await p.evaluate(() => {
  const q = BANK.find(x => x.home === 1 && x.type === 'mcq');
  return q && { id: q.id, right: q.opts.findIndex(o => o.ok) };
});
if (first) {
  await p.locator(`#ck1 .q[data-id=${first.id}] .opt`).nth(first.right).click();
  ok((await p.locator(`#ck1 .q[data-id=${first.id}] .fb.ok`).count()) === 1, 'correct answer → ok feedback');
  ok((await p.locator(`#ck1 .q[data-id=${first.id}] .tick:not(.no)`).count()) === 1, 'correct answer → drawn checkmark');
  await p.waitForTimeout(1700);
  ok(await p.locator(`#ck1 .q[data-id=${first.id}]`).evaluate(n => n.classList.contains('settled')), 'correct item collapses');
}
const second = await p.evaluate(id => {
  const q = BANK.find(x => x.home === 1 && x.type === 'mcq' && x.id !== id);
  return q && { id: q.id, wrong: q.opts.findIndex(o => !o.ok) };
}, first?.id);
if (second) {
  await p.locator(`#ck1 .q[data-id=${second.id}] .opt`).nth(second.wrong).click();
  ok((await p.locator(`#ck1 .q[data-id=${second.id}] .fb.no`).count()) === 1, 'wrong answer → corrective feedback');
  ok(!(await p.locator(`#ck1 .q[data-id=${second.id}]`).evaluate(n => n.classList.contains('settled'))), 'wrong item stays open');
}

// spaced recall survives a reload
await p.reload({ waitUntil: 'load' });
if (second) ok((await p.locator(`#ck2 .q[data-id=${second.id}]`).count()) === 1, 'missed item returns at the NEXT checkpoint');
if (first) ok((await p.locator(`#ck1 .q[data-id=${first.id}] .opt:not([disabled])`).count()) === 0, 'answered item is not re-asked at its home checkpoint');
ok(parseInt(await p.locator('#railval').textContent()) > 0, 'progress bar survives reload (localStorage)');

/* ---- quiz, answered from the page's own key ---- */
const key = await p.evaluate(() => QUIZ.map(q => ({
  id: q.id, type: q.type,
  a: q.type === 'mcq' ? q.opts.findIndex(o => o.ok)
    : q.type === 'numeric' ? String(q.answer)
    : q.rows.map(r => r.cat)
})));
ok((await p.locator('#bigquiz .q').count()) === key.length, `quiz renders all ${key.length} questions`);
for (const q of key) {
  const node = p.locator(`#bigquiz .q[data-id=${q.id}]`);
  if (q.type === 'mcq') await node.locator('.opt').nth(q.a).click();
  else if (q.type === 'numeric') await node.locator('input').fill(q.a);
  else for (let i = 0; i < q.a.length; i++) await node.locator(`.clsrow[data-i="${i}"] select`).selectOption(q.a[i]);
}
await p.locator('#bigquiz button[data-a=submit]').click();
await p.waitForTimeout(400);
const rh = (await p.locator('#qresult .rh').textContent()).trim();
ok(rh.startsWith(`${key.length} of ${key.length}`), `quiz grades the key as full marks (${rh})`, rh);
ok((await p.locator('#qresult .ch-row').count()) === bank.topics, `breakdown covers all ${bank.topics} topics`);

/* ---- export ---- */
await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await p.locator('#btn-export').click();
await p.waitForTimeout(250);
ok((await p.locator('#export-note').textContent()).length > 0, 'export button reports a result');

await b.close();
console.log('\n' + (errs.length ? 'CONSOLE ERRORS:\n' + errs.join('\n') : 'no console errors'));
console.log(fails.length ? `${fails.length} FAILURE(S)` : 'all checks passed');
process.exit(errs.length || fails.length ? 1 : 0);
