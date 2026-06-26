# Design tokens

Reference for every CSS custom property defined in `src/styles/global.css`'s
`:root` block, plus the demonstration content on the homepage that must stay
as hardcoded literals. Source of truth is the code; if this doc and
`global.css` disagree, the code wins and this doc is stale.

## Text and surfaces

| Token | Value | Purpose |
| --- | --- | --- |
| `--ink` | `#2a2622` | Headings, strongest text |
| `--body` | `#2a2622` | Body copy |
| `--muted` | `#6b655f` | Secondary / supporting text |
| `--accent` | `#3d1a45` | Dark plum: section labels, prices |
| `--accent2` | `#5a2c66` | Mid plum: links, accents |
| `--bg` | `#f7f4f0` | Page background, warm cream |
| `--card` | `#ffffff` | Card / section surface |
| `--line` | `#e3dccf` | Hairline borders (decorative) |
| `--chip` | `#efe6f0` | Tag / chip background |

## Status and severity

Paired with a text label or shape glyph in every use; never color alone.

| Token | Value | Purpose |
| --- | --- | --- |
| `--good` | `#1f6b3a` | Status text, good state |
| `--warn` | `#8a5a12` | Status text, warning state |
| `--crit-bg` / `--crit-ink` / `--crit-bd` / `--crit-accent` | `#f7e7e2` / `#9a2b1e` / `#e3b8a9` / `#9a2b1e` | Severity: high |
| `--warn-bg` / `--warn-ink` / `--warn-bd` / `--warn-accent` | `#f7eedd` / `#8a5a12` / `#e3cd9e` / `#b9821a` | Severity: medium |
| `--low-bg` / `--low-ink` / `--low-bd` / `--low-accent` | `#efe6f0` / `#3d1a45` / `#d4bcd9` / `#5a2c66` | Severity: low |
| `--ok-bg` / `--ok-ink` / `--ok-bd` | `#e6f0e8` / `#1f6b3a` / `#b9d8c4` | Severity: good |

## Gradient band

| Token | Value | Purpose |
| --- | --- | --- |
| `--grad` | `linear-gradient(135deg, #1c1a18, #3d1a45)` | Hero / cover / end-CTA background. Dark stops are chosen so white text and UI clear AA (4.5:1) across the whole band |
| `--grad-ink` | `#1c1a18` | On-white text matching the gradient's dark stop |

## On-dark text (de-facto tokens)

Colors that were repeated literals on the gradient/header bands before
tokenization, pulled into named tokens so the AA-clearing values have one
definition instead of several copies.

| Token | Value | Purpose |
| --- | --- | --- |
| `--accent-warm` | `#e07a5f` | Terracotta: kicker text and end-CTA accents on the dark band |
| `--on-dark` | `#e6ddd0` | Warm off-white body text on the gradient/header, clears AA on both gradient stops |
| `--on-dark-dim` | `#cfc6b8` | Dimmer on-dark text (captions on gradient) |
| `--on-dark-soft` | `#d6cdc0` | Softer on-dark body text |

## Fonts and layout

| Token | Value | Purpose |
| --- | --- | --- |
| `--display` | `"Fraunces", "Plus Jakarta Sans", system-ui, sans-serif` | Headings |
| `--mono` | `"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace` | Code, prices, captions |
| `--maxw` | `980px` | Page content max-width |

## Spacing scale (4px base)

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-7` | `48px` |
| `--space-8` | `72px` |

## Radius scale

| Token | Value |
| --- | --- |
| `--radius-sm` | `6px` |
| `--radius-md` | `11px` |
| `--radius-lg` | `18px` |
| `--radius-pill` | `999px` |

## Type scale

| Token | Value |
| --- | --- |
| `--text-xs` | `12px` |
| `--text-sm` | `13px` |
| `--text-base` | `15px` |
| `--text-md` | `17px` |
| `--text-lg` | `21px` |
| `--text-xl` | `28px` |
| `--text-2xl` | `34px` |

## Values still un-snapped (need Andrew's approval)

Spacing, radius, and font-size values that do not land on a scale step were
left as bare pixel values with a `/* TODO: snap to scale (...) */` comment
rather than forced onto the nearest token. Forcing them would have changed
the rendered size; snapping is a design decision, not a refactor. Run the
check below any time to get the current, authoritative list (this doc is a
snapshot, the grep is the source of truth):

```sh
grep -rn "TODO: snap to scale" src/
```

As of this pass that is roughly 130 call sites across `global.css`,
`index.astro`, `audit.astro`, and `sample-report.astro`, mostly oddball
values like `13.5px`, `18px`, `26px`, `30px` that sit between two scale
steps. A few are flagged as deliberately off-scale rather than pending
(for example `index.astro`'s `font-size: 16px` body-copy overrides, noted
inline as "not a type-scale step" since 16px is intentionally between
`--text-base` (15px) and `--text-md` (17px) for legibility in dense card
copy). Do not bulk-snap these without a design pass: several are tuned by
eye against a specific layout (the audit-page numbered-step circles, the
sample-report finding cards) and snapping could shift things visibly.

## Intentional bare-hex exceptions

A handful of one-off hex values appear outside `:root` with no matching token.
Each is a single warm-neutral or dark-card variant used in one or two places;
minting a token for a single call site would be premature abstraction. Listed
here so a future grep for bare hex does not mistake them for an oversight.

| Hex | Used for | Where |
| --- | --- | --- |
| `#fbf9f6` | Warm off-white card background, slightly lighter than `--bg` | `audit.astro` deliverable cards, `sample-report.astro` score cards |
| `#f0ebe3` | Warm off-white section background, between `--bg` and `--card` | `index.astro` offer section |
| `#241f1d` / `#f1ece4` | Dark code-block background / on-dark code text (close to but distinct from `--grad-ink` / `--on-dark`) | `index.astro` and `sample-report.astro` `pre.code` |

## Do-not-touch demonstration content

The homepage (`src/pages/index.astro`) teaches design-system concepts by
showing broken examples. These values are the teaching point. Tokenizing or
"fixing" them would make the demo show a token system instead of the drift
it is supposed to illustrate. Each is already marked with a boundary comment
in the source; this is the consolidated list.

### Brand-blue and contrast-demo hex (token-demo section, ~line 95-120, 300, 823-915)

| Hex | Used for |
| --- | --- |
| `#2f6fed` | "Brand blue" sample #1 in the token-drift illustration |
| `#2e6fed` | "Brand blue" sample #2 (one digit off from #1, that's the point) |
| `#3170ee` | "Brand blue" sample #3 |
| `#5b9bd5` | Contrast demo: the failing white-on-blue sample |
| `#2c6ca6` | Contrast demo: the passing white-on-blue sample |

`.driftnote` / `.okline` (the "!" and "OK" callouts under the brand-blue
swatches, ~line 792-801) and `.cverdict.bad` / `.cverdict.good` (the FAIL /
PASS labels under the contrast samples, ~line 931-947) carry their own
status-red and status-green literals (`#ffd9d2`/`#bdedcf` on driftnote/okline;
`#5a1f16`/`#ffe4dd`/`#8a3022` and `#163d27`/`#cdf3da`/`#2a6b45` on cverdict).
These are part of the same illustration, not the site's real status UI (that
uses `--crit-*` / `--ok-*` elsewhere), so they stay literal too.

### Button-drift demo (`.b1`-`.b6`, `.bcanon`, ~line 815-881)

Six buttons with intentionally inconsistent padding, border-radius, and
font-size, illustrating component drift. `.bcanon` is the "canonical" button
built from tokens, for contrast. In addition to the three brand blues above,
this block also carries its own one-off hex (`#1a4554`, `#243038`,
`#1e567f`, `#5a6873`, `#dbe9ee`) as part of the same illustration; none of it
should be tokenized.

### Documentation demo (`.spec`, ~line 949-975)

The "is it written down" illustration renders a mock component spec as plain
text. Its color (`#dbe9ee`, a second, unrelated use of the same hex as the
button-drift demo above) is part of the mockup, not site UI.

### Type-ramp demo (`.r40`, `.r26`, `.r16`, `.r13`, ~line 1175-1198)

Each class's visible label ("Aa 40", "Aa 26", ...) names its own font-size
in the rendered text. Snapping `.r40`'s `40px` to a token would make the
label lie about what is on screen.

## Verifying the carve-out is intact

```sh
grep -n "2f6fed\|2e6fed\|3170ee\|5b9bd5\|2c6ca6" src/pages/index.astro
grep -n "\.b1\b\|\.b6\b\|\.bcanon\b" src/pages/index.astro
grep -n "\.r40\b\|\.r13\b" src/pages/index.astro
grep -n "driftnote\|okline\|cverdict" src/pages/index.astro
```

All four should return matches. If any come back empty, something tokenized
content that was supposed to stay literal.
