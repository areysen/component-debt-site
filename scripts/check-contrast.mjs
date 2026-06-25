#!/usr/bin/env node
/**
 * WCAG 2.1 contrast guard. Computes contrast ratios mathematically (not
 * eyeballed) for every foreground/background pair used in the site, and asserts
 * them against the AA thresholds:
 *   - normal text: >= 4.5:1
 *   - large text / UI components: >= 3:1
 *
 * The pairs below mirror the token palette and the on-gradient colors in
 * src/styles/global.css. When a color changes there, update the matching pair
 * here so the ratio is re-checked. Exits non-zero if any pair fails.
 *
 * For gradient backgrounds the lighter (higher-luminance) stop is the worst
 * case for white text. The warm charcoal-to-plum gradient's lighter stop is
 * the plum end (#3d1a45), so light text is checked against that stop.
 */

// sRGB hex -> relative luminance (WCAG formula).
function luminance(hex) {
  const c = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// kind: "text" (>=4.5) or "ui" (>=3, large text / non-text UI).
const PAIRS = [
  // Body + surfaces (on page bg #f7f4f0 and card #ffffff)
  { name: "body on bg", fg: "#2a2622", bg: "#f7f4f0", kind: "text" },
  { name: "body on card", fg: "#2a2622", bg: "#ffffff", kind: "text" },
  { name: "ink heading on card", fg: "#2a2622", bg: "#ffffff", kind: "text" },
  { name: "muted on bg", fg: "#6b655f", bg: "#f7f4f0", kind: "text" },
  { name: "muted on card", fg: "#6b655f", bg: "#ffffff", kind: "text" },
  { name: "accent label on card", fg: "#3d1a45", bg: "#ffffff", kind: "text" },
  { name: "accent2 link on card", fg: "#5a2c66", bg: "#ffffff", kind: "text" },
  { name: "accent2 link on bg", fg: "#5a2c66", bg: "#f7f4f0", kind: "text" },

  // On the charcoal-to-plum gradient (worst case = lighter stop #3d1a45)
  { name: "white h1 on gradient", fg: "#ffffff", bg: "#3d1a45", kind: "text" },
  {
    name: "sub #e6ddd0 on gradient",
    fg: "#e6ddd0",
    bg: "#3d1a45",
    kind: "text",
  },
  {
    name: "kicker #e8d5b0 on gradient",
    fg: "#e8d5b0",
    bg: "#3d1a45",
    kind: "text",
  },

  // Header (dark charcoal solid #1c1a18)
  {
    name: "nav link #e6ddd0 on header",
    fg: "#e6ddd0",
    bg: "#1c1a18",
    kind: "text",
  },
  { name: "brand #fff on header", fg: "#ffffff", bg: "#1c1a18", kind: "text" },

  // CTA button: dark text on white button
  {
    name: "cta text on white button",
    fg: "#1c1a18",
    bg: "#ffffff",
    kind: "text",
  },

  // Severity badges (ink on its own bg) , text, must clear 4.5
  { name: "crit badge text", fg: "#9a2b1e", bg: "#f7e7e2", kind: "text" },
  { name: "med badge text", fg: "#8a5a12", bg: "#f7eedd", kind: "text" },
  { name: "low badge text", fg: "#3d1a45", bg: "#efe6f0", kind: "text" },
  { name: "ok text", fg: "#1f6b3a", bg: "#e6f0e8", kind: "text" },

  // Tag / chip
  { name: "tag accent on chip", fg: "#3d1a45", bg: "#efe6f0", kind: "text" },

  // Findings impact box (low-ink on low-bg)
  { name: "impact text", fg: "#3d1a45", bg: "#efe6f0", kind: "text" },

  // Focus ring (UI component, >=3:1 against adjacent surfaces)
  { name: "focus ring on card", fg: "#5a2c66", bg: "#ffffff", kind: "ui" },
  { name: "focus ring on bg", fg: "#5a2c66", bg: "#f7f4f0", kind: "ui" },
  // Dark-band focusables (hero CTAs, check-row toggles, start CTAs) override
  // the ring to white, same as the header; worst case is the gradient's
  // lighter stop #3d1a45.
  { name: "focus ring on dark band (white override)", fg: "#ffffff", bg: "#3d1a45", kind: "ui" },

  // Homepage (Variant B): checks-intro / check rows / dogfood / start bands,
  // all on the solid dark charcoal #1c1a18 (same bg as the header pairs above)
  {
    name: "sand label on grad-ink (checks/dogfood/start)",
    fg: "#e8d5b0",
    bg: "#1c1a18",
    kind: "text",
  },
  { name: "check body #d6cdc0 on grad-ink", fg: "#d6cdc0", bg: "#1c1a18", kind: "text" },
  {
    name: "mono caption #cfc6b8 on grad-ink",
    fg: "#cfc6b8",
    bg: "#1c1a18",
    kind: "text",
  },
  { name: "spec value #dbe9ee on grad-ink", fg: "#dbe9ee", bg: "#1c1a18", kind: "text" },

  // Token/button toggle drift note and OK line: translucent panels over
  // .stagebig (rgba(255,255,255,.05) over grad-ink), composited to solid hex
  {
    name: "driftnote text on composited bg",
    fg: "#ffd9d2",
    bg: "#432623",
    kind: "text",
  },
  { name: "okline text on composited bg", fg: "#bdedcf", bg: "#25372a", kind: "text" },

  // Contrast-demo (check 03) verdict labels: the labels themselves are real,
  // load-bearing text (they carry the pass/fail meaning since the sample's
  // inner text is aria-hidden). The samples' own colors (#5b9bd5/#2c6ca6) are
  // the intentional demo content and are not checked.
  { name: "verdict fail label", fg: "#ffe4dd", bg: "#5a1f16", kind: "text" },
  { name: "verdict pass label", fg: "#cdf3da", bg: "#163d27", kind: "text" },

  // Evidence finding code sample
  { name: "code sample text", fg: "#f1ece4", bg: "#241f1d", kind: "text" },
  { name: "code sample comment", fg: "#cfc6b8", bg: "#241f1d", kind: "text" },

  // Evidence scorecard: warn-ink flag numbers sit on a plain white card here,
  // not the warn-bg chip the existing "med badge text" pair covers
  { name: "scorecard flag number on card", fg: "#8a5a12", bg: "#ffffff", kind: "text" },

  // Offer section's own background shift (distinct from --bg)
  { name: "body on offer-sec bg", fg: "#2a2622", bg: "#f0ebe3", kind: "text" },
  { name: "accent label on offer-sec bg", fg: "#3d1a45", bg: "#f0ebe3", kind: "text" },
];

const results = [];
let failed = 0;

for (const p of PAIRS) {
  const r = ratio(p.fg, p.bg);
  const min = p.kind === "ui" ? 3.0 : 4.5;
  const pass = r >= min;
  if (!pass) failed++;
  results.push({ ...p, r, min, pass });
}

// Print a recorded table (the defensible artifact).
const pad = (s, n) => String(s).padEnd(n);
console.log("\nWCAG AA contrast report");
console.log("=".repeat(64));
console.log(
  `${pad("pair", 32)}${pad("ratio", 9)}${pad("min", 6)}${pad("kind", 6)}result`,
);
console.log("-".repeat(64));
for (const x of results) {
  console.log(
    `${pad(x.name, 32)}${pad(x.r.toFixed(2) + ":1", 9)}${pad(x.min.toFixed(1), 6)}${pad(
      x.kind,
      6,
    )}${x.pass ? "PASS" : "FAIL"}`,
  );
}
console.log("=".repeat(64));

if (failed) {
  console.error(
    `\nContrast guard FAILED: ${failed} pair(s) below threshold.\n`,
  );
  process.exit(1);
}
console.log(`Contrast guard passed (${results.length} pairs, all >= AA).\n`);
