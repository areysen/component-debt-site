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
 * For gradient backgrounds the lighter stop is the worst case for white text,
 * so we check white against the lighter stop (#17576b), per the source assets'
 * stated reasoning.
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
  // Body + surfaces (on page bg #f4f7f8 and card #ffffff)
  { name: "body on bg", fg: "#2b3742", bg: "#f4f7f8", kind: "text" },
  { name: "body on card", fg: "#2b3742", bg: "#ffffff", kind: "text" },
  { name: "ink heading on card", fg: "#15212b", bg: "#ffffff", kind: "text" },
  { name: "muted on bg", fg: "#566571", bg: "#f4f7f8", kind: "text" },
  { name: "muted on card", fg: "#566571", bg: "#ffffff", kind: "text" },
  { name: "accent label on card", fg: "#1a4554", bg: "#ffffff", kind: "text" },
  { name: "accent2 link on card", fg: "#236781", bg: "#ffffff", kind: "text" },
  { name: "accent2 link on bg", fg: "#236781", bg: "#f4f7f8", kind: "text" },

  // On the teal gradient (worst case = lighter stop #17576b)
  { name: "white h1 on gradient", fg: "#ffffff", bg: "#17576b", kind: "text" },
  {
    name: "sub #eef4f6 on gradient",
    fg: "#eef4f6",
    bg: "#17576b",
    kind: "text",
  },
  {
    name: "kicker #cfe1e8 on gradient",
    fg: "#cfe1e8",
    bg: "#17576b",
    kind: "text",
  },

  // Header (dark teal solid #123540)
  {
    name: "nav link #eef4f6 on header",
    fg: "#eef4f6",
    bg: "#123540",
    kind: "text",
  },
  { name: "brand #fff on header", fg: "#ffffff", bg: "#123540", kind: "text" },

  // CTA button: dark text on white button
  {
    name: "cta text on white button",
    fg: "#123540",
    bg: "#ffffff",
    kind: "text",
  },

  // Severity badges (ink on its own bg) , text, must clear 4.5
  { name: "crit badge text", fg: "#8a1f12", bg: "#fbe9e7", kind: "text" },
  { name: "med badge text", fg: "#7a4d00", bg: "#fdf3e3", kind: "text" },
  { name: "low badge text", fg: "#1f4d5f", bg: "#eaf1f4", kind: "text" },
  { name: "ok text", fg: "#155f3a", bg: "#e7f3ec", kind: "text" },

  // Tag / chip
  { name: "tag accent on chip", fg: "#1a4554", bg: "#eef3f4", kind: "text" },

  // Findings impact box (low-ink on low-bg)
  { name: "impact text", fg: "#1f4d5f", bg: "#eaf1f4", kind: "text" },

  // Focus ring (UI component, >=3:1 against adjacent surfaces)
  { name: "focus ring on card", fg: "#236781", bg: "#ffffff", kind: "ui" },
  { name: "focus ring on bg", fg: "#236781", bg: "#f4f7f8", kind: "ui" },
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
