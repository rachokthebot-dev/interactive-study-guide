'use strict';
/* =================================================================
 * MODEL 1 — the bag fee. A negative incentive with an indirect one
 * riding along behind it.
 * ================================================================= */
(function () {
  var HH = 10000, TRIPS = 2.5, BPT = 4, G_BAG = 5.5, G_LINER = 20, LINERS_WK = 2;

  function compute(p) {
    var share = clamp(p.fee / p.hassle, 0, 1);        // uniform hassle costs
    var base = HH * TRIPS * BPT;                       // bags/wk with no fee
    var bags = base * (1 - share);
    var revenue = p.fee * bags / 100;                  // cents -> dollars
    var gross = (base - bags) * G_BAG;                 // grams of plastic avoided
    var offset = HH * share * p.liner * LINERS_WK * G_LINER;
    var net = gross - offset;
    return {
      share: share, base: base, bags: bags, revenue: revenue,
      gross: gross, offset: offset, net: net,
      eff: gross > 0 ? net / gross : 0
    };
  }

  function draw(p, m) {
    var x = scale(0, 40, 44, 340), y = scale(0, 1, 118, 24), b = [];
    b.push(line(44, 118, 340, 118, AX), line(44, 118, 44, 24, AX));
    b.push(txt(40, 28, '100%', { a: 'end', s: 8, f: FAINT }), txt(40, 121, '0', { a: 'end', s: 8, f: FAINT }));
    b.push(txt(44, 132, '0¢', { s: 8, f: FAINT }), txt(340, 132, '40¢ fee', { a: 'end', s: 8, f: FAINT }));
    b.push(txt(48, 20, 'SHARE SWITCHING TO REUSABLE', { s: 8, f: FAINT, ls: 0.8 }));
    // the response curve: share = min(fee/hassle, 1)
    var pts = [], f;
    for (f = 0; f <= 40; f += 0.5) pts.push(x(f).toFixed(1) + ',' + y(clamp(f / p.hassle, 0, 1)).toFixed(1));
    b.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + CLAY + '" stroke-width="2"/>');
    b.push(line(x(p.fee), 118, x(p.fee), y(m.share), AX, 1.5, '3 3'));
    b.push('<circle cx="' + x(p.fee) + '" cy="' + y(m.share) + '" r="4.5" fill="' + CLAYD + '"/>');
    b.push(txt(clamp(x(p.fee) + 8, 0, 300), y(m.share) - 7, pct(m.share), { s: 10, f: CLAYD }));

    // mass bars: gross avoided, liner offset, net
    var mx = scale(0, Math.max(m.gross, 1), 108, 340), yy = 168;
    b.push(txt(44, 154, 'PLASTIC, GRAMS PER WEEK', { s: 8, f: FAINT, ls: 0.8 }));
    [['avoided', m.gross, OAT], ['liner offset', -m.offset, CLAY], ['net saved', m.net, OLIVE]].forEach(function (r, i) {
      var yv = yy + i * 26;
      b.push(txt(104, yv + 11, r[0], { a: 'end', s: 8.5, f: INK }));
      b.push(rect(108, yv, 232, 16, G100, 3));
      var w = mx(Math.abs(r[1])) - 108;
      b.push(rect(108, yv, clamp(w, 0, 232), 16, r[2], 3));
      b.push(txt(344, yv + 11, (r[1] < 0 ? '−' : '') + kg(Math.abs(r[1])), { a: 'end', s: 8.5, f: i === 2 ? OLIVE : INK }));
    });
    return svg('0 0 360 250', b.join(''));
  }

  var ids = ['fee', 'h', 'l'];
  function params() {
    return { fee: +el('bag-fee').value, hassle: +el('bag-h').value, liner: +el('bag-l').value / 100 };
  }
  var stepper;
  function render() {
    var p = params(), m = compute(p);
    el('bag-fee-v').textContent = p.fee + '¢';
    el('bag-h-v').textContent = p.hassle + '¢';
    el('bag-l-v').textContent = Math.round(p.liner * 100) + '%';
    el('bag-fig').innerHTML = draw(p, m);
    el('bag-ro-switch').textContent = pct(m.share);
    el('bag-ro-bags').textContent = Math.round(m.bags).toLocaleString('en-US');
    el('bag-ro-rev').textContent = money(m.revenue);
    el('bag-ro-gross').textContent = kg(m.gross);
    el('bag-ro-off').textContent = '−' + kg(m.offset);
    el('bag-ro-net').textContent = kg(m.net);
    var note;
    if (p.fee === 0) {
      note = '<strong>No fee, no response.</strong> Nobody switches, the city collects nothing, and no plastic is saved. Incentives only work when they change someone\'s cost–benefit.';
    } else if (m.eff < 0) {
      note = '<strong>The policy now backfires.</strong> The liner substitution outweighs the bags saved — the fee moved households onto thicker plastic. This is an indirect incentive swamping a direct one, and it is a real finding in the bag-fee literature.';
    } else if (m.eff < 0.55) {
      note = '<strong>The indirect incentive is eating ' + pct(1 - m.eff) + ' of the win.</strong> The fee works — fewer carrier bags — but households that used those bags as bin liners now buy heavier ones. Note also that revenue falls as the fee rises past the switching point: a tax designed to change behaviour stops raising money precisely when it succeeds.';
    } else {
      note = '<strong>Mostly working as intended</strong> — ' + pct(m.eff) + ' of the plastic saving survives the liner offset. Push the liner share up and watch a well-intentioned policy lose most of its effect without anyone changing the fee.';
    }
    el('bag-note').innerHTML = note;
    if (stepper) stepper.refresh();
  }

  ids.forEach(function (i) { el('bag-' + i).addEventListener('input', render); });
  stepper = Stepper(el('ap-bag'), [
    { t: 'The fee is a <strong>negative incentive</strong>: it raises the cost of taking a bag. A shopper switches to reusable only if the fee exceeds their own hassle cost.', lit: ['bag-ro-switch'], v: function (m) { return pct(m.share) + ' of households switch'; } },
    { t: 'That is the <strong>direct effect</strong> — fewer carrier bags leave the store, so less carrier-bag plastic.', lit: ['bag-ro-bags', 'bag-ro-gross'], v: function (m) { return kg(m.gross) + ' of plastic avoided per week'; } },
    { t: 'Now the <strong>indirect effect</strong>. Households that reused free bags as bin liners still need liners — so they buy them. Trash bags are about 4× the mass.', lit: ['bag-ro-off'], v: function (m) { return '−' + kg(m.offset) + ' clawed back'; } },
    { t: 'Net the two and you have the policy\'s real effect. The gap between the headline and this number is the whole lesson of Foundation 1.', lit: ['bag-ro-net'], v: function (m) { return kg(m.net) + ' net — ' + pct(m.eff) + ' of the headline'; } },
    { t: 'One more: revenue <strong>falls</strong> once the fee is high enough to change behaviour. A tax that works collects less. You will meet this again in Chapter 7.', lit: ['bag-ro-rev'], v: function (m) { return money(m.revenue) + ' per week'; } }
  ], function () { return compute(params()); });
  render();
})();

/* =================================================================
 * MODEL 2 — what a degree costs. Explicit + implicit, with the
 * living-expenses trap wired to a switch.
 * ================================================================= */
(function () {
  var LIVING = 14000;

  function compute(p) {
    var explicit = p.tuition * p.years;
    var implicit = p.wage * p.years;
    var living = p.countLiving ? LIVING * p.years : 0;
    var total = explicit + implicit + living;
    var correct = explicit + implicit;          // the right answer, always
    return {
      explicit: explicit, implicit: implicit, living: living, total: total, correct: correct,
      wrong: explicit,                           // "tuition only"
      gap: correct - explicit,
      be: p.gain > 0 ? total / p.gain : Infinity
    };
  }

  function draw(p, m) {
    var b = [], W = 300, x0 = 46;
    var mx = scale(0, Math.max(m.total, 1), x0, x0 + W);
    b.push(txt(x0, 20, 'ECONOMIC COST OF ' + p.years + ' YEAR' + (p.years > 1 ? 'S' : ''), { s: 8, f: FAINT, ls: 0.8 }));
    var segs = [['explicit', m.explicit, OAT], ['implicit', m.implicit, CLAY]];
    if (m.living) segs.push(['living (shouldn\'t count)', m.living, '#D9D4C7']);
    var cx = x0;
    segs.forEach(function (s) {
      var w = mx(s[1]) - x0;
      b.push(rect(cx, 30, w, 34, s[2], 0));
      if (w > 46) b.push(txt(cx + w / 2, 51, money(s[1]), { a: 'middle', s: 9.5, f: s[2] === CLAY ? '#fff' : INK }));
      cx += w;
    });
    b.push('<rect x="' + x0 + '" y="30" width="' + W + '" height="34" fill="none" stroke="' + AX + '" stroke-width="1.5"/>');
    // legend
    var ly = 78;
    segs.forEach(function (s, i) {
      b.push(rect(x0 + i * 100, ly, 9, 9, s[2], 2));
      b.push(txt(x0 + i * 100 + 13, ly + 8, s[0], { s: 8, f: INK }));
    });
    // the "tuition only" marker against the true cost
    b.push(line(x0, 108, x0 + W, 108, AX));
    b.push(txt(x0, 102, 'WHERE THE COMMON WRONG ANSWER LANDS', { s: 8, f: FAINT, ls: 0.8 }));
    var wx = mx(m.wrong);
    b.push(rect(x0, 112, wx - x0, 14, '#E8E4DA', 3));
    b.push(rect(x0, 112, mx(m.correct) - x0, 14, 'none', 3));
    b.push(line(mx(m.correct), 108, mx(m.correct), 132, CLAYD, 2));
    b.push(line(wx, 108, wx, 132, FAINT, 1.5, '3 3'));
    b.push(txt(x0, 142, 'tuition only ' + money(m.wrong), { s: 8.5, f: FAINT }));
    b.push(txt(x0 + W, 142, 'true ' + money(m.correct), { a: 'end', s: 8.5, f: CLAYD }));
    // break-even timeline
    b.push(txt(x0, 172, 'YEARS OF HIGHER SALARY TO REPAY IT', { s: 8, f: FAINT, ls: 0.8 }));
    var maxY = 25, bx = scale(0, maxY, x0, x0 + W);
    b.push(rect(x0, 182, W, 16, G100, 3));
    var beW = isFinite(m.be) ? clamp(bx(m.be) - x0, 0, W) : W;
    b.push(rect(x0, 182, beW, 16, isFinite(m.be) && m.be <= maxY ? OLIVE : CLAY, 3));
    b.push(txt(x0 + W + 2, 194, isFinite(m.be) ? m.be.toFixed(1) + ' yr' : 'never', { a: 'end', s: 9, f: INK }));
    for (var t = 0; t <= maxY; t += 5) b.push(txt(bx(t), 212, t, { a: 'middle', s: 8, f: FAINT }));
    return svg('0 0 360 220', b.join(''));
  }

  function params() {
    return {
      tuition: +el('oc-t').value, wage: +el('oc-w').value, years: +el('oc-y').value,
      gain: +el('oc-g').value, countLiving: el('oc-live').checked
    };
  }
  var stepper;
  function render() {
    var p = params(), m = compute(p);
    el('oc-t-v').textContent = money(p.tuition);
    el('oc-w-v').textContent = money(p.wage);
    el('oc-y-v').textContent = p.years;
    el('oc-g-v').textContent = money(p.gain);
    el('oc-fig').innerHTML = draw(p, m);
    el('oc-ro-ex').textContent = money(m.explicit);
    el('oc-ro-im').textContent = money(m.implicit);
    el('oc-ro-tot').textContent = money(m.total);
    el('oc-ro-wrong').textContent = money(m.wrong);
    el('oc-ro-be').textContent = isFinite(m.be) ? m.be.toFixed(1) + ' yr' : '∞';
    el('oc-ro-gap').textContent = m.wrong > 0 ? (m.correct / m.wrong).toFixed(1) + '×' : '∞';
    var note;
    if (p.countLiving) {
      note = '<strong>That switch is the wrong answer, and now you can see its size.</strong> Food and housing are ' +
        money(m.living) + ' of the ' + money(m.total) + ' on screen — but you eat and sleep whether or not you enrol, so they are not a cost <em>of enrolling</em>. Only the <em>difference</em> between dorm and the alternative belongs here. Switch it back off.';
    } else if (m.implicit > m.explicit) {
      note = '<strong>The invisible cost is the bigger one.</strong> Forgone salary (' + money(m.implicit) +
        ') exceeds tuition (' + money(m.explicit) + '), and nobody ever sends you a bill for it. Answering "' +
        money(m.wrong) + '" understates the true cost by ' + (m.correct / Math.max(m.wrong, 1)).toFixed(1) + '×.';
    } else {
      note = '<strong>Tuition dominates here</strong>, but the implicit cost is still ' + money(m.implicit) +
        ' — and it is the part that vanishes from most students\' answers. Economic cost = explicit + implicit, every time.';
    }
    el('oc-note').innerHTML = note;
    if (stepper) stepper.refresh();
  }

  ['t', 'w', 'y', 'g'].forEach(function (i) { el('oc-' + i).addEventListener('input', render); });
  el('oc-live').addEventListener('change', render);
  stepper = Stepper(el('ap-oc'), [
    { t: 'Start with the cheques you actually write. These are the <strong>explicit costs</strong> — the only ones an accountant records.', lit: ['oc-ro-ex'], v: function (m) { return money(m.explicit) + ' explicit'; } },
    { t: 'Now the resource you already own and are using up: your own time. The salary you did not earn is an <strong>implicit cost</strong>, and it is real even though no money moves.', lit: ['oc-ro-im'], v: function (m) { return money(m.implicit) + ' implicit'; } },
    { t: 'Add them. <strong>Economic cost = explicit + implicit.</strong> Revenue minus just the explicit part is accounting profit; minus both is economic profit.', lit: ['oc-ro-tot'], v: function (m) { return money(m.correct) + ' true economic cost'; } },
    { t: 'Compare that against the answer most students give — tuition alone. The dashed line on the figure is how far short it falls.', lit: ['oc-ro-wrong', 'oc-ro-gap'], v: function (m) { return 'off by ' + money(m.gap) + ' (' + (m.correct / Math.max(m.wrong, 1)).toFixed(1) + '×)'; } },
    { t: 'Finally, is it worth it? Divide the total cost by the annual salary gain. This is a decision at the margin, which is Foundation 4.', lit: ['oc-ro-be'], v: function (m) { return (isFinite(m.be) ? m.be.toFixed(1) + ' years to break even' : 'never breaks even'); } }
  ], function () { return compute(params()); });
  render();
})();

/* =================================================================
 * MODEL 3 — marginal thinking. MB and MC per unit, totals by
 * summation, the optimum from the crossing, and the net benefit that
 * each wrong stopping rule actually delivers.
 * ================================================================= */
(function () {
  var B = 8, C0 = 20, QMAX = 14;

  function mb(q, a) { return a - B * q; }
  function mc(q, d) { return C0 + d * q; }
  function tb(q, a) { return a * q - B * q * (q + 1) / 2; }
  function tc(q, d) { return C0 * q + d * q * (q + 1) / 2; }
  function net(q, a, d) { return tb(q, a) - tc(q, d); }

  function compute(p) {
    var optReal = (p.a - C0) / (B + p.d);
    var opt = clamp(Math.floor(optReal), 0, QMAX);
    var greedy = clamp(Math.floor(p.a / B), 0, QMAX);   // "while total benefit rises"
    return {
      mb: mb(p.q, p.a), mc: mc(p.q, p.d),
      net: net(p.q, p.a, p.d), opt: opt, optReal: optReal,
      best: net(opt, p.a, p.d), greedy: greedy, greedyNet: net(greedy, p.a, p.d),
      unitNet: mb(p.q, p.a) - mc(p.q, p.d),
      lost: net(opt, p.a, p.d) - net(p.q, p.a, p.d)
    };
  }

  function draw(p, m) {
    var b = [], x = scale(0, QMAX, 46, 346), lo = 0, hi = Math.max(p.a, mc(QMAX, p.d)) * 1.05, y = scale(lo, hi, 174, 24);
    b.push(line(46, 174, 346, 174, AX), line(46, 174, 46, 24, AX));
    b.push(txt(42, 28, Math.round(hi), { a: 'end', s: 8, f: FAINT }), txt(42, 177, '0', { a: 'end', s: 8, f: FAINT }));
    b.push(txt(46, 188, 'hours of study →', { s: 8, f: FAINT }));
    // net-benefit shading: each unit up to q is a column of height MB−MC
    for (var i = 1; i <= p.q; i++) {
      var h = mb(i, p.a) - mc(i, p.d), top = Math.max(mb(i, p.a), mc(i, p.d));
      b.push(rect(x(i - 1) + 1, y(top), x(i) - x(i - 1) - 2, Math.abs(y(top) - y(top - Math.abs(h))), h >= 0 ? '#EDF1E7' : '#FBE6DE', 1));
    }
    // the two schedules
    var pm = [], pc = [];
    for (var q = 0; q <= QMAX; q++) {
      if (mb(q, p.a) >= 0) pm.push(x(q) + ',' + y(mb(q, p.a)));   // stop MB at the axis
      pc.push(x(q) + ',' + y(mc(q, p.d)));
    }
    b.push('<polyline points="' + pm.join(' ') + '" fill="none" stroke="' + CLAY + '" stroke-width="2"/>');
    b.push('<polyline points="' + pc.join(' ') + '" fill="none" stroke="' + OLIVE + '" stroke-width="2"/>');
    // label where the two schedules are furthest apart — at the left edge — so
    // the captions never chase MB below the axis when it goes negative.
    b.push(txt(x(1.3), y(mb(1.3, p.a)) - 7, 'MB', { s: 10, f: CLAYD }));
    b.push(txt(x(1.3), y(mc(1.3, p.d)) + 15, 'MC', { s: 10, f: '#5A6B45' }));
    // optimum
    if (m.optReal >= 0 && m.optReal <= QMAX) {
      var ox = x(m.optReal), oy = y(mc(m.optReal, p.d));
      b.push(line(ox, 174, ox, oy, INK, 1.5, '3 3'));
      b.push('<circle cx="' + ox + '" cy="' + oy + '" r="4" fill="' + INK + '"/>');
      b.push(txt(ox, 18, 'MB = MC', { a: 'middle', s: 8.5, f: INK, ls: 0.5 }));
    }
    // where the reader is
    b.push(line(x(p.q), 174, x(p.q), 24, CLAYD, 2));
    b.push(txt(clamp(x(p.q), 46, 320) + 4, 36, 'you: ' + p.q + ' hr', { s: 9, f: CLAYD }));
    // net benefit strip
    var ny0 = 220, ny1 = 286, nmax = Math.max(m.best, 1), ny = scale(0, nmax, ny1, ny0);
    b.push(txt(46, 214, 'NET BENEFIT AT EACH CHOICE  =  Σ (MB − MC)', { s: 8, f: FAINT, ls: 0.8 }));
    b.push(line(46, ny1, 346, ny1, AX));
    for (var k = 1; k <= QMAX; k++) {
      var nv = net(k, p.a, p.d), w = x(1) - x(0) - 3;
      b.push(rect(x(k - 1) + 1.5, nv >= 0 ? ny(nv) : ny1, w, Math.abs(ny1 - ny(Math.max(nv, 0))) || 1,
        k === p.q ? CLAYD : k === m.opt ? OLIVE : OAT, 2));
    }
    b.push(txt(346, 214, 'peak at ' + m.opt + ' hr', { a: 'end', s: 8, f: '#5A6B45', ls: 0.5 }));
    return svg('0 0 360 296', b.join(''));
  }

  function params() { return { q: +el('mt-q').value, a: +el('mt-a').value, d: +el('mt-d').value }; }
  var stepper;
  function render() {
    var p = params(), m = compute(p);
    el('mt-q-v').textContent = p.q + ' hr';
    el('mt-a-v').textContent = p.a;
    el('mt-d-v').textContent = p.d;
    el('mt-fig').innerHTML = draw(p, m);
    el('mt-ro-mb').textContent = Math.round(m.mb);
    el('mt-ro-mc').textContent = Math.round(m.mc);
    el('mt-ro-net').textContent = Math.round(m.net);
    el('mt-ro-opt').textContent = m.opt + ' hr';
    el('mt-ro-best').textContent = Math.round(m.best);
    el('mt-ro-greedy').textContent = Math.round(m.greedyNet);
    var note;
    if (p.q === m.opt) {
      note = '<strong>That\'s the optimum.</strong> The next hour would cost ' + Math.round(mc(p.q + 1, p.d)) +
        ' and return ' + Math.round(mb(p.q + 1, p.a)) + ' — not worth it. Stopping here is worth ' +
        Math.round(m.best) + ', against ' + Math.round(m.greedyNet) + ' if you kept going while total benefit was still rising.';
    } else if (p.q < m.opt) {
      note = '<strong>You stopped too early.</strong> Hour ' + (p.q + 1) + ' returns ' + Math.round(mb(p.q + 1, p.a)) +
        ' and costs ' + Math.round(mc(p.q + 1, p.d)) + ' — still worth having. You are leaving ' +
        Math.round(m.lost) + ' of net benefit on the table.';
    } else {
      note = '<strong>You overshot.</strong> Hour ' + p.q + ' cost ' + Math.round(m.mc) + ' and returned only ' +
        Math.round(m.mb) + ', a net loss of ' + Math.round(-m.unitNet) +
        ' on that hour alone. Total benefit is still rising — which is exactly why "keep going while total benefit rises" is the wrong rule. You have given up ' + Math.round(m.lost) + ' versus stopping at ' + m.opt + '.';
    }
    el('mt-note').innerHTML = note;
    if (stepper) stepper.refresh();
  }

  ['q', 'a', 'd'].forEach(function (i) { el('mt-' + i).addEventListener('input', render); });
  stepper = Stepper(el('ap-mt'), [
    { t: 'Look at <strong>one</strong> hour, not the whole week. What does this hour add in benefit, and what does it cost in alternatives given up?', lit: ['mt-ro-mb', 'mt-ro-mc'], v: function (m) { return 'MB ' + Math.round(m.mb) + ' vs MC ' + Math.round(m.mc); } },
    { t: 'If MB &gt; MC, that hour is worth having — take it and ask again. If MB &lt; MC, it destroys value. Repeat until they meet.', lit: [], v: function (m) { return m.unitNet >= 0 ? 'worth +' + Math.round(m.unitNet) + ' — take it' : 'loses ' + Math.round(-m.unitNet) + ' — don\'t'; } },
    { t: 'The crossing is the answer: <strong>MB = MC</strong>. On the figure it is the dashed vertical; the net-benefit bars below peak at the same place, which is the proof the rule works.', lit: ['mt-ro-opt', 'mt-ro-best'], v: function (m) { return m.opt + ' hours, net ' + Math.round(m.best); } },
    { t: 'Now the wrong rule. "Keep going while <em>total</em> benefit rises" takes you all the way to where MB hits zero — total benefit really is higher there, and you are much worse off.', lit: ['mt-ro-greedy'], v: function (m) { return m.greedy + ' hours gives net ' + Math.round(m.greedyNet) + ', not ' + Math.round(m.best); } },
    { t: 'Nothing above was specific to studying. Replace MB and MC with revenue and cost and you have profit maximisation; with price and willingness to pay and you have the efficient quantity.', lit: [], v: function () { return 'same rule, every chapter'; } }
  ], function () { return compute(params()); });
  render();
})();

/* =================================================================
 * MODEL 4 — trade creates value. The sum of the two surpluses is the
 * one number the price cannot move.
 * ================================================================= */
(function () {
  function compute(p) {
    var trades = p.price <= p.buyer && p.price >= p.seller && p.buyer >= p.seller;
    return {
      trades: trades,
      cs: trades ? p.buyer - p.price : 0,
      ps: trades ? p.price - p.seller : 0,
      total: trades ? p.buyer - p.seller : 0,
      possible: Math.max(0, p.buyer - p.seller),
      lo: p.seller, hi: p.buyer
    };
  }

  function draw(p, m) {
    var b = [], x = scale(0, 120, 46, 344);
    // the value line
    b.push(txt(46, 20, 'VALUATIONS, AND THE RANGE A DEAL CAN LAND IN', { s: 8, f: FAINT, ls: 0.8 }));
    if (m.possible > 0) b.push(rect(x(p.seller), 30, x(p.buyer) - x(p.seller), 26, '#F5EFE6', 3));
    b.push(line(46, 56, 344, 56, AX));
    [[p.seller, 'seller\'s cost', OLIVE], [p.buyer, 'buyer\'s value', CLAY]].forEach(function (v, i) {
      b.push(line(x(v[0]), 30, x(v[0]), 62, v[2], 2));
      b.push(txt(clamp(x(v[0]), 60, 330), i === 0 ? 76 : 26, v[1] + ' ' + money(v[0]), { a: 'middle', s: 8.5, f: v[2] === CLAY ? CLAYD : '#5A6B45' }));
    });
    b.push('<polygon points="' + x(p.price) + ',38 ' + (x(p.price) - 5) + ',28 ' + (x(p.price) + 5) + ',28" fill="' + INK + '"/>');
    b.push(line(x(p.price), 30, x(p.price), 56, INK, 2));
    b.push(txt(clamp(x(p.price), 56, 334), 94, 'price ' + money(p.price), { a: 'middle', s: 9.5, f: INK }));
    for (var t = 0; t <= 120; t += 30) b.push(txt(x(t), 110, '$' + t, { a: 'middle', s: 8, f: FAINT }));

    // the two surpluses, stacked, total pinned
    var y0 = 146, H = 30, sx = scale(0, Math.max(m.possible, 1), 46, 344);
    b.push(txt(46, 138, 'WHO GETS THE GAINS', { s: 8, f: FAINT, ls: 0.8 }));
    b.push(rect(46, y0, 298, H, G100, 3));
    if (m.trades) {
      var wps = sx(m.ps) - 46, wcs = sx(m.cs) - 46;
      b.push(rect(46, y0, wps, H, OLIVE, 0));
      b.push(rect(46 + wps, y0, wcs, H, CLAY, 0));
      if (wps > 42) b.push(txt(46 + wps / 2, y0 + 19, money(m.ps), { a: 'middle', s: 9.5, f: '#fff' }));
      if (wcs > 42) b.push(txt(46 + wps + wcs / 2, y0 + 19, money(m.cs), { a: 'middle', s: 9.5, f: '#fff' }));
      b.push(txt(46, y0 + 46, 'producer surplus', { s: 8, f: '#5A6B45' }));
      b.push(txt(344, y0 + 46, 'consumer surplus', { a: 'end', s: 8, f: CLAYD }));
    } else {
      b.push(txt(195, y0 + 19, 'NO TRADE — NO VALUE CREATED', { a: 'middle', s: 9.5, f: CLAYD, ls: 0.6 }));
    }
    b.push('<rect x="46" y="' + y0 + '" width="298" height="' + H + '" fill="none" stroke="' + AX + '" stroke-width="1.5"/>');
    // the invariant
    b.push(txt(46, 212, 'TOTAL VALUE CREATED  =  BUYER\'S VALUE − SELLER\'S COST', { s: 8, f: FAINT, ls: 0.8 }));
    b.push(rect(46, 220, sx(m.possible) - 46, 12, m.trades ? INK : '#E8E4DA', 3));
    b.push(txt(46, 248, m.trades ? money(m.total) + ' — and the price slider cannot change this number' : 'zero', { s: 9.5, f: m.trades ? INK : CLAYD }));
    return svg('0 0 360 258', b.join(''));
  }

  function params() { return { buyer: +el('tv-b').value, seller: +el('tv-s').value, price: +el('tv-p').value }; }
  var stepper;
  function render() {
    var p = params(), m = compute(p);
    el('tv-b-v').textContent = money(p.buyer);
    el('tv-s-v').textContent = money(p.seller);
    el('tv-p-v').textContent = money(p.price);
    el('tv-fig').innerHTML = draw(p, m);
    el('tv-ro-cs').textContent = money(m.cs);
    el('tv-ro-ps').textContent = money(m.ps);
    el('tv-ro-tot').textContent = money(m.total);
    el('tv-ro-range').textContent = m.possible > 0 ? money(m.lo) + '–' + money(m.hi) : 'none';
    var note;
    if (p.buyer < p.seller) {
      note = '<strong>No trade should happen, and none does.</strong> The buyer values it at less than it costs the seller to give up, so there is no price both would accept. Trade creates value only when valuations differ <em>in the right direction</em> — this is the case people forget exists.';
    } else if (!m.trades) {
      note = '<strong>The price is outside the bargaining range, so nothing happens.</strong> Above ' + money(p.buyer) +
        ' the buyer walks; below ' + money(p.seller) + ' the seller walks. Either way ' + money(m.possible) +
        ' of value that <em>could</em> have been created isn\'t. Voluntary means both sides can refuse.';
    } else {
      note = '<strong>Both sides gain, and the total is fixed.</strong> The buyer clears ' + money(m.cs) +
        ', the seller ' + money(m.ps) + ' — and ' + money(m.cs) + ' + ' + money(m.ps) + ' = ' + money(m.total) +
        ' no matter where in the range the price lands. Price decides the <em>split</em>; the <em>size</em> comes from the gap between valuations. Haggling moves the line between the bars; it never moves the bar\'s end.';
    }
    el('tv-note').innerHTML = note;
    if (stepper) stepper.refresh();
  }

  ['b', 's', 'p'].forEach(function (i) { el('tv-' + i).addEventListener('input', render); });
  stepper = Stepper(el('ap-tv'), [
    { t: 'Two different numbers for the same object. The buyer would pay up to one; the seller would part with it for no less than the other. <strong>Value is not in the object.</strong>', lit: [], v: function (m) { return 'gap of ' + money(m.possible); } },
    { t: 'Any price inside that gap — the shaded band — makes both sides better off, so both agree. Outside it, someone refuses.', lit: ['tv-ro-range'], v: function (m) { return m.possible > 0 ? 'deals possible from ' + money(m.lo) + ' to ' + money(m.hi) : 'no band — no deal'; } },
    { t: 'The buyer\'s gain is <strong>consumer surplus</strong>: what it was worth minus what they paid.', lit: ['tv-ro-cs'], v: function (m) { return money(m.cs); } },
    { t: 'The seller\'s gain is <strong>producer surplus</strong>: what they got minus what they gave up.', lit: ['tv-ro-ps'], v: function (m) { return money(m.ps); } },
    { t: 'Now move the price and watch. The split changes; <strong>the total never does.</strong> That total is the value trade created out of nothing but a difference in valuations.', lit: ['tv-ro-tot'], v: function (m) { return money(m.total) + ' — invariant to price'; } }
  ], function () { return compute(params()); });
  render();
})();