# Verification record

Implementation and release preparation: 24–25 October 2026.

## Executed checks

- `npm run build`: 52 generated pages, 30 approaches, 90 drills, 60 downloads.
- `npm run check`: required content, sources, related entries, task/case links,
  local destinations, anchors, metadata, bundled font signatures and licenses,
  and absence of external runtime scripts/stylesheet dependencies.
- `npm test`: 13 passing Node tests. Includes corrupt/blocked storage and quota
  failure recovery, stale IDs, exact short search terms, accent normalization,
  literal hostile search text, answer assessment, escaping, and token drift.
- JavaScript syntax checks for the runtime modules and diagram renderer.
- Official DESIGN.md lint: zero errors. Three orphan-token warnings are expected
  under the documented runtime-canonical ownership model; CSS consumes these
  tokens although component metadata does not reference them.
- Premium source audit: zero findings on maintained assets/scripts and documented
  canonical ownership. The audit cannot trace module handlers from generated
  HTML; generated output is checked separately and exercised in Chrome.
- Tech catalog integration: 44 existing tests passed in an isolated checkout.

## Chrome verification

- Explorer: literal search, accent-insensitive search, empty result, clear action,
  reload with query parameters, native family selection, and history restoration.
- Drills: missing choice, incorrect answer, correct answer, retry, open-ended
  text, answer/rubric disclosure, and attempted-state persistence across pages.
- Saved activity: bookmarking, navigation, reload, cancel reset, confirmed reset,
  initial Cancel focus, and focus restoration after closing the dialog.
- Cases: representation switching; UML class view selection.
- Light/dark themes and startup preference handling.
- 390px mobile home: no horizontal document overflow; native controls retain
  their platform-owned behavior. Desktop rendering inspected at 1280px.
- Script-disabled sandbox frame: readable entry, navigation, worked example,
  source links, answer disclosures, and downloads remain present; script-dependent
  controls are hidden.
- Social preview rendered locally from the original SVG into JPEG.

## Evidence limits and follow-up

The five-reader task study has not been performed. No claim of improved learning,
audience reach, standards certification, or complete WCAG conformance is made.
Print and reduced-motion rules are implemented and reviewed; a full assistive-
technology and cross-browser matrix is not yet complete. Browser checks above
are observed interactions, not a comprehensive automated browser suite.

Official linked publications ground the subject matter. Full copyrighted standards,
external experimental datasets, and every third-party validator were not audited.
Formal-method examples and source fragments are labeled as educational; no model
checker or general semantic validator runs on the website.

See the release section below for deployed verification once publication completes.

## Deployed verification — 25 October 2026

- Public repository created: https://github.com/asadani/ai-output-field-guide.
- GitHub Pages reported `built` for initial revision `7f67c95`; HTTPS enforcement
  was confirmed. The live home, explorer, C4 deep link, and template-copy feedback
  were verified in Chrome without console errors in that flow.
- Tech-site listing published in `ef444fc`; Pages reported `built`, and the live
  catalog contained the guide link.
- Main-site persistent link published in `90d6270`; Pages reported `built`, and
  Chrome verified its destination and its separation from the latest-posts feed.
- The main-site count helper's direct network fetch was unavailable in the CLI.
  It was run unchanged with a local catalog adapter using the verified tech-site
  content, updating the fallback to 48 entries. Live browser verification checks
  the real deployed feed separately.
- Added a standard-library structural accessibility check on all 53 HTML pages
  including the 404: labels, ARIA targets, diagram naming, and form validation
  ownership. Seven text/background pairs exceed 4.5:1 in both themes. This remains
  a limited structural/palette check, not an accessibility certification.
