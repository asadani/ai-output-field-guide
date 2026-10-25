export const STATE_KEY = 'aofg.activity.v1';
export function normalize(text) {
  return String(text).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
}
export function matches(entry, filters) {
  const haystack = normalize([entry.title, entry.summary, ...(entry.aliases || [])].join(' '));
  return normalize(filters.q || '').split(/\s+/).filter(Boolean).every(word => word.length <= 2
    ? haystack.split(/[^\p{L}\p{N}]+/u).includes(word)
    : haystack.includes(word))
    && (!filters.family || entry.family === filters.family)
    && (!filters.level || entry.level === filters.level)
    && (!filters.task || entry.tasks.includes(filters.task));
}
export function cleanState(value, approachIds, drillIds) {
  if (!value || value.version !== 1 || !Array.isArray(value.bookmarks) || !Array.isArray(value.attempted) || !Array.isArray(value.revealed)) {
    throw new Error('Saved activity has an unsupported format.');
  }
  const filter = (ids, allowed) => [...new Set(ids.filter(id => typeof id === 'string' && allowed.includes(id)))];
  return { version: 1, bookmarks: filter(value.bookmarks, approachIds), attempted: filter(value.attempted, drillIds), revealed: filter(value.revealed, drillIds) };
}
export function emptyState() { return { version: 1, bookmarks: [], attempted: [], revealed: [] }; }
export function loadActivity(getStorage, approachIds, drillIds) {
  try {
    const raw = getStorage().getItem(STATE_KEY);
    return { state: raw === null ? emptyState() : cleanState(JSON.parse(raw), approachIds, drillIds), persistent: true };
  } catch {
    return { state: emptyState(), persistent: false };
  }
}
export function writeActivity(getStorage, state) {
  try { getStorage().setItem(STATE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
export function assessChoice(answer, selected, count) {
  if (!Number.isInteger(selected) || selected < 0 || selected >= count) return 'missing';
  return selected === answer ? 'correct' : 'review';
}
