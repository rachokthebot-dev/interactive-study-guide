'use strict';
/* =================================================================
 * STORE + ENGINE
 *
 * The schedule is deliberately plain: an item you miss returns at the
 * next checkpoint, one you get right returns two checkpoints later, and
 * two correct recalls retire it to the quiz. No expanding-interval
 * cleverness, because meta-analysis puts expanding vs uniform spacing
 * at g = 0.034 — indistinguishable. Successful retrievals are what
 * count, so the schedule just makes sure they happen, spaced.
 * ================================================================= */
/* ---------- answer-position scrambling ---------------------------
 * Items are authored with the correct option first — easy to read in the
 * source, and a free pass if it ships that way: a learner who notices can
 * score full marks by always picking A.
 *
 * Two properties are wanted at once. The correct answer must land in each
 * position about equally often across the chapter, so no single letter is
 * worth guessing; and the sequence of positions must not be guessable
 * either, so a round-robin A, B, C, D is out. So: deal out a balanced
 * multiset of target slots, shuffle THAT, and give each item the slot it
 * draws. Everything is seeded off the chapter and item ids, so a learner
 * sees the same layout on every reload and when an item returns later.
 * ================================================================= */
(function scramble() {
  function rng(seed) {
    var h = 2166136261, n = 0;                      // FNV-1a over the seed
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {                            // splitmix32: each draw mixed on its own,
      var z = (h + Math.imul(++n, 0x9E3779B9)) | 0; // so short, similar ids don't correlate
      z = Math.imul(z ^ (z >>> 16), 0x21F0AAAD);
      z = Math.imul(z ^ (z >>> 15), 0x735A2D97);
      return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, r) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var items = BANK.concat(typeof QUIZ === 'undefined' ? [] : QUIZ)
                  .filter(function (q) { return q.type === 'mcq'; });
  var slots = items.map(function (_, i) { return i % 4; });
  shuffle(slots, rng(CHAPTER.id + ':slots'));

  items.forEach(function (q, k) {
    var r = rng(q.id), right = null, rest = [];
    q.opts.forEach(function (o) { if (o.ok && !right) right = o; else rest.push(o); });
    if (!right) return;                             // malformed item; the verifier reports it
    shuffle(rest, r);
    rest.splice(slots[k] % q.opts.length, 0, right);
    q.opts = rest;
  });
})();

var Store = (function () {
  var KEY = CHAPTER.key + '.' + CHAPTER.id + '.v1', db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { db = {}; }
  if (!db.items) db.items = {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  return {
    get: function (id) { return db.items[id] || null; },
    record: function (id, ok, tick) {
      var it = db.items[id] || (db.items[id] = { box: 0, last: -9, seen: 0 });
      it.seen++; it.last = tick;
      it.box = !ok ? 1 : (it.box >= 2 ? 3 : 2);
      save(); return it.box;
    },
    /* which previously-seen items are due to come back at this checkpoint */
    dueAt: function (tick) {
      return BANK.filter(function (q) {
        var it = db.items[q.id];
        if (!it || it.box === 0 || it.box === 3 || it.last >= tick) return false;
        var gap = tick - it.last;
        return (it.box === 1 && gap >= 1) || (it.box === 2 && gap >= 2);
      });
    },
    /* Fraction of the bank answered correctly and not outstanding.
     * This used to need box 3 — two successful recalls — which no item
     * homed at the last two checkpoints can ever reach, because there is
     * no later checkpoint to bring it back. A flawless run topped out at
     * 69%. Box 2 and box 3 both mean "got it right and nothing is owed";
     * the schedule still uses the distinction, the bar no longer does. */
    mastery: function () {
      var done = 0;
      BANK.forEach(function (q) {
        var it = db.items[q.id];
        if (it && it.box >= 2) done += 1;
      });
      return done / BANK.length;
    },
    missed: function () {
      return BANK.concat(typeof QUIZ === 'undefined' ? [] : QUIZ).filter(function (q) {
        var it = db.items[q.id]; return it && it.box === 1;
      });
    },
    quizResult: function (r) { if (r !== undefined) { db.quiz = r; save(); } return db.quiz; },
    nuke: function () { db = { items: {} }; save(); }
  };
})();

/* ---------- rendering one question ------------------------------- */
var TICK = '<svg class="tick" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/>' +
           '<path d="M5.5 10.5 L8.8 13.6 L14.5 6.9"/></svg>';
var XMARK = '<svg class="tick no" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/>' +
            '<path d="M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5"/></svg>';

function renderQ(q, n, isReview) {
  var h = '<div class="q" data-id="' + q.id + '">';
  h += '<div class="qn"><span>' + (typeof n === 'number' ? String(n).padStart(2, '0') : n) + '</span>' +
       '<span class="pill">' + TOPICS[q.topic - 1] + '</span>' +
       (isReview ? '<span class="pill recall">spaced recall</span>' : '') + '</div>';
  h += '<div class="qlabel"><span class="mk"></span><span class="txt">' + q.short + '</span>' +
       (isReview ? '<span class="re">recall</span>' : '') + '</div>';
  h += '<div class="stem">' + q.stem + '</div>';

  if (q.type === 'mcq') {
    h += '<div class="opts">';
    q.opts.forEach(function (o, i) {
      h += '<button class="opt" data-i="' + i + '"><span class="k">' +
           'ABCD'[i] + '</span><span>' + o.t + '</span></button>';
    });
    h += '</div>';
  } else if (q.type === 'numeric') {
    h += '<div class="numrow">' + (q.pre ? '<span class="pre">' + q.pre + '</span>' : '') +
         '<input type="text" inputmode="decimal" placeholder="your answer" aria-label="answer">' +
         '<button class="btn" data-a="check">Check</button></div>';
  } else if (q.type === 'classify') {
    q.rows.forEach(function (r, i) {
      h += '<div class="clsrow" data-i="' + i + '"><span>' + r.t + '</span><select>' +
           '<option value="">— pick one —</option>' +
           q.cats.map(function (c) { return '<option>' + c + '</option>'; }).join('') +
           '</select></div>';
    });
    h += '<div class="numrow" style="margin-top:12px"><button class="btn" data-a="check">Check all</button></div>';
  }
  h += '</div>';
  return h;
}

function num(s) { return parseFloat(String(s).replace(/[$,\s]/g, '')); }

/* Grade one question node. Returns true/false, or null if unanswered. */
function grade(node, q, pick) {
  if (q.type === 'mcq') {
    if (pick === undefined || pick === null) return null;
    return !!q.opts[pick].ok;
  }
  if (q.type === 'numeric') {
    var v = num($('input', node).value);
    if (isNaN(v)) return null;
    return Math.abs(v - q.answer) <= (q.tol || 0);
  }
  if (q.type === 'classify') {
    var rows = node.querySelectorAll('.clsrow'), all = true, any = false;
    for (var i = 0; i < rows.length; i++) {
      var sel = $('select', rows[i]).value;
      if (sel) any = true; else all = false;
      if (sel !== q.rows[+rows[i].dataset.i].cat) all = false;
    }
    return any ? all : null;
  }
  return null;
}

/* Paint the answered state. */
function reveal(node, q, ok, pick, showWhy, review) {
  node.querySelectorAll('.opt').forEach(function (b, i) {
    b.disabled = true;
    if (q.opts[i].ok) b.classList.add('right');
    else if (i === pick) b.classList.add('wrong');
    else b.classList.add('muted');
  });
  if (q.type === 'classify') {
    node.querySelectorAll('.clsrow').forEach(function (r) {
      var sel = $('select', r), want = q.rows[+r.dataset.i].cat;
      if (review) {
        // no stored per-row answer, so just show the key
        sel.value = want;
        if (ok) r.classList.add('right');
      } else {
        r.classList.add(sel.value === want ? 'right' : 'wrong');
        if (sel.value !== want) {
          var o = document.createElement('option');
          o.textContent = '✓ ' + want; o.disabled = true; sel.appendChild(o);
        }
      }
      sel.disabled = true;
    });
  }
  node.querySelectorAll('input,button[data-a=check]').forEach(function (n) { n.disabled = true; });
  $('.mk', node).innerHTML = ok ? TICK : XMARK;

  if (showWhy) {
    var why = '';
    if (ok) {
      why = '<span class="vk">correct</span>' + (q.why ? q.why :
        (q.type === 'mcq' && q.opts.find(function (o) { return o.ok; }).why) || 'That\'s the one.');
    } else {
      var mine = q.type === 'mcq' && pick != null ? q.opts[pick] : null;
      why = '<span class="vk">not quite</span>' +
        (mine && mine.why ? mine.why + ' ' : '') +
        (q.why ? q.why : (q.type === 'mcq' ? '<strong>' + q.opts.find(function (o) { return o.ok; }).t + '</strong> is correct.' : ''));
      if (q.type === 'numeric' && !q.why) why += ' The answer is <strong>' + q.answer + '</strong>.';
    }
    var fb = document.createElement('div');
    fb.className = 'fb ' + (ok ? 'ok' : 'no');
    fb.innerHTML = why;
    node.appendChild(fb);
  }
}

/* ---------- a checkpoint ----------------------------------------- */
function mountCheckpoint(ckId, tick) {
  var host = $('#' + ckId + ' .ck-body');
  /* fresh = never attempted, so this is its debut. prior = already attempted
   * here, shown collapsed for review but NOT re-asked; it returns through the
   * due queue at a later checkpoint, which is the whole point of the spacing. */
  var fresh = BANK.filter(function (q) { return q.home === tick && !Store.get(q.id); });
  var prior = BANK.filter(function (q) { return q.home === tick && Store.get(q.id); });
  var due = Store.dueAt(tick).filter(function (q) { return q.home !== tick; });
  var live = fresh.concat(due);

  var html = '';
  if (!live.length) {
    html += '<p style="margin:0 0 6px">' + TICK + ' Nothing new to answer here — you have attempted ' +
      'everything that debuts at this checkpoint. Missed items reappear further down the page.</p>';
  }
  html += live.map(function (q, i) { return renderQ(q, i + 1, q.home !== tick); }).join('');
  html += prior.map(function (q) { return renderQ(q, '✓', false); }).join('');
  if (live.length) {
    html += '<div class="ck-foot"><span class="ck-score"><b data-k="done">0</b> / ' + live.length +
      ' answered' + (due.length ? ' · ' + due.length + ' brought back from earlier' : '') +
      '</span><a href="#' + nextAnchor(tick) + '" class="btn ghost">Continue reading ›</a></div>';
  }
  host.innerHTML = html;

  var answered = 0;
  live.forEach(function (q) {
    var node = $('[data-id="' + q.id + '"]', host);
    function finish(ok, pick) {
      reveal(node, q, ok, pick, true);
      Store.record(q.id, ok, tick);
      answered++;
      var d = $('[data-k=done]', host); if (d) d.textContent = answered;
      railUpdate();
      if (ok) setTimeout(function () { node.classList.add('settled'); }, 1400);
    }
    if (q.type === 'mcq') {
      node.querySelectorAll('.opt').forEach(function (b) {
        b.addEventListener('click', function () { finish(!!q.opts[+b.dataset.i].ok, +b.dataset.i); });
      });
    } else {
      var btn = $('[data-a=check]', node);
      btn.addEventListener('click', function () {
        var g = grade(node, q);
        if (g === null) {
          btn.textContent = 'Answer first';
          setTimeout(function () { btn.textContent = q.type === 'classify' ? 'Check all' : 'Check'; }, 1200);
          return;
        }
        finish(g);
      });
      var inp = $('input', node);
      if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    }
    $('.qlabel', node).addEventListener('click', function () { node.classList.remove('settled'); });
  });

  /* collapsed review stubs for what was answered here on an earlier visit */
  prior.forEach(function (q) {
    var nodes = host.querySelectorAll('[data-id="' + q.id + '"]');
    var node = nodes[nodes.length - 1];
    var it = Store.get(q.id), ok = it.box >= 2;
    reveal(node, q, ok, null, true, true);
    node.classList.add('settled');
    var lab = $('.qlabel', node);
    var tagEl = document.createElement('span');
    tagEl.className = 're';
    var canReturn = it.last + 2 <= CHAPTER.anchors.length;
    tagEl.textContent = !ok ? 'due again' : (it.box === 3 || !canReturn) ? 'retired' : 'returns later';
    lab.appendChild(tagEl);
    lab.addEventListener('click', function () { node.classList.remove('settled'); });
  });
}
function nextAnchor(tick) { return CHAPTER.anchors[tick - 1] || 'quiz'; }

/* ---------- the chapter quiz ------------------------------------- */
(function mountQuiz() {
  var host = $('#bigquiz .ck-body');
  if (!host || typeof QUIZ === 'undefined' || !QUIZ.length) return;   // chapter built without a quiz
  host.innerHTML = QUIZ.map(function (q, i) { return renderQ(q, i + 1, false); }).join('') +
    '<div class="ck-foot"><span class="ck-score" data-k="prog">0 / ' + QUIZ.length + ' attempted</span>' +
    '<button class="btn" data-a="submit">Submit all ' + QUIZ.length + '</button></div>';

  var picks = {};
  QUIZ.forEach(function (q) {
    var node = $('[data-id="' + q.id + '"]', host);
    if (q.type === 'mcq') {
      node.querySelectorAll('.opt').forEach(function (b) {
        b.addEventListener('click', function () {
          node.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('right'); o.style.borderColor = ''; });
          b.style.borderColor = 'var(--slate)';
          picks[q.id] = +b.dataset.i;
          prog();
        });
      });
    } else if (q.type === 'numeric') {
      $('[data-a=check]', node).remove();
      $('input', node).addEventListener('input', prog);
    } else {
      $('[data-a=check]', node).closest('.numrow').remove();
      node.querySelectorAll('select').forEach(function (s) { s.addEventListener('change', prog); });
    }
  });
  function attempted() {
    return QUIZ.filter(function (q) {
      var node = $('[data-id="' + q.id + '"]', host);
      return grade(node, q, picks[q.id]) !== null;
    }).length;
  }
  function prog() { $('[data-k=prog]', host).textContent = attempted() + ' / ' + QUIZ.length + ' attempted'; }

  $('[data-a=submit]', host).addEventListener('click', function () {
    var byFnd = {}, right = 0;
    QUIZ.forEach(function (q) {
      var node = $('[data-id="' + q.id + '"]', host);
      var ok = grade(node, q, picks[q.id]) === true;
      reveal(node, q, ok, picks[q.id], true);
      Store.record(q.id, ok, 99);
      if (ok) right++;
      var f = TOPICS[q.topic - 1];
      byFnd[f] = byFnd[f] || { n: 0, k: 0 };
      byFnd[f].n++; if (ok) byFnd[f].k++;
    });
    this.disabled = true;
    Store.quizResult({ right: right, of: QUIZ.length, at: Date.now() });
    railUpdate();

    var rows = Object.keys(byFnd).map(function (f) {
      var d = byFnd[f], r = d.k / d.n;
      return '<div class="ch-row ' + (r === 1 ? 'peak' : r < 0.5 ? 'weak' : '') + '">' +
        '<span class="ch-label">' + f + '</span>' +
        '<span class="ch-bar-wrap"><i class="ch-bar" style="width:' + (r * 100) + '%"></i></span>' +
        '<span class="ch-val">' + d.k + '/' + d.n + '</span></div>';
    }).join('');
    var weak = Object.keys(byFnd).filter(function (f) { return byFnd[f].k < byFnd[f].n; });
    var res = el('qresult');
    res.hidden = false;
    res.innerHTML = '<div class="rh">' + right + ' of ' + QUIZ.length + ' — ' +
      Math.round(right / QUIZ.length * 100) + '%</div>' +
      '<p>' + (right === QUIZ.length
        ? 'Clean sweep. Come back to this quiz in three days rather than re-reading the chapter — the gap is doing the work, and re-reading feels productive while adding almost nothing.'
        : 'Read the explanation on every item you missed before moving on. Then reopen this chapter in two or three days: spaced retrieval beats massed review by about g = 0.74, which is the largest effect in this whole guide.') + '</p>' +
      '<div class="chart"><div class="ch-title">Where you stand, by foundation</div>' +
      '<div class="ch-sub">weakest first in your revision queue</div>' + rows + '</div>' +
      (weak.length ? '<p><strong>Revise in this order:</strong> ' + weak.join(', ') + '.</p>' : '');
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  prog();
})();

/* ---------- rail, export, reset ---------------------------------- */
function railUpdate() {
  var m = Store.mastery();
  el('railbar').style.width = (m * 100).toFixed(1) + '%';
  el('railval').textContent = Math.round(m * 100) + '%';
  document.querySelectorAll('nav.toc a').forEach(function (a) {
    var t = CHAPTER.navTicks[a.getAttribute('href')];
    if (!t) return;
    var set = BANK.filter(function (q) { return q.home === t; });
    var allDone = set.length && set.every(function (q) { var it = Store.get(q.id); return it && it.box >= 2; });
    a.classList.toggle('done', !!allDone);
  });
}

CHAPTER.anchors.forEach(function (_, i) { mountCheckpoint('ck' + (i + 1), i + 1); });
railUpdate();

/* The export pattern from the HTML-effectiveness post: turn what the page
 * knows back into something you can paste into a prompt. */
var SUBJECT = CHAPTER.course + (CHAPTER.source ? ' (' + CHAPTER.source + ')' : '');
el('btn-export').addEventListener('click', function () {
  var m = Store.missed();
  var txt = m.length
    ? 'I am studying ' + SUBJECT + ', ' + CHAPTER.title + '.\n' +
      'I got these specific items wrong and have not yet re-earned them:\n\n' +
      m.map(function (q, i) {
        return (i + 1) + '. [' + TOPICS[q.topic - 1] + '] ' + q.short + '\n   ' +
               q.stem.replace(/<[^>]+>/g, '');
      }).join('\n\n') +
      '\n\nDrill me on just these, one question at a time, with harder variants than the originals. ' +
      'Do not re-explain the parts I got right.'
    : 'I am studying ' + SUBJECT + ', ' + CHAPTER.title + ', and have no outstanding missed items. ' +
      'Quiz me on the hardest exam-level applications of this chapter.';
  navigator.clipboard.writeText(txt).then(function () {
    el('export-note').textContent = m.length
      ? 'Copied — ' + m.length + ' missed item' + (m.length > 1 ? 's' : '') + ', ready to paste into Claude.'
      : 'Copied — nothing outstanding, so it asks for harder material instead.';
  }, function () {
    el('export-note').textContent = 'Clipboard blocked by the browser. Select the page and copy manually.';
  });
});

el('btn-reset').addEventListener('click', function () {
  if (!confirm('Clear all progress for ' + CHAPTER.num + '? This cannot be undone.')) return;
  Store.nuke();
  location.reload();
});