# Writing a model

A model is two pure functions and a render pass. Keep this shape — the stepper
and the verifier both depend on it.

```js
(function () {
  function compute(p) {            // pure: params in, derived values out
    var x = p.a * p.b;             // the REAL arithmetic
    return { x: x, ok: x > 10 };
  }
  function draw(p, m) {            // SVG string from computed values only
    var b = [];
    b.push(line(40, 100, 300, 100, AX));
    return svg('0 0 360 220', b.join(''));
  }
  function params() { return { a: +el('id-a').value, b: +el('id-b').value }; }

  var st;
  function render() {
    var p = params(), m = compute(p);
    el('id-a-v').textContent = p.a;             // echo control values
    el('id-fig').innerHTML = draw(p, m);
    el('id-ro-x').textContent = m.x.toFixed(1); // readouts
    el('id-note').innerHTML = /* a sentence that CHANGES with the state */;
    if (st) st.refresh();
  }
  ['a','b'].forEach(function (k) { el('id-' + k).addEventListener('input', render); });
  st = Stepper(el('ap-id'), [ /* steps */ ], function () { return compute(params()); });
  render();
})();
```

## Rules

- **`compute()` never touches the DOM** and never draws. You should be able to
  call it in node and check the numbers.
- **`draw()` reads only `p` and `m`.** No recomputation inside the renderer, or
  the figure and the readouts can disagree.
- **Never hard-code a result.** If a figure shows "peak at 6", find the 6 by
  scanning or solving, so it stays correct when a slider moves.
- **Guard your scales.** `scale(0, Math.max(v, 1), ...)` — a zero domain gives
  `Infinity` and a blank figure.
- **Slider sentinels must be inside `min`/`max`.** A `value="-1"` on a
  `min="0"` range is silently clamped by the browser. (This bug shipped once.)

## The note is the model talking

`el('id-note')` is not a caption. It reads the computed state and says something
different in each regime — "you overshot", "this is the optimum", "the policy
now backfires". It is where most of the teaching happens, so branch it properly.

## The stepper

`Stepper(hostEl, steps, recompute)` adds a numbered walkthrough that lights the
readouts each step is about and fills in live values:

```js
{ t: 'Prose, <strong>HTML allowed</strong>.',
  lit: ['id-ro-x'],                       // readout ids to highlight
  v: function (m) { return m.x.toFixed(1) + ' units'; } }   // live value
```

Four or five steps. Each should answer "what do I look at now, and why".

## Helpers available

From `helpers.js` — do not redefine these:

| Helper | Does |
|---|---|
| `$(sel, root)` `el(id)` | query helpers |
| `money(n)` `pct(n,d)` `clamp(v,lo,hi)` | formatting |
| `scale(d0,d1,p0,p1)` | domain → pixel mapping |
| `txt(x,y,s,{a,s,f,ls})` | SVG text; `a` anchor, `s` size, `f` fill |
| `line(x1,y1,x2,y2,c,w,dash)` | SVG line |
| `rect(x,y,w,h,fill,r)` | SVG rect |
| `svg(viewBox, body)` | wraps a body into a responsive `<svg>` |
| `AX INK FAINT CLAY CLAYD OAT OLIVE G100` | the palette constants |

Figures are **inline SVG**, not canvas: crisp at any zoom, themeable, and
inspectable when something looks wrong. Keep viewBox width 360 and let height
vary.

## Markup the model expects

```html
<div class="applet" id="ap-foo">
  <span class="tag">model · live</span>
  <div class="ap-title">What the learner is doing</div>
  <div class="ap-sub">the equations, in small caps</div>
  <div class="ap-grid">
    <div class="ap-fig" id="foo-fig"></div>
    <div>
      <div class="ctrl">
        <div class="cl"><span>Label</span><span class="cv" id="foo-a-v">10</span></div>
        <input type="range" id="foo-a" min="0" max="20" step="1" value="10">
        <div class="ch">One line on what this control means.</div>
      </div>
      <div class="ro-grid">
        <div class="ro"><div class="rl">Label</div><div class="rv" id="foo-ro-x">—</div></div>
        <div class="ro hero"><div class="rl">The headline</div><div class="rv" id="foo-ro-y">—</div></div>
        <div class="ro good"><div class="rl">A good outcome</div><div class="rv" id="foo-ro-z">—</div></div>
      </div>
    </div>
  </div>
  <p class="ap-note" id="foo-note"></p>
</div>
```

`.ro.hero` is the number the applet exists to show — one per model. `.ro.good`
tints olive for a favourable reading. A `<div class="ctrl toggle">` with a
checkbox is the right control for a trap you want the learner to switch on and
watch.
