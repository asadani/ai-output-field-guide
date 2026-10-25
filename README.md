# AI Output Field Guide

**Explore approaches. Understand their history. Practise the judgment. Apply a template.**

Live: https://tech.anujsadani.in/ai-output-field-guide/

A public educational reference by Anuj Sadani: 30 approaches, 90 original short
drills, six task guides, three switchable cases, six comparisons, and 60 template
and prompt downloads. Standards, frameworks, notations, documentation conventions,
and teaching methods are identified as different kinds of approaches.

The guide is AI-focused and useful without AI. It has no runtime LLM, backend,
database, account, analytics, or third-party runtime requests. Browser-local
activity records bookmarks and attempted/revealed exercise IDs, never free-text
answers. A host may keep its own ordinary security logs.

## Work locally

Node.js 22 or newer; no npm installation or build dependencies are required.

```sh
npm run build
npm run check
npm test
npm run serve
# Optional structural accessibility checks (Python standard library):
python scripts/accessibility.py
```

Open http://127.0.0.1:4173/ai-output-field-guide/. The development server enforces
the same project subpath as production, so broken root-relative links surface
before publication. The generated files are committed for root-branch GitHub Pages
publication. Do not add a CNAME: the project inherits the account site's domain.

## Maintained sources

- `content/approaches.json`: complete original entries, examples, sources, and drills.
- `content/journeys.json`: task recommendations, fixed-fact cases, comparisons.
- `scripts/build.mjs`: shared HTML renderer, metadata, sitemap, downloads.
- `assets/`: shared theme, interaction module, pure state/search logic, local fonts.
- `DESIGN.md` / `UX-CONTRACT.md`: durable visual direction and interaction ownership.

Edit content or shared sources, then rebuild. Every page, including deep links,
is readable HTML. JavaScript enhances filters, feedback, switching, bookmarks,
theme controls, and reset; it never generates or validates arbitrary visitor work.

## Editorial boundaries

Sources ground the approach and history. Examples and prompts are educational
adaptations, not official standards text or certificates of compliance. Formal
modeling examples do not run solvers here. A clear output can still be wrong;
correctness, completeness, evidence, and accessibility need their own review.

Report a specific correction through GitHub Issues. Include the page, disputed
claim or exercise, and a primary source or reproducible example where possible.

Verification and outstanding reader validation are recorded in docs/VERIFICATION.md.

## Reuse

Original code: MIT. Original content: CC BY 4.0, with attribution to Anuj Sadani.
Third-party material retains its own rights; fonts include their SIL OFL notices.
