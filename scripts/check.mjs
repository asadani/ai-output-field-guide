import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT, BASE, ORIGIN, approaches, journeys, pages } from './build.mjs';

export function validateContent(items = approaches, data = journeys) {
  assert.equal(items.length, 30, 'Launch requires 30 approaches');
  const ids = new Set(items.map(a => a.slug));
  assert.equal(ids.size, items.length, 'Approach slugs must be unique');
  const drillIds = new Set();
  const requiredArrays = ['history', 'principles', 'when', 'benefits', 'limits', 'checklist', 'sources', 'related', 'tasks'];
  for (const a of items) {
    assert.match(a.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ['title', 'family', 'type', 'level', 'summary', 'purpose', 'template', 'prompt', 'prerequisites', 'reviewed']) assert.ok(typeof a[field] === 'string' && a[field].trim(), `${a.slug}: missing ${field}`);
    for (const field of requiredArrays) assert.ok(Array.isArray(a[field]) && a[field].length, `${a.slug}: missing ${field}`);
    assert.ok(a.history.join(' ').split(/\s+/).length >= 35, `${a.slug}: history must explain the origin`);
    assert.ok(a.principles.length >= 3 && a.checklist.length >= 3);
    assert.ok(a.limits.length >= 2, `${a.slug}: missing limitations`);
    for (const id of a.related) assert.ok(ids.has(id) && id !== a.slug, `${a.slug}: broken related approach ${id}`);
    assert.equal(a.drills.length, 3, `${a.slug}: requires three drills`);
    assert.equal(a.drills.filter(d => d.kind === 'open').length, 1);
    for (const d of a.drills) {
      assert.ok(!drillIds.has(d.id), `Duplicate drill ${d.id}`); drillIds.add(d.id);
      for (const f of ['question', 'hint', 'explanation']) assert.ok(d[f]?.length > 20, `${d.id}: needs substantive ${f}`);
      if (d.kind === 'choice') {
        assert.ok(d.options.length >= 2 && Number.isInteger(d.answer) && d.answer >= 0 && d.answer < d.options.length, `${d.id}: invalid answer`);
        assert.equal(new Set(d.options).size, d.options.length);
      } else assert.ok(d.rubric.length >= 3, `${d.id}: missing rubric`);
    }
    assert.ok(a.example.before && a.example.after && a.example.notes.length >= 3, `${a.slug}: incomplete example`);
    for (const source of a.sources) assert.equal(new URL(source.url).protocol, 'https:');
    for (const task of a.tasks) assert.ok(data.tasks.some(t => t.slug === task));
    assert.ok(!/coming soon|\bTBD\b|org-placeholder/i.test(JSON.stringify(a)), `${a.slug}: placeholder text`);
  }
  assert.equal(drillIds.size, 90);
  assert.equal(data.tasks.length, 6); assert.equal(data.cases.length, 3); assert.equal(data.comparisons.length, 6);
  for (const t of data.tasks) {
    for (const slug of [t.primary, ...t.companions]) assert.ok(ids.has(slug), `${t.slug}: missing recommendation ${slug}`);
    assert.ok(data.cases.some(c => c.slug === t.case));
    assert.ok(t.rationale && t.when && t.avoid && t.steps.length >= 4);
  }
  for (const c of data.cases) {
    assert.ok(c.facts.length >= 4 && c.views.length >= 3 && c.question && c.answer);
    for (const v of c.views) assert.ok(v.shows && v.hides && (v.code || v.diagram || v.rows));
  }
  for (const c of data.comparisons) assert.ok(ids.has(c.a) && ids.has(c.b) && c.rows.length >= 3 && c.answer);
}

export function validateGenerated() {
  const output = pages();
  for (const [route, expected] of output) {
    const file = path.join(ROOT, route, 'index.html');
    assert.equal(fs.readFileSync(file, 'utf8'), expected, `${route}: stale generated page; run npm run build`);
    const html = expected;
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route}: one h1 required`);
    assert.ok(html.includes(`rel="canonical" href="${ORIGIN}${BASE}${route}"`));
    assert.ok(html.includes('class="nav-brand"') && html.includes('id="main"') && html.includes('Skip to content'));
    const elementIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(elementIds).size, elementIds.length, `${route}: duplicate element IDs`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:)/.test(value)) continue;
      const url = new URL(value, ORIGIN + BASE + route);
      assert.ok(url.pathname.startsWith(BASE), `${route}: escaped project base ${value}`);
      let target = path.join(ROOT, url.pathname.slice(BASE.length));
      if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
      assert.ok(fs.existsSync(target), `${route}: broken local reference ${value}`);
      if (url.hash && path.extname(target) === '.html') {
        assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: broken anchor ${value}`);
      }
    }
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    assert.ok(!/<script[^>]+src="https?:\/\//.test(html), `${route}: remote runtime script`);
    assert.ok(!/<link[^>]+rel="(?:stylesheet|preload)"[^>]+href="https?:\/\//.test(html), `${route}: remote runtime asset`);
  }
  for (const font of ['newsreader', 'inter', 'jetbrains-mono']) {
    const b = fs.readFileSync(path.join(ROOT, 'assets/fonts', font + '.ttf'));
    assert.ok(b.length > 10000 && b.readUInt32BE(0) === 65536, `${font}: invalid font download`);
    assert.ok(fs.readFileSync(path.join(ROOT, 'assets/fonts', font + '-OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
  }
  const js = fs.readFileSync(path.join(ROOT, 'assets/app.js'), 'utf8');
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|eval)\s*\(/.test(js), 'No runtime networking or code evaluation');
  assert.ok(!/\b(?:alert|confirm|prompt)\s*\(/.test(js), 'No blocking native dialogs');
  return output.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'scripts/check.mjs')) {
  validateContent();
  console.log(`Checked content and local links across ${validateGenerated()} pages; no external runtime dependencies.`);
}
