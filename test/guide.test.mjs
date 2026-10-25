import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateContent, validateGenerated } from '../scripts/check.mjs';
import { approaches, journeys, ROOT, esc, drill, approachPage } from '../scripts/build.mjs';
import { matches, normalize, cleanState, emptyState, assessChoice, loadActivity, writeActivity } from '../assets/model.js';

test('the complete launch has original examples, history, sources, 90 drills, and valid connections', () => validateContent());
test('all generated pages match their source and every local destination and anchor exists', () => assert.equal(validateGenerated(), 52));
test('a missing source or broken relationship prevents shipping an incomplete entry', () => {
  const broken = structuredClone(approaches); broken[0].sources = [];
  assert.throws(() => validateContent(broken, journeys), /sources/);
  broken[0].sources = approaches[0].sources; broken[0].related = ['not-an-approach'];
  assert.throws(() => validateContent(broken, journeys), /broken related/);
});
test('search recognizes aliases and accents, combines filters, and finds a legitimate empty result', () => {
  const d = approaches.find(a => a.slug === 'diataxis');
  assert.equal(normalize('Diátaxis'), 'diataxis');
  assert.ok(matches(d, { q: 'diataxis', family: d.family, task: 'explain' }));
  assert.ok(!matches(d, { q: 'diataxis', level: 'Advanced' }));
  assert.ok(!matches(d, { q: 'quantum-cookery' }));
  assert.ok(matches(approaches.find(a => a.slug === 'self-explanation'), { q: 'Feynman' }));
  assert.ok(matches(approaches.find(a => a.slug === 'c4'), { q: 'C4' }));
  assert.ok(!matches(approaches.find(a => a.slug === 'arc42'), { q: 'C4' }));
});
test('blocked storage, corrupt records, and quota failures keep the guide usable without persisting answers', () => {
  assert.equal(loadActivity(() => { throw new Error('blocked'); }, [], []).persistent, false);
  assert.equal(loadActivity(() => ({ getItem: () => '{broken' }), [], []).persistent, false);
  assert.equal(loadActivity(() => ({ getItem: () => null }), [], []).persistent, true);
  assert.equal(writeActivity(() => ({ setItem: () => { throw new Error('quota'); } }), emptyState()), false);
  let stored;
  assert.equal(writeActivity(() => ({ setItem: (key, value) => { stored = JSON.parse(value); } }), emptyState()), true);
  assert.deepEqual(Object.keys(stored), ['version', 'bookmarks', 'attempted', 'revealed']);
});
test('search treats markup-like visitor text as a literal query', () => {
  assert.ok(!approaches.some(a => matches(a, { q: '<img src=x onerror=alert(1)>' })));
});
test('stored activity filters obsolete IDs, duplicates, and unexpected values', () => {
  const out = cleanState({ version: 1, bookmarks: ['c4', 'c4', 'gone', 2], attempted: ['c4-1', 'gone'], revealed: [] }, ['c4'], ['c4-1']);
  assert.deepEqual(out, { version: 1, bookmarks: ['c4'], attempted: ['c4-1'], revealed: [] });
  assert.deepEqual(emptyState(), { version: 1, bookmarks: [], attempted: [], revealed: [] });
});
test('corrupt or unsupported activity is rejected for safe session-only recovery', () => {
  for (const value of [null, {}, { version: 9 }, { version: 1, bookmarks: 'c4', attempted: [], revealed: [] }]) {
    assert.throws(() => cleanState(value, ['c4'], ['c4-1']));
  }
});
test('drill assessment distinguishes no answer from incorrect and correct attempts', () => {
  assert.equal(assessChoice(1, null, 3), 'missing');
  assert.equal(assessChoice(1, -1, 3), 'missing');
  assert.equal(assessChoice(1, 0, 3), 'review');
  assert.equal(assessChoice(1, 1, 3), 'correct');
});
test('rendered source text cannot terminate code blocks or inject markup', () => {
  assert.equal(esc('<script>"&</script>'), '&lt;script&gt;&quot;&amp;&lt;/script&gt;');
  const entry = structuredClone(approaches[0]);
  entry.example.after = '</code><script>alert(1)</script>';
  const html = approachPage(entry);
  assert.ok(html.includes('&lt;/code&gt;&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
});
test('closed and open practice render distinct honest feedback routes', () => {
  const [closed, , open] = approaches[0].drills;
  const c = drill(closed, 0), o = drill(open, 2);
  assert.ok(c.includes('<fieldset aria-describedby=') && c.includes('novalidate'));
  assert.ok(o.includes('self-review rubric') && !o.includes('data-correct='));
  assert.ok(o.includes('never saved'));
});
test('metadata and canonical routes are per-page, not a single-page router fallback', () => {
  const c4 = fs.readFileSync(path.join(ROOT, 'approaches/c4/index.html'), 'utf8');
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(c4.includes('https://tech.anujsadani.in/ai-output-field-guide/approaches/c4/'));
  assert.ok(home.includes('Choose the form.'));
  assert.ok(!c4.includes('src="https://'));
});
test('the dark/light tokens retain the documented normative light palette', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/style.css'), 'utf8');
  const doc = fs.readFileSync(path.join(ROOT, 'DESIGN.md'), 'utf8');
  for (const [token, value] of Object.entries({ bg: '#F5F1EB', surface: '#FFFFFF', text: '#1A1714', muted: '#6B6760', accent: '#A84420', border: '#DDD9D0' })) {
    assert.ok(css.includes(`--${token}:${value}`) && doc.includes(value), `${token}: drift`);
  }
});
