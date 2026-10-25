import { STATE_KEY, matches, emptyState, assessChoice, loadActivity, writeActivity } from './model.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const catalog = JSON.parse($('#catalog-data').textContent);
const ids = catalog.map(x => x.slug);
const drillIds = catalog.flatMap(x => x.drillIds);
let { state, persistent } = loadActivity(() => localStorage, ids, drillIds);
let storageMessage = '';
const status = $('#site-status');
function announce(message) { status.textContent = message; }
function warnStorage(message) {
  persistent = false;
  storageMessage = message;
  const note = $('#storage-note');
  note.hidden = false;
  note.textContent = message;
}
if (!persistent) {
  warnStorage('Saved activity could not be read. You can keep using the guide; activity will stay in this visit only.');
}
function persist() {
  if (persistent) {
    if (!writeActivity(() => localStorage, state)) warnStorage('Your browser could not save activity. Bookmarks and attempts will stay in this visit only.');
  }
  updateSaved();
}
function mark(collection, id) {
  if (!state[collection].includes(id)) state[collection].push(id);
  persist();
}
function updateSaved() {
  $$('[data-bookmark]').forEach(button => {
    const active = state.bookmarks.includes(button.dataset.bookmark);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Saved ✓' : 'Save approach';
    const title = catalog.find(a => a.slug === button.dataset.bookmark).title;
    button.setAttribute('aria-label', `${active ? 'Remove saved' : 'Save'} ${title}`);
  });
  $$('[data-attempt-label]').forEach(label => {
    label.textContent = state.attempted.includes(label.dataset.attemptLabel) ? 'Attempted' : 'Not attempted';
  });
  const savedList = $('#saved-list');
  if (savedList) {
    $$('[data-saved-entry]', savedList).forEach(card => { card.hidden = !state.bookmarks.includes(card.dataset.savedEntry); });
    $('#saved-empty').hidden = state.bookmarks.length > 0;
    $('#saved-count').textContent = `${state.bookmarks.length} saved approaches · ${state.attempted.length} of ${drillIds.length} drills attempted`;
  }
  const progress = $('#activity-summary');
  if (progress) progress.textContent = `${state.attempted.length} of ${drillIds.length} drills attempted. Attempts are practice records, not a measure of mastery.`;
}
$$('[data-bookmark]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.bookmark;
  const wasSaved = state.bookmarks.includes(id);
  state.bookmarks = wasSaved ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id];
  persist();
  announce(wasSaved ? 'Approach removed from saved items.' : persistent ? 'Approach saved on this browser.' : 'Approach saved for this visit.');
}));

const themeButton = $('#theme-toggle');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Theme still works for this document. */ }
});
const dark = document.documentElement.dataset.theme === 'dark';
themeButton.setAttribute('aria-pressed', String(dark));
themeButton.textContent = dark ? 'Light mode' : 'Dark mode';

const search = $('#search');
if (search) {
  const family = $('#family-filter'), level = $('#level-filter'), task = $('#task-filter');
  const cards = $$('[data-entry]');
  const clear = $('#clear-search');
  let composing = false;
  function filter(updateUrl = true) {
    const filters = { q: search.value, family: family.value, level: level.value, task: task.value };
    let count = 0;
    cards.forEach(card => {
      const show = matches(catalog.find(x => x.slug === card.dataset.entry), filters);
      card.hidden = !show;
      count += Number(show);
    });
    $('#result-count').textContent = `${count} of ${catalog.length} approaches`;
    $('#no-results').hidden = count !== 0;
    clear.hidden = search.value.length === 0;
    if (updateUrl) {
      const url = new URL(location.href);
      Object.entries(filters).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      if (url.href !== location.href) history.replaceState(null, '', url);
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    for (const [key, input] of [['family', family], ['level', level], ['task', task]]) {
      input.value = params.get(key) || '';
      if (input.selectedIndex < 0) input.value = '';
    }
    filter(false);
  }
  search.addEventListener('compositionstart', () => { composing = true; });
  search.addEventListener('compositionend', () => { composing = false; filter(); });
  search.addEventListener('input', () => { if (!composing) filter(); });
  $('#filter-form').addEventListener('submit', event => { event.preventDefault(); filter(); });
  [family, level, task].forEach(input => input.addEventListener('change', () => {
    history.pushState(null, '', location.href);
    filter();
  }));
  clear.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  $$('[data-reset-filters]').forEach(button => button.addEventListener('click', () => {
    search.value = ''; family.value = ''; level.value = ''; task.value = ''; filter(); search.focus();
  }));
  addEventListener('popstate', restore);
  restore();
}

$$('[data-switcher]').forEach(switcher => {
  const buttons = $$('[data-view]', switcher);
  const panels = $$('[data-view-panel]', switcher);
  function select(id) {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === id)));
    panels.forEach(p => { p.hidden = p.dataset.viewPanel !== id; });
  }
  buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.view)));
  select(buttons[0].dataset.view);
});

$$('[data-drill]').forEach(drill => {
  const id = drill.dataset.drill;
  const form = $('form', drill);
  const feedback = $('[data-feedback]', drill);
  const answer = $('[data-answer]', drill);
  answer.addEventListener('toggle', () => { if (answer.open) mark('revealed', id); });
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = $('input:checked', form);
    const outcome = assessChoice(Number(drill.dataset.correct), selected ? Number(selected.value) : null, $$('input', form).length);
    feedback.hidden = false;
    feedback.dataset.outcome = outcome;
    if (outcome === 'missing') {
      feedback.textContent = 'Choose an answer before checking.';
      $('fieldset', form).setAttribute('aria-invalid', 'true');
      $('input', form).focus();
      return;
    }
    $('fieldset', form).removeAttribute('aria-invalid');
    mark('attempted', id);
    feedback.textContent = outcome === 'correct' ? 'That fits this case. Read the explanation to check your reasoning.' : 'Review this choice. The explanation shows which condition matters.';
    answer.open = true;
  });
  $('[data-self-review]', drill)?.addEventListener('click', () => {
    mark('attempted', id); answer.open = true; announce('Marked as attempted. Compare your reasoning with the rubric; no automatic grading is performed.');
  });
  $('[data-retry]', drill).addEventListener('click', () => {
    form?.reset();
    if (form) $('fieldset', form).removeAttribute('aria-invalid');
    feedback.hidden = true;
    feedback.textContent = '';
    answer.open = false;
    const target = $('input', drill) || $('textarea', drill);
    target?.focus();
    announce('Ready to try again. Your previous attempt remains in saved activity.');
  });
});
$$('textarea').forEach(input => input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.max(130, input.scrollHeight)}px`;
}));

$$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const text = document.getElementById(button.dataset.copy).textContent;
  try {
    await navigator.clipboard.writeText(text);
    announce('Copied.');
  } catch {
    const source = document.getElementById(button.dataset.copy);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges(); selection.addRange(range);
    announce('Automatic copy is unavailable. The text is selected; use your device’s copy command.');
  }
}));

const reset = $('#reset-activity');
const dialog = $('#reset-dialog');
if (reset) {
  reset.addEventListener('click', () => { dialog.showModal(); $('#cancel-reset').focus(); });
  $('#cancel-reset').addEventListener('click', () => dialog.close());
  $('#confirm-reset').addEventListener('click', () => {
    state = emptyState();
    try { localStorage.removeItem(STATE_KEY); persistent = true; storageMessage = ''; $('#storage-note').hidden = true; }
    catch { warnStorage('Activity is cleared for this visit. Browser storage is unavailable.'); }
    updateSaved();
    dialog.close();
    announce('Guide bookmarks and drill activity cleared. Other site preferences were kept.');
  });
  dialog.addEventListener('close', () => reset.focus());
}
updateSaved();
if (storageMessage) announce(storageMessage);
document.documentElement.classList.add('enhanced');
