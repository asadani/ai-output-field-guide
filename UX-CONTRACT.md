# Shared experience contract

English-language static reference and learning tool; WCAG 2.2 AA target.
All generated pages include the author header, guide navigation, breadcrumbs,
one h1, main landmark, skip link, footer, canonical URL, and descriptive metadata.

## Navigation and content

Explore is a render-all catalog of exactly 30 bounded entries. Search/family/task/
level combine with AND. Query state is restored from the URL and browser history.
Local search is immediate except during IME composition. Clear search restores
focus to its input; reset filters retains natural document scrolling.
No-results has a reset action. Links remain available without JavaScript.
Native selects own filter popups. The site does not impose custom popup geometry.

Learn offers authored cases, comparisons, all practice, and per-entry practice.
Case switching uses ordinary pressed buttons, not incomplete ARIA tabs; only the
chosen representation is visible with JavaScript. Without JavaScript all views
are readable. A choice's limitations stay beside its output.

## Drills

Each drill has stable ID, prompt, hint, explained answer, and either explicit
choices or a self-review rubric. Check answer with no selected choice shows an
inline correction and focuses the first choice. Retrying removes current feedback,
keeps historical attempt state, and focuses the first choice. Open answers stay
in memory; only attempt/reveal state persists. Native details reveal hints and
answers. No automatic semantic grading or claim of mastery.

## Local state and privacy

Version-1 record under aofg.activity.v1 stores only known bookmarked approach IDs
and attempted/revealed drill IDs. Invalid records or unavailable storage fall back
to memory with a visible status. Stale IDs are ignored. No sync or accounts.
Reset uses an accessible dialog; Cancel receives initial focus, Escape cancels,
focus returns to the initiating button. Reset never clears other apps' storage.
Host-level security logging is separate from application activity collection.

## Shared interaction owners

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Select/Listbox | Native select in shared explorer | This contract | family, level, task | Browser keyboard and change checks |
| Form | Shared drill renderer and app.js | This contract | choice, self-review | Unit and browser missing/incorrect/correct paths |
| Scrollbar | assets/style.css global baseline | DESIGN.md | document, table, code | Computed style and narrow viewport |
| Toast | site-status live region in shared shell | This contract | copy, bookmark, reset | Browser announcements and inline drill results |

The static audit targets assets/ and scripts/, the maintained source roots.
Generated HTML is checked by scripts/check.mjs and browser verification. The
bundled auditor expects inline handlers in literal HTML and cannot resolve our
external module event bindings; its actionless-button reports on generated
output are not used as a substitute for actual interaction tests.

assets/app.js owns native filter selects, drill forms, clipboard feedback,
bookmarks, cases, reset dialog, theme, and saved-page refresh. assets/style.css
owns focus, scrollbar, form, dialog, status, and layout states. No other page
implements competing variants. Buttons and links have visible keyboard and hover
states. Feedback uses a shared polite live region plus local drill results.
Forms use novalidate; no alert/confirm/prompt or executable user content.

## Resilience

Reading, references, examples, and download links are pre-rendered. A noscript
message explains that filtering, feedback, and saved activity require JavaScript.
Clipboard failures expose selectable text and a manual-copy instruction. Disabled
storage does not block practice. No fetch requests, AI API, remote fonts or scripts.
