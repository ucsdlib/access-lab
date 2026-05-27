# DX Tools Design System — Claude Reference

This file is read automatically by Claude Code. It gives Claude the context needed to build and update UC San Diego DX team tools using this design system without re-explaining conventions each session.

---

## What this repo is

`dx-tools` is the UC San Diego DX team's internal design system — plain CSS + static HTML, no build tooling. It applies the UC San Diego campus brand specifically for internal tool interfaces (not the marketing website). The brand is deliberately inverted: accent colors (Turquoise, Citron) become interactive primaries; structural brand colors (Navy, Blue) provide depth.

The documentation site lives here too (`docs/*.html`). When building a new tool, the tool pages live at the repo root alongside `css/`, `js/`, `fonts/`.

---

## CSS architecture

Five files, loaded in this order:

```
css/tokens.css     — all design tokens (CSS custom properties), dark + light modes
css/frame.css      — tool structure: header, sidebar, main area, body typography
css/components.css — shared components: buttons, panels, badges, alerts, tables, modals
css/preview.css    — brand-faithful UC San Diego content scope (.dx-preview)
css/code.css       — code blocks, inline code, syntax scaffolding
```

Also: `css/fonts.css` (self-hosted @font-face declarations, references `../fonts/*.woff2`)

### Key rule: `:where()` and specificity
`frame.css` uses `:where(.dx-main)` on link rules to keep their specificity low (0,1,1). This ensures `preview.css` selectors at 0,2,0+ always win inside `.dx-preview`. **Never remove `:where()` from frame link rules** — doing so would cause frame colors to leak into preview nav links.

---

## Two scopes: frame and preview

**Frame scope** (`.dx-main`, `.dx-frame`):
- Tool's own UI — header, sidebar, controls, panels, tables, alerts
- Atkinson Hyperlegible font
- Dark mode by default; light mode via `[data-theme="light"]`
- Accent: Turquoise `#00C6D7` (dark) / UC San Diego Blue `#00629B` (light)

**Preview scope** (`.dx-preview`):
- Brand-faithful UC San Diego content shown to the user
- Always light, never inherits dark mode
- Roboto font
- Navy headings `#182B49`, Blue links `#00629B`, Gold/Yellow accents

When adding nav or structural links inside `.dx-preview`, **always use a double-class selector** (e.g. `.dx-preview .your-nav__link`) to reach specificity 0,2,0. Never rely on a single-class selector inside preview — it will lose to the frame's link rule.

---

## Page layout structure

Every page uses this HTML shell:

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div class="dx-doc-layout">
    <header class="dx-header" role="banner">
      <a href="..." class="dx-header__brand" aria-label="...">
        <span class="dx-header__mark" aria-hidden="true">DX</span>
        <span class="dx-header__wordmark">Tool Name</span>
      </a>
      <nav class="dx-header__nav" aria-label="...">
        <a href="..." class="dx-header__nav-link" aria-current="page">...</a>
      </nav>
      <div class="dx-header__actions">
        <!-- theme toggle button goes here -->
      </div>
    </header>
    <div class="dx-doc-body">
      <nav class="dx-sidebar" aria-label="...">...</nav>  <!-- optional -->
      <main id="main" class="dx-main">
        <span class="eyebrow">Section label</span>
        <h1 class="page-title">Page title</h1>
        <p class="lead">One-sentence description.</p>
        <!-- sections -->
      </main>
    </div>
  </div>
  <script src="js/lucide.min.js"></script>
  <script src="js/theme.js" defer></script>
</body>
```

---

## FOUC prevention

This inline script **must be the first thing in `<head>`, before any stylesheet**:

```html
<script>const t=localStorage.getItem('dx-theme');document.documentElement.setAttribute('data-theme',t||'light');</script>
```

It reads the stored theme and applies it before CSS loads. Without it, dark-mode users see a flash of light mode (or vice versa). The default is `'light'` — always fall back to light, never dark.

---

## Design tokens (key names)

```css
/* Colors */
--color-bg               /* page background */
--color-surface          /* card/panel background */
--color-surface-raised   /* toolbar, sidebar background */
--color-border           /* default border */
--color-border-strong    /* prominent border */
--color-text             /* primary text */
--color-text-muted       /* secondary text */
--color-text-subtle      /* tertiary (= muted in practice; 3-tier AAA is impossible) */
--color-accent           /* primary interactive color */
--color-accent-hover     /* accent on hover */
--color-accent-muted     /* accent tinted background */
--color-focus            /* focus ring color */
--color-danger           /* error/destructive */
--color-danger-muted     /* danger tinted background */
--color-danger-text      /* readable text on danger-muted */
--color-success          /* success state */
--color-success-muted
--color-success-text
--color-warning-muted
--color-warning-text

/* Brand (used only in .dx-preview) */
--brand-navy   /* #182B49 */
--brand-blue   /* #00629B */
--brand-gold   /* #C69214 */
--brand-yellow /* #FFCD00 */

/* Typography */
--font-frame     /* Atkinson Hyperlegible */
--font-preview   /* Roboto */
--font-code      /* JetBrains Mono */
--text-xs        /* 14px */
--text-sm        /* 16px */
--text-base      /* 18px */
--text-md        /* 20px */
--text-lg        /* 24px */
--text-xl        /* 30px */
--text-2xl       /* 40px */
--text-3xl       /* 52px */
--text-code      /* 14px */

/* Spacing (4px base) */
--space-1  /* 4px */   --space-2  /* 8px */   --space-3  /* 12px */
--space-4  /* 16px */  --space-5  /* 20px */  --space-6  /* 24px */
--space-8  /* 32px */  --space-10 /* 40px */  --space-12 /* 48px */
--space-16 /* 64px */

/* Radius */
--radius-sm  /* 4px */   --radius-md  /* 6px */
--radius-lg  /* 8px */   --radius-xl  /* 12px */  --radius-full /* 9999px */

/* Shadows */
--shadow-sm  --shadow-md  --shadow-lg
--shadow-featured  /* used on .panel--featured */

/* Transitions */
--t-fast  /* 120ms */   --t-base  /* 200ms */   --t-slow  /* 350ms */

/* Touch targets */
--target-sm  /* 36px */   --target-md  /* 44px */   --target-lg  /* 52px */
```

---

## Component classes

### Buttons
```html
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--subtle">Subtle</button>
<!-- Sizes: btn--sm (36px), default (44px), btn--lg (52px) -->
<!-- Icon-only: btn--icon (square, 44px) -->
<!-- Disabled: disabled attribute only, never opacity tricks -->
```

### Badges
```html
<span class="badge">Default</span>
<span class="badge badge--success">Success</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--danger">Danger</span>
<span class="badge badge--info">Info</span>
<span class="badge badge--neutral">Neutral</span>
```

### Alerts
```html
<div class="alert alert--info" role="status">
  <svg class="alert__icon" ...></svg>
  <div class="alert__body">
    <strong class="alert__title">Title</strong>
    <div class="alert__desc">Message</div>
  </div>
</div>
<!-- Variants: alert--info, alert--success, alert--warning, alert--danger -->
<!-- Use role="alert" for urgent messages, role="status" for informational -->
```

### Panels
```html
<div class="panel">
  <div class="panel__header">
    <div class="panel__icon"><!-- optional Lucide icon --></div>
    <h3 class="panel__title">Title</h3>
    <span class="badge">Optional badge</span>
  </div>
  <div class="panel__body">Content</div>
  <div class="panel__footer">
    <button class="btn btn--primary btn--sm">Action</button>
  </div>
</div>
<!-- Featured: add panel--featured (accent shadow ring) -->
```

### Tables
```html
<div class="table-wrap">
  <table class="table table--bordered">
    <thead><tr><th>Col</th></tr></thead>
    <tbody><tr><td>Value</td></tr></tbody>
  </table>
</div>
<!-- table--bordered, table--striped -->
```

### Forms
```html
<div class="form-group">
  <label class="form-label" for="id">Label</label>
  <input class="form-input" id="id" type="text">
  <p class="form-hint" id="id-hint">Helper text</p>
</div>
<!-- Error state: add form-group--error, form-input--error -->
<!-- Always wire aria-describedby to hint/error message id -->
```

### Preview container
```html
<div class="preview-container">
  <div class="preview-toolbar">
    <div class="preview-toolbar__dots" aria-hidden="true">
      <span class="preview-toolbar__dot"></span>
      <span class="preview-toolbar__dot"></span>
      <span class="preview-toolbar__dot"></span>
    </div>
    <span class="preview-toolbar__label">Preview</span>
  </div>
  <div class="dx-preview dx-preview--padded">
    <!-- Brand-faithful UC San Diego content here -->
    <!-- Nav links MUST use .preview-nav__link class (not bare <a>) -->
  </div>
</div>
<!-- Modifiers: preview-container--stage (Navy bg), data-viewport="mobile|tablet" -->
```

### Icons (Lucide)
```html
<i data-lucide="icon-name" width="20" height="20" aria-hidden="true"></i>
<!-- Icons are decorative by default — always aria-hidden="true" -->
<!-- For standalone icon buttons, put aria-label on the <button>, not the icon -->
<!-- lucide.createIcons() is called in theme.js — no manual init needed -->
```

---

## Accessibility requirements (non-negotiable)

- **Text contrast**: 7:1 minimum for all body text (WCAG AAA). Use token colors — they're pre-validated.
- **Touch targets**: 44px minimum on all interactive elements. Use `--target-md` token.
- **Focus rings**: Never remove `outline` on `:focus-visible`. The `--color-focus` token provides 3px high-visibility ring.
- **No color-only information**: Every state (error, warning, success) uses icon + label + color.
- **ARIA**: `role`, `aria-label`, `aria-current`, `aria-expanded`, `aria-controls` — use the correct pattern. Follow APG patterns for interactive widgets.
- **Semantic HTML**: Use `<nav>`, `<header>`, `<main>`, `<section aria-labelledby="...">`. No div-soup.
- **Skip links**: Every page must have `<a href="#main" class="skip-link">Skip to main content</a>` as the first element in `<body>`.
- **Reduced motion**: All animations are already wrapped in `@media (prefers-reduced-motion: reduce)`. Keep them there.

---

## What NOT to do

- Do not use `left-border` accent stripes on panels — this is an "AI design tell". Use `panel--featured` (shadow ring) instead.
- Do not use gradient fills on buttons.
- Do not use `!important` to fight specificity — understand and fix the root cause.
- Do not hardcode colors in inline styles when a token exists.
- Do not use `disabled` attribute styling for "inactive" states — only use it for genuinely disabled controls.
- Do not add `aria-hidden="true"` to interactive elements.
- Do not remove `:where()` from the `.dx-main` link rule in `frame.css`.
- Do not use `@media (prefers-color-scheme: dark)` without also handling `[data-theme]` — the manual toggle must always override the system preference.

---

## Adding a new page

1. Copy `starter/template.html` to the repo root (or `docs/` for documentation pages)
2. Update `<title>`, the `<h1>`, and the lead paragraph
3. Add the page to the `<nav class="dx-header__nav">` on all other pages
4. Update the sidebar of `index.html` if it links to doc pages
5. All sections should be `<section class="dx-section" id="..." aria-labelledby="...">` with a matching `<h2 id="...">`

---

## Theme toggle wiring

`js/theme.js` handles the toggle button automatically via `[data-theme-toggle]` attribute. The button state (`aria-label`, `aria-pressed`) is also updated. The FOUC script reads from `localStorage` key `dx-theme`. Values: `'light'` or `'dark'`. Default: `'light'`.

---

## File paths when used outside this repo

If dx-tools is a git submodule at `design-system/`:
```html
<link rel="stylesheet" href="design-system/css/fonts.css">
<link rel="stylesheet" href="design-system/css/tokens.css">
...
<script src="design-system/js/lucide.min.js"></script>
<script src="design-system/js/theme.js" defer></script>
```

If dx-tools is a sibling repo at `../dx-tools/`:
```html
<link rel="stylesheet" href="../dx-tools/css/fonts.css">
```
