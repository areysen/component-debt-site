# Build prompt: rebuild the homepage as Variant B ("system as the art")

Paste everything below the line into Claude Code from inside the `component-debt-site`
repo. It rebuilds the homepage only. It does not change the palette, the fonts (except
adding one monospace face), the Layout, or the other pages.

---

## Context and intent

The current homepage (`src/pages/index.astro`) is the original layout: four text-only
pillar cards and two plain offer cards. That is what we are replacing. The new homepage
follows a concept called **"system as the art"**: the page demonstrates design-system
work instead of describing it. The four "what the audit checks" pillars become **live,
interactive demonstrations**, and a real graded finding appears on the page as proof.

There is a complete reference build at **`docs/variant-b-reference.html`**. Open it and
read it fully before writing code. It contains the exact section order, copy, demos,
interactions, and accessibility structure to reproduce. Your job is to reproduce its
**structure and behavior**, re-skinned to this repo's existing tokens.

**This is a layout and interaction port, not a recolor.** The reference file is teal and
amber because it predates this repo's palette. Ignore its specific colors. Keep this
repo's plum/cream/Fraunces identity exactly as defined in `src/styles/global.css`.

## Hard constraints (do not violate)

- **Do not edit the token palette** in `src/styles/global.css` (`:root` variables). Reuse
  the existing tokens. You may add new component CSS, but not redefine the palette.
- **Reuse `Layout.astro` as-is.** It already provides the header, nav, skip link, `<main>`,
  and footer. Build only the page body that goes in the `<slot />`. Do **not** add a second
  nav, footer, or skip link inside the page.
- **Keep `npm test` green.** That runs `astro check`, `astro build`, and the three guards
  (`check-contrast.mjs`, `check-prose.mjs`, `check-links.mjs`). Treat a red test as not done.
- Follow `CLAUDE.md`: no em-dashes anywhere (grep the em-dash character before declaring
  done), none of the banned words, no emojis, full forms in formal copy. Severity and
  state never by color alone.

## Palette and font mapping (reference color -> this repo)

Use this mapping when porting. All targets already exist in `global.css` or are added below.

| Reference (Variant B) | Use in this repo |
| --- | --- |
| night `#0b2129` / `#0f2c37` (dark bg) | the gradient dark stop `--grad-ink` `#1c1a18`, and `--grad` for bands |
| cream `#faf6ef` (light section bg) | `--bg` `#f7f4f0` |
| white cards | `--card` `#ffffff` |
| amber accent `#f0a91c` | **monochrome:** on dark use sand `#e8d5b0`; on light use plum `--accent` `#3d1a45` / `--accent2` `#5a2c66`. Do not introduce a new vibrant accent (see decision note). |
| body / muted text | `--body`, `--muted` |
| severity + status colors | the existing `--crit-*`, `--warn-*`, `--low-*`, `--ok-*` tokens and `.sev` rules in `global.css` |
| Space Grotesk (display) | **Fraunces**, this repo's `--display` |
| Inter (body) | **Plus Jakarta Sans**, this repo's body font |
| JetBrains Mono | **add it** (see below). Used for token names, code, labels, numerals. |

**Add one font: JetBrains Mono.** In `Layout.astro`, extend the existing Google Fonts
`<link>` to include `JetBrains+Mono:wght@400;500;700`. Add `--mono: "JetBrains Mono",
ui-monospace, Menlo, Consolas, monospace;` to `:root` in `global.css`. This is the only
font and only `:root` addition allowed.

### Decision note (default chosen, override only if Andrew says so)

The reference uses a vibrant amber to break its monochrome. This repo is deliberately
monochrome plum, and the Fraunces serif plus warm cream already give it a distinct, non
generic look. **Default: stay monochrome.** Map amber emphasis to sand (on dark) and plum
(on light) per the table. If a vibrant accent is wanted later, that is a separate change:
it must be added as a token in `global.css` and as new pairs in `check-contrast.mjs`. Do
not add it as part of this task.

## Sections to build, in order

Reproduce these from `docs/variant-b-reference.html`. Reuse copy verbatim (it already
passes the prose guard). Re-skin to repo tokens.

1. **Hero.** Dark gradient band (`--grad`). Kicker, large Fraunces headline, sub, two CTAs
   (reuse `.cta` / `.cta.secondary`), price line. Behind the headline: the animated token
   grid motif (decorative, `aria-hidden`, a CSS grid of cells, a few pulsing). Below the
   hero: the symptom **ticker** (decorative, `aria-hidden`, marquee of friction phrases).
2. **What the audit checks.** A short intro (label, Fraunces title, lede), then **four
   full-bleed alternating rows**, numbered 01 to 04 with large decorative numerals
   (`aria-hidden`, monospace). Each row pairs copy on one side with a **live demo** on the
   other:
   - **01 Token architecture:** three near-identical blue swatches with a toggle that
     collapses them to one `--color-brand` token. (The blues are demo content, keep them.)
   - **02 Component API consistency:** six visually different "Save" buttons with a toggle
     to one canonical button.
   - **03 Accessibility:** two contrast samples side by side, one failing (white on
     `#5b9bd5`, ~2.6:1), one passing (white on `#2c6ca6`, ~4.6:1), each with a verdict shown
     by **icon plus label plus color**, not color alone. See the intentional-fail note below.
   - **04 Documentation:** a monospace component spec (component, variants, sizes, tokens,
     a11y).
3. **Evidence ("What you get").** Light band. A scorecard (overall health `C-`, 10 findings,
   6 button variants, 0 token files) and one real finding card `DS-01` with the code sample,
   using the existing `.sev` severity badge (shape plus label). Pull this from the reference.
4. **The offer.** Two tiers, reuse the existing `.offer` / `.tier` markup and copy already
   in the current `index.astro`. Keep `$2,500` and `$6k-$15k` (en-dash, not em-dash).
5. **Dogfood strip.** Dark band: "This page runs on the same kind of token system the audit
   looks for," with the type scale, spacing scale, and color-token columns.
6. **How to start.** Reuse the existing copy and the `mailto` CTA from the current
   `index.astro` (the `MAILTO_AUDIT` const). Keep the "Intake form (coming soon)" placeholder.

## Interactions (vanilla JS, in the page)

From the reference: the **token toggle**, the **button toggle**, the **scroll reveal**
(IntersectionObserver adding an `in` class), and the **hero grid** generation. Put this in
a single `<script>` in `index.astro` (Astro will bundle it). All motion must be disabled
under `@media (prefers-reduced-motion: reduce)`, exactly as the reference does. The toggles
must be real `<button>` elements with `aria-pressed`, keyboard operable.

## Accessibility requirements

- Maintain WCAG AA. Decorative elements (hero grid, ticker, big numerals, the brand glyph)
  get `aria-hidden="true"`.
- Severity and pass/fail are shown by shape or icon plus a text label, never color alone.
- Keep the visible focus ring from `global.css`.
- **Intentional contrast-demo fail:** the failing sample in demo 03 (white on `#5b9bd5`) is
  meant to fail; it is the demonstration, labeled "FAIL 2.6:1." Do **not** "fix" it, and do
  **not** add it to `check-contrast.mjs` (that guard is for real site chrome, not demo
  content). Mark the sample's inner visual text `aria-hidden` so its meaning is carried by
  the adjacent verdict label, and a scanner has nothing real to flag.

## Guards: update them, do not weaken them

- For every **new real (non-demo) color pair** you introduce (for example the dark code
  block background `#0f2630` with its text, any sand-on-gradient label, the dogfood text on
  the dark band), add a matching entry to the `PAIRS` array in
  `scripts/check-contrast.mjs` so the ratio is checked. Do not add demo-content pairs.
- Record any new pairs in `docs/accessibility/contrast-report.md` (the existing artifact).
- Run `npm run test:guards` and `npm run build`. Fix anything red.

## Definition of done

- `npm test` passes (check, build, all three guards).
- No em-dash character anywhere in changed files (grep to confirm).
- The homepage visually matches `docs/variant-b-reference.html` in **structure, section
  order, demos, and interactions**, re-skinned to plum/cream/Fraunces with the monospace
  layer. Not a color match to the reference.
- Header, nav, footer, and skip link still come from `Layout.astro` (not duplicated).
- All four demos work with keyboard and respect reduced motion.
- Stop and report if the monochrome-vs-accent decision needs Andrew before you can finish.

Work in small commits: fonts and tokens first, then hero, then the four check rows, then
evidence, offer, dogfood, start. Run the build after each section so a regression is easy
to locate.
