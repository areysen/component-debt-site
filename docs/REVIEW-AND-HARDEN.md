# Handoff: tokenize, harden, and make responsive

Paste everything below the line into Claude Code (Sonnet is fine) from inside the
`component-debt-site` repo. This is a pre-ship hardening pass. The site is the
proof-of-work for a design system auditor, so the source has to survive a prospect
opening DevTools.

Work in small commits, one numbered section at a time, and keep `npm test` green after
each (it runs `astro check`, `astro build`, and the contrast/prose/links guards). Follow
`CLAUDE.md`: no em-dashes, no banned words, no emojis, claims must be defensible.

**Do not touch demonstration content.** The homepage demos intentionally contain "bad"
hardcoded values as teaching examples. Never tokenize or "fix" these hex values:
`#2f6fed`, `#2e6fed`, `#3170ee` (the three "brand blues" in the token demo) and `#5b9bd5`,
`#2c6ca6` (the failing/passing contrast samples). They must stay as literals.

---

## 1. Token architecture (highest priority, this is the embarrassing one)

Findings from the current code:
- No spacing, radius, or type-scale tokens exist. Around 430 hardcoded px values.
- The terracotta accent `#e07a5f` is written as a literal **18 times**; `#e6ddd0` **8
  times**; `#cfc6b8` **8 times**; `#d6cdc0` **6 times**. These are de-facto tokens.
- Existing tokens are bypassed with raw hex: `#3d1a45` (= `--accent`), `#5a2c66`
  (= `--accent2`), `#2a2622` (= `--ink`/`--body`) appear as literals.

### 1a. Add the missing tokens to `:root` in `src/styles/global.css`

Color (de-facto tokens, document each):
```css
--accent-warm: #e07a5f;  /* terracotta, kicker + endcta accents on the dark band */
--on-dark: #e6ddd0;      /* warm off-white body text on the gradient/header */
--on-dark-dim: #cfc6b8;  /* dimmer on-dark text (captions on gradient) */
--on-dark-soft: #d6cdc0; /* softer on-dark body text */
```
Spacing scale (4px base):
```css
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 72px;
```
Radius scale:
```css
--radius-sm: 6px; --radius-md: 11px; --radius-lg: 18px; --radius-pill: 999px;
```
Type scale (document; map existing sizes to the nearest step):
```css
--text-xs: 12px; --text-sm: 13px; --text-base: 15px; --text-md: 17px;
--text-lg: 21px; --text-xl: 28px; --text-2xl: 34px;
```

### 1b. Value-preserving replacements (do these everywhere, zero visual change)

These are exact swaps, so the rendered output must not change. Apply across
`src/styles/global.css`, `src/pages/index.astro`, `src/pages/audit.astro`,
`src/pages/sample-report.astro`:
- `#e07a5f` -> `var(--accent-warm)`
- `#e6ddd0` -> `var(--on-dark)`
- `#cfc6b8` -> `var(--on-dark-dim)`
- `#d6cdc0` -> `var(--on-dark-soft)`
- `#3d1a45` -> `var(--accent)` (chrome only, not demo)
- `#5a2c66` -> `var(--accent2)` (chrome only, not demo)
- `#2a2622` -> `var(--ink)` (chrome only, not demo)

After this, grep each file: the only bare hex left should be the do-not-touch demo
values, `#fff`/`#ffffff`, and any one-off surface tints. Replace `#ffffff`/`#fff` used as
a surface with `var(--card)` where it semantically means the card surface (leave it as
`#fff` where it means "white on the dark band").

### 1c. Spacing / radius / type conversion (DESIGN DECISION, flag before committing)

Converting the ~430 hardcoded px to the scales above means snapping some values (e.g.
`13px`, `14px`, `46px`, `54px`) to the nearest token step, which changes pixels. Do NOT
silently snap. Instead:
1. Convert the values that already match a scale step exactly (e.g. `16px` ->
   `var(--space-4)`, `12px` -> `var(--space-3)`, `18px` -> `var(--radius-lg)`).
2. For values that do not match a step, leave them and add a `/* TODO: snap to scale */`
   comment, then list them in your summary so Andrew can approve the snapping.

Do not change the contrast guard pairs in `scripts/check-contrast.mjs` unless a color
value actually changes (it should not, since 1b is value-preserving). Re-run the guard.

## 2. Component API consistency

The homepage (`index.astro`) uses its own section-header pattern (`.seclabel` +
`.sectitle`) while `audit.astro` and `sample-report.astro` use the global `h2`. That is
two patterns for one job. Pick one:
- Preferred: promote `.seclabel` + `.sectitle` to `global.css` as the shared section-header
  component and use it on all three pages, OR
- If the homepage is meant to be visually bolder than the interior pages, keep both but add
  a comment in `global.css` documenting that `.sectitle` is the display-scale section
  header and `h2` is the compact one, so the split is intentional and discoverable.

Audit the toggle buttons (`.toggle button`) and confirm they reuse focus/disabled patterns
consistently with `.cta`; if not, align them.

## 3. Accessibility (WCAG 2.1 AA)

- **Defensible-claim fix:** in the accessibility demo (check 03) the copy says "Tab in to
  see real focus states," but the contrast samples are non-interactive `<div>`s. Either make
  the focus claim accurate (it is not worth making the samples fake-interactive) or reword.
  Suggested: drop that sentence and end on "the verdict is shown by label, not color alone."
- **Heading hierarchy:** on the homepage the dogfood section title is an `<h3>` sitting among
  `<h2>` section titles, with `<h4>` children. Promote it to `<h2>` and re-level its three
  column labels from `<h4>` to `<h3>` so levels increase by one with no skipped peer.
- Re-verify: single `h1` per page, logical order, skip link works, every interactive element
  has a visible focus ring on its background (check the toggle buttons and CTAs on the dark
  band specifically), and the grid-stack inactive demo views stay out of tab order
  (`visibility: hidden` is correct, confirm no `tabindex` leaks).

## 4. Documentation

- Add `docs/design-tokens.md`: list every token (color, spacing, radius, type) with its
  purpose and value, and note the do-not-touch demo values. This is the artifact a
  maintainer (or a prospect) should be able to read instead of grepping.
- The `index.astro` scoped `<style>` block is ~700 lines. Add short section comments
  (`/* ===== Hero ===== */`, `/* ===== Check demos ===== */`, etc.) so it is navigable.

## 5. Responsive: test and fix at 375 / 768 / 1280

Use real DevTools device emulation (responsive mode), not OS window resize. For each
breakpoint, load `/`, `/audit`, `/sample-report`, `/intake` and check:
- **No horizontal overflow.** `document.documentElement.scrollWidth` must equal the viewport
  width at each size. Find and fix any element wider than the viewport.
- **Nav:** at 375px the header stacks (it goes column at 680px). Confirm the links are
  reachable and not clipped; consider whether a 4-item stacked nav is acceptable or needs a
  more compact treatment.
- **Hero:** the 34px h1 drops to 28px at 680px. Confirm the headline, sub, and CTAs do not
  collide or overflow at 375px; the two CTAs should stack cleanly (`.cta.secondary` already
  resets its left margin under 680px).
- **The four demos at 375px (this is the risk area):**
  - Token demo: the three swatches (`.swatches`, flex-wrap) should wrap without clipping; the
    grid-stack (`.swap`) reserved height should still hold with no reflow on toggle.
  - Button drift: six buttons wrap; confirm they do not overflow the `.stagebig` padding.
  - Contrast samples: `.cgrid` collapses 1fr/1fr -> 1fr at 520px; confirm the two samples
    stack and the verdict badges stay readable.
  - Component spec: the `11ch 1fr` grid; confirm long values (`--color-brand, --space-3,
    --radius-md`) wrap inside the value column without pushing width.
  - The full-bleed `.check` rows go single-column at 880px; confirm the copy/demo order reads
    sensibly stacked.
- **Section grids:** `.offer` (2->1 at 760), `.systable` (3->1 at 680), `.scoreband` (->2col
  at 680). Confirm no cramped 2-up layouts at 375.
- **Ticker:** confirm the symptom marquee does not cause horizontal scroll on mobile.
- **Intake:** confirm the Tally iframe fills height and does not introduce a second scrollbar
  at 375px.

Report every fix with the breakpoint and selector. Flag any layout that needs a real design
decision (e.g. a mobile nav pattern) rather than guessing.

## Definition of done

- `npm test` green (check, build, all three guards).
- No bare hex left in chrome except `#fff`/`#ffffff` and the documented do-not-touch demo
  values. Spacing/radius/type partially tokenized, with the un-snapped values listed for
  Andrew.
- `docs/design-tokens.md` exists.
- All four pages clean at 375 / 768 / 1280, no horizontal overflow, demos functional.
- A short summary listing: what was tokenized, what still needs snapping approval, the
  responsive fixes made, and anything flagged for a design decision.
