/* ===================================================================
 * Chapter 01 — four live models, a step-through annotator, and the
 * within-material retrieval schedule. Plain ES5-ish JS in IIFEs, no
 * dependencies, no build step. Opens from file://, deploys to any
 * static host. Every displayed number comes out of a compute() below.
 * =================================================================== */
'use strict';

/* ---------- tiny helpers ------------------------------------------ */
function $(s, r) { return (r || document).querySelector(s); }
function el(id) { return document.getElementById(id); }
function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
function pct(n, d) { return (n * 100).toFixed(d === undefined ? 0 : d) + '%'; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function kg(g) { return g >= 1000 ? (g / 1000).toFixed(1) + ' kg' : Math.round(g) + ' g'; }

/* A scale factory: domain -> pixel range. */
function scale(d0, d1, p0, p1) {
  return function (v) { return p0 + (v - d0) / (d1 - d0) * (p1 - p0); };
}
var AX = '#D1CFC5', INK = '#3D3D3A', FAINT = '#87867F',
    CLAY = '#D97757', CLAYD = '#B85C3E', OAT = '#E3DACC', OLIVE = '#788C5D', G100 = '#F0EEE6';
function txt(x, y, s, o) {
  o = o || {};
  return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'start') +
    '" font-family="ui-monospace,monospace" font-size="' + (o.s || 9) + '" fill="' + (o.f || INK) +
    '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + '>' + s + '</text>';
}
function line(x1, y1, x2, y2, c, w, dash) {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
    '" stroke="' + c + '" stroke-width="' + (w || 1.5) + '"' +
    (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round"/>';
}
function rect(x, y, w, h, f, r) {
  return '<rect x="' + x + '" y="' + y + '" width="' + Math.max(0, w) + '" height="' + Math.max(0, h) +
    '" fill="' + f + '" rx="' + (r === undefined ? 3 : r) + '"/>';
}
function svg(vb, body) {
  return '<svg viewBox="' + vb + '" role="img">' + body + '</svg>';
}

/* ---------- the step-through annotator ---------------------------- *
 * Each applet gets a numbered walkthrough. Advancing a step lights the
 * readouts that step is about and fills in the live value, so the reader
 * is told which number to look at and why, in order.
 */
function Stepper(host, defs, recompute) {
  var box = document.createElement('div');
  box.className = 'steps';
  box.innerHTML =
    '<div class="steps-h"><span class="lbl">Walk me through it</span>' +
    '<button class="btn ghost" data-a="prev">‹ back</button>' +
    '<button class="btn ghost" data-a="next">next ›</button>' +
    '<span class="ck-score" data-k="pos"></span></div>' +
    defs.map(function (d, i) {
      return '<div class="step" data-i="' + i + '"><span class="sn">' +
        String(i + 1).padStart(2, '0') + '</span><span>' + d.t +
        '<span class="sv"></span></span></div>';
    }).join('');
  host.appendChild(box);

  var rows = box.querySelectorAll('.step'), pos = -1;
  function paint() {
    for (var i = 0; i < rows.length; i++) {
      rows[i].className = 'step' + (i === pos ? ' on' : i < pos ? ' past' : '');
    }
    $('[data-k=pos]', box).textContent = pos < 0 ? '' : (pos + 1) + ' / ' + rows.length;
    // clear every lit readout in this applet, then light the live step's
    var lits = host.querySelectorAll('.ro.lit');
    for (var j = 0; j < lits.length; j++) lits[j].classList.remove('lit');
    if (pos >= 0 && defs[pos].lit) {
      defs[pos].lit.forEach(function (id) { var n = el(id); if (n) n.closest('.ro').classList.add('lit'); });
    }
    values();
  }
  function values() {
    var m = recompute();
    for (var i = 0; i < rows.length; i++) {
      var sv = $('.sv', rows[i]);
      sv.textContent = (i <= pos && defs[i].v) ? defs[i].v(m) : '';
    }
  }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    pos = clamp(pos + (b.dataset.a === 'next' ? 1 : -1), -1, rows.length - 1);
    paint();
  });
  box.addEventListener('click', function (e) {
    var r = e.target.closest('.step'); if (!r) return;
    pos = +r.dataset.i; paint();
  });
  return { refresh: values, paint: paint };
}