---
version: alpha
colors:
  background: "#F5F1EB"
  surface: "#FFFFFF"
  text: "#1A1714"
  muted: "#6B6760"
  primary: "#A84420"
  border: "#DDD9D0"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
  utility:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  control: "6px"
  panel: "12px"
spacing:
  unit: "8px"
components:
  primary-action:
    backgroundColor: "#A84420"
    textColor: "#FFFFFF"
---

## Overview

A reading desk with an inspectable example beside it. The guide belongs to
Anuj's existing writing family, with an annotated representation switcher as its
signature. The warm palette is inherited deliberately from the tech site; avoid
generic promotional cards, gradients, decorative charts, and dashboard chrome.

## Colors

Ownership model B: assets/style.css owns semantic CSS variables; this document
mirrors accepted light values. background→--bg, surface→--surface, text→--text,
muted→--muted, primary→--accent, border→--border. Dark values are defined once in
[data-theme=dark]; shared components consume those variables. Primary terracotta
is darkened from the parent site for readable small links and white button text.
Control boundaries use --control-border (#8B8277 light, #8C8172 dark) so inputs
and buttons remain identifiable against their surfaces.
Blue means a representation or selected option, green means a checked answer,
and red means a correction. Each has a textual equivalent.

## Typography

Locally bundled Newsreader headings, Inter prose, and JetBrains Mono labels/code.
System fallbacks work if fonts fail. Body measure 68ch, 18px with 1.7 line height;
labels 12–14px. Display headings use regular weight, capped at 64px (60px in
the split home hero) and 40px on mobile. Card headings use 20px/1.35 semibold
Inter, summaries 16px/1.65, and category/level labels 13px Inter. Reserve mono
for short utility labels and code; the home example uses 14px code. No text that
matters is embedded only in a diagram.

## Layout

The home page opens with a real example, Explore/Learn/Apply links, and a useful
task selection. Desktop entry pages use a quiet sticky contents rail alongside
one reading column; examples can use the full column. At 760px the rail becomes
an ordinary details disclosure. Cards form two columns above 760px, one below.
The page scrolls naturally. Tables/code alone may scroll horizontally.
Task cards have complete borders and 20–24px padding, with compact serif titles
and 15px descriptions. All card actions align at the bottom of their grid row;
content remains natural height without clipping or fixed card heights.

## Elevation & Depth

Use borders and surface shifts, not floating glass. Reserve a restrained shadow
for the reset dialog. Reading and drill panels remain stable during feedback.

## Shapes

Six-pixel control corners and twelve-pixel panel corners. Avoid pill-shaped
navigation. Hover and visible focus communicate actual links and buttons.

## Components

Shared render functions own header, breadcrumbs, entry card, section headings,
example panel, drill form, source list, table, and footer. assets/app.js owns all
interactive behavior. Dark mode follows localStorage.theme then OS preference.
For color-token drift, test the six normative variables against this document.

## Do's and Don'ts

Use the same facts across switched representations. Explain what a view hides.
Use original SVG only where relationships benefit; preserve DOM text equivalents.
Respect reduced motion, keyboard navigation, 320px reflow, 200% zoom, and print.
Print includes answer explanations and all case representations; controls hide.
Never imply that a polished format verifies truth, compliance, or mastery.
