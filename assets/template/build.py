#!/usr/bin/env python3
"""Assemble each chapter into ONE self-contained HTML file.

Authoring-time only: the emitted files have no external CSS, JS, fonts or
network calls. They open from file://, work offline, and deploy to any static
host. Shared shell + engine live here and in src/, so a fix lands in every
chapter. Course-level wording (name, attribution, hub copy) lives in
course.json — nothing about the subject is baked into this file.
"""
import json, pathlib, re

root = pathlib.Path(__file__).parent
src = root / 'src'
course = json.loads((root / 'course.json').read_text())
css = (src / 'guide.css').read_text()
helpers = (src / 'helpers.js').read_text()
engine = (src / 'engine.js').read_text()

SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · {course} study guide</title>
<meta name="description" content="{desc}">
<style>
{css}</style>
</head>
<body>

<noscript>
  <div style="background:#FCEEE3;border-bottom:1.5px solid #D97757;padding:16px 32px;font-family:system-ui,sans-serif;color:#141413">
    <strong>This page needs JavaScript.</strong> The questions, the quiz and the models are built in the
    browser — with scripts blocked you will see empty cards. Open it in a normal browser tab.
  </div>
</noscript>

<div class="rail">
  <div class="rail-in">
    <span class="rt">{num} mastery</span>
    <span class="bar"><i id="railbar"></i></span>
    <span class="rv" id="railval">0%</span>
  </div>
</div>

<div class="wrap">

<header class="masthead">
  <div class="hero-grid">
    <div>
      <div class="eyebrow">{course} · {num}</div>
      <h1>{h1}</h1>
      <p class="intro">{intro}</p>
      <div class="meta">{stats}</div>
      <nav class="toc">{toc}</nav>
    </div>
    <div class="hero-fig" aria-hidden="true">
      <span class="tag">{herotag}</span>
      <div class="fig-h">{herosub}</div>
      {hero}
    </div>
  </div>
</header>

{body}

<footer>
  <div class="foot-grid">
    <div>
      <div class="k">{course} · {num} of {total}</div>
      <div style="margin-top:6px">{sourcenote}</div>
    </div>
    <div style="text-align:right">
      <div>{next}</div>
      <div style="margin-top:6px"><a href="index.html">← all chapters</a></div>
    </div>
  </div>
</footer>

</div><!-- /wrap -->

<script>
{helpers}
</script>
<script>
'use strict';
{models}
</script>
<script>
'use strict';
var CHAPTER = {config};
{bank}
</script>
<script>
'use strict';
{engine}
</script>
</body>
</html>
"""

chapters = [d for d in sorted(src.glob('ch*')) if d.is_dir()]
total = '%02d' % len(chapters)

# One attribution sentence, shown in every chapter footer and on the hub.
# Empty `source` means the guide claims no source and the line is dropped.
sourcenote = (
    'Built against %s. This guide paraphrases and drills the concepts — it '
    'reproduces none of the source\'s text, figures or problem sets.' % course['source']
    if course.get('source') else
    'Concepts are paraphrased and drilled; no source text, figures or problem '
    'sets are reproduced.')

built, metas = [], []
for d in chapters:
    m = json.loads((d / 'meta.json').read_text())
    toc = ''.join(
        '<a href="#%s">%s <span class="n">%s</span></a>' % (a, t, n)
        for a, t, n in m['toc'])
    html = SHELL.format(
        title=m['title'], desc=m['desc'], css=css, num=m['num'], h1=m['h1'],
        intro=m['intro'], stats=m['stats'], toc=toc, hero=m['hero'],
        herotag=m['herotag'], herosub=m['herosub'], next=m['next'],
        course=course['course'], total=total, sourcenote=sourcenote,
        body=(d / 'body.html').read_text(), helpers=helpers,
        models=(d / 'models.js').read_text(),
        config=json.dumps({'id': m['id'], 'title': m['title'], 'num': m['num'],
                           'anchors': m['anchors'], 'navTicks': m['navTicks'],
                           'course': course['course'],
                           'source': course.get('source', ''),
                           'key': course.get('storageKey', 'studyguide')}),
        bank=(d / 'bank.js').read_text(), engine=engine)
    (root / m['file']).write_text(html)
    built.append((m['file'], len(html) // 1024))
    metas.append(m)

# The hub is generated from the chapter metas, so it can never drift from
# what was actually built.
rows = []
for m in metas:
    n = re.search(r'\d+', m['num'])
    rows.append(
        '  <a class="ch live" href="%s">\n'
        '    <div class="n">%s</div>\n'
        '    <div><div class="t">%s</div><div class="s">%s</div></div>\n'
        '    <div class="k">live</div>\n'
        '  </a>' % (m['file'], n.group() if n else '',
                    re.sub(r'^Chapter\s*\d+\s*[—–-]\s*', '', m['title']),
                    m['stats']))
hub = (src / 'index.html').read_text()
hub = (hub.replace('{{COURSE}}', course['course'])
          .replace('{{HUB_TITLE}}', course['hubTitle'])
          .replace('{{HUB_INTRO}}', course['hubIntro'])
          .replace('{{HUB_META}}', course['hubMeta'])
          .replace('{{HUB_DESC}}', re.sub(r'<[^>]+>', '', course['hubIntro']))
          .replace('{{SOURCE_NOTE}}', sourcenote)
          .replace('  <!-- BUILD:CHAPTERS -->', '\n'.join(rows)))
(root / 'index.html').write_text(hub)

for f, k in built:
    print('  %-38s %4d KB' % (f, k))
print('  %-38s %4d KB' % ('index.html', len(hub) // 1024))
print('%d chapter(s) built' % len(built))
