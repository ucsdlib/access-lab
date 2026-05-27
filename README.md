# The Access Lab

An experiential introduction to digital accessibility for UC San Diego Library staff. Four interactive stations let users encounter real accessibility barriers — white-on-white text, image-only document scans, mouse-only interactive elements — and understand why they exist and what fixes them.

Built on the UC San Diego DX Tools design system. No build step, no framework, no dependencies beyond the files in this repo.

---

## What it is

The Access Lab is a single-page educational tool. A patron, staff member, or workshop participant works through four stations in order, each presenting a real accessibility scenario and asking them to interact with it directly before explaining the underlying issue.

The goal is experiential, not instructional. Users encounter the barrier first, then learn why it exists — rather than being told about it abstractly.

---

## The four stations

### 01 — The Color Challenge
A library hours display rendered as white text on a white background. Visually invisible; perfectly readable by a screen reader. Demonstrates that accessibility gaps are often mismatches between how content is stored and how a particular reader receives it.

**Interactive elements:** "Simulate screen reader" panel with Web Speech API playback; "Reveal to sighted reader" color transition; live accessibility status badges.

### 02 — The Image Trap
An ILL-delivered article citation, toggled between image-only and OCR text modes. Both look identical on screen. Only the OCR version can be read aloud, copied, cited, or searched. Demonstrates that scanning without OCR delivers a photograph of information, not information.

**Interactive elements:** Image/OCR mode toggle; "Try to copy DOI" and "Search for advocacy" actions with success/failure feedback; screen reader simulation showing what a screen reader announces in each mode.

### 03 — Keyboards and Mice
A simulated library services menu with four items. Three are `<button>` elements, reachable by Tab. One is a `<div>` with an `onclick` — visually identical but unreachable by keyboard. Demonstrates that `onclick` on a non-semantic element does not make it keyboard-accessible.

**Interactive elements:** Keyboard-navigable service items; per-item feedback messages; "Show what's happening" explanation with inline code comparison.

### 04 — The Full Picture
A comparison table connecting the patterns from all three stations: white-on-white, image-only scan, OCR scan, mouse-only element, and properly semantic HTML — scored across visual, screen reader, copy/cite, keyboard, and search access. Closes with a framing statement about accessibility as mission, not compliance.

**No interactive elements** — fully static.

---

## Running locally

```bash
cd /Users/d2worsham/Code/access-lab
python3 -m http.server 4400
# open http://localhost:4400
```

The `.claude/launch.json` file records this configuration for tooling that reads it.

The tool also works from `file://` — there are no server-side dependencies. The only caveat is that Web Speech API playback (the "Hear it" button in stations 1 and 2) requires a non-`file://` origin in some browsers; Chrome works, Firefox is more restrictive.

---

## File structure

```
access-lab/
├── index.html              ← the entire tool; one page, four tabpanels
├── css/
│   ├── fonts.css           ← @font-face declarations (self-hosted)
│   ├── tokens.css          ← all design tokens (CSS custom properties)
│   ├── frame.css           ← layout, header, typography
│   ├── components.css      ← shared components: buttons, panels, badges, etc.
│   ├── preview.css         ← brand-faithful UC San Diego content scope
│   ├── code.css            ← code blocks
│   └── access-lab.css      ← tool-specific styles only (no system overrides)
├── js/
│   ├── access-lab.js       ← all interaction logic
│   ├── theme.js            ← light/dark toggle (shared system script)
│   ├── lucide.min.js       ← icon library (shared system script)
│   └── code-copy.js        ← code block copy button (shared system script)
├── fonts/                  ← self-hosted woff2 files
├── images/                 ← Geisel Library photos
├── starter/
│   └── template.html       ← blank page template for new tools
├── access-lab.jsx          ← original React prototype (reference only, not used)
├── CLAUDE.md               ← design system reference for Claude Code sessions
└── README.md               ← this file
```

All CSS files except `access-lab.css` are shared with the `dx-tools` design system repo and should not be edited here. Changes to shared files belong in `dx-tools`, then synced here.

---

## CSS architecture

The tool extends the DX Tools design system without forking it. CSS loads in this order:

```html
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/frame.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/preview.css">
<link rel="stylesheet" href="css/code.css">
<link rel="stylesheet" href="css/access-lab.css">  ← tool layer, last
```

`access-lab.css` should only contain:
- Patterns not covered by the shared system
- Tool-specific component classes (`.al-*`)
- No overrides of design tokens at `:root` unless there is a documented reason

**What NOT to do in `access-lab.css`:** override `--color-accent`, `--color-focus`, or other global tokens at `:root`. This affects every interactive element on the page, including focus rings, button states, and the station tabs. If a specific element needs a brand color other than the default accent, target that element directly using `--color-secondary` (Brand Gold/Citron) or an explicit token value. See the history of the amber override below.

---

## Key design decisions

### Default theme: light
The FOUC prevention script defaults to light mode:
```js
const t = localStorage.getItem('dx-theme');
document.documentElement.setAttribute('data-theme', t || 'light');
```
This matches the design system rule ("always fall back to light, never dark"). The theme toggle works and persists across sessions.

### No sidebar, full-width layout
The tool uses `dx-doc-body--no-sidebar` (no sidebar, constrained main width). The intro text is wrapped in `.dx-content` to preserve readable line length; the station component fills the full content width.

### Challenge areas use `preview-container`
Each interactive station uses the design system's `preview-container` / `preview-toolbar` chrome to frame the simulation as a real web page. The pattern is:
```
preview-container.al-challenge-frame
  preview-toolbar           ← label + controls/badges in toolbar
  al-preview-display        ← the interactive/simulation content
  al-preview-controls       ← action buttons + result messages
[al-sr-panel]               ← screen reader simulation, OUTSIDE the container
```

The SR panel lives outside `preview-container` because it is a tool UI element, not a simulation of web content.

### Intentional inaccessibility is documented in the HTML
Each deliberately inaccessible element carries a comment explaining that it is intentional and why. Do not "fix" these:

- **Station 1** — `.al-hidden-text` starts as white text on white background. The initial `color: white` is the lesson.
- **Station 2** — `.al-citation.is-image-mode` has `user-select: none` and a sepia/contrast filter. Do not add alt text or `aria-label` to bridge the gap.
- **Station 3** — `<div onclick="...">` with no `tabindex`. Do not add `tabindex`. The unreachability is the lesson.

Everything outside the challenge demos aims for WCAG 2.1 AA minimum, targeting AAA (7:1 contrast) for text.

### `--color-secondary` for callout panels, not `--color-accent`
The "What this reveals" insight panels and the Station 4 reframe eyebrow use `--color-secondary` (Brand Gold in light mode, Citron in dark mode) for their warm tint. `--color-accent` is reserved for interactive elements (buttons, focus rings, selected states). Using secondary for editorial callouts is semantically correct and avoids global side effects.

---

## JS architecture (`access-lab.js`)

All state lives in one object:
```js
const state = {
  station: 0,
  s1: { revealed: false, srOn: false, speaking: false },
  s2: { mode: 'image', srOn: false, copyResult: null, searchResult: null, speaking: false },
};
// s3 state uses plain vars (simpler for the onclick-on-div pattern)
let s3Selected = null;
let s3Revealed = false;
```

Pattern: events call state mutations, then call `renderSN()`. Render functions read state and update the DOM. No framework, no virtual DOM — direct property and class manipulation.

`window.selectItem` is deliberately exposed as a global so Station 3's `<div onclick>` can call it. This is the only global function; everything else is module-scoped via `'use strict'`.

Station navigation uses the ARIA APG tablist pattern:
- Arrow Left/Right cycle between tabs (wrapping)
- Home/End jump to first/last tab
- Tab change moves focus to the incoming panel's `<h2>` (for keyboard and screen reader users)
- Roving `tabindex`: selected tab = `0`, all others = `-1`

---

## Design system relationship

The CSS files in `css/` (except `access-lab.css`) are copies of files from the `dx-tools` design system repo at `../dx-tools/`. The access lab is a consumer of that system.

When the design system is updated, sync the shared CSS files here. When you find a gap in the design system that requires a workaround in `access-lab.css`, the right fix is to address it in `components.css` (or the appropriate shared file), then remove the workaround.

**Component gaps found and fixed during Access Lab development:**

The station component (`components.css`) was missing several properties that were being applied via inline styles in the docs demo or contributed by the `.dx-demo` documentation wrapper. These have been moved into the component definition:
- `background-color: var(--color-surface)` on `.station`
- `border-radius: var(--radius-lg)` and `overflow: hidden` on `.station` (for corner clipping)
- `margin: 0` on `.station__nav`
- `padding: var(--space-6) var(--space-8) 0` on `.station__panels`
- Corrected `margin` and `padding` on `.station__footer`

A broader audit prompt for finding similar issues in other components is in the session history — this pattern (inline styles in demo HTML, visual properties contributed by the `.dx-demo` wrapper, mismatch between canonical usage code and rendered output) may affect other components.

---

## History: the amber override

The original React prototype (`access-lab.jsx`) used amber (`#f59e0b`) as its accent color. An early version of `access-lab.css` carried this over by overriding `--color-accent`, `--color-focus`, `--shadow-featured`, and related tokens at `:root`. This affected every interactive element globally — buttons, focus rings, selected states, and the station tab active indicator.

This override was removed. The DX Tools design system's validated accent colors (UC San Diego Blue in light mode, Turquoise in dark mode) are used throughout. The only warm-tone exception is `--color-secondary` on the insight panel backgrounds and the reframe eyebrow, where a warm callout color is editorially appropriate and the secondary slot is the right semantic choice.

If you encounter a future suggestion to add a global `:root` accent override, the decision against it is intentional.
