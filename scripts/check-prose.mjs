#!/usr/bin/env node
/**
 * Prose guard. Enforces the project's non-negotiable copy rules over both the
 * source (src/) and the built output (dist/):
 *   - no em-dash (U+2014) anywhere
 *   - none of the banned words in visible copy
 *   - no emoji in published copy
 *
 * Exits non-zero on any violation so it can gate the build (npm test).
 *
 * Scope note: the en-dash (U+2013) is allowed for true numeric ranges only.
 * We do not flag it; the em-dash is the hard ban.
 */
import { readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync, existsSync } from "node:fs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Banned words from CLAUDE.md / the build brief. Matched case-insensitively as
// whole words. "leverage" and "unlock" are banned as verb/metaphor; we flag the
// stems and rely on the copy review to confirm (a false positive is rare in
// marketing copy and worth the safety).
const BANNED_WORDS = [
  "delve",
  "leverage",
  "robust",
  "seamless",
  "game-changer",
  "game changer",
  "unlock",
  "dive into",
  "it's worth noting",
  "in today's fast-paced world",
  "at the end of the day",
  "genuinely",
  "straightforward",
];

const EM_DASH = "\u2014"; // em-dash, by code point so this file stays clean

// Emoji ranges (common pictographic blocks). Plain symbols/arrows used in CSS
// (↗ ▲ ◆ ●) are NOT in these ranges, so the severity glyphs are not flagged.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/u;

const SRC_EXT = new Set([
  ".astro",
  ".css",
  ".ts",
  ".js",
  ".mjs",
  ".md",
  ".html",
]);

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".astro")
      continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (SRC_EXT.has(extname(name))) acc.push(full);
  }
  return acc;
}

// Files to scan: all of src/, plus the built HTML/CSS in dist/.
const targets = [
  ...walk(join(ROOT, "src")),
  ...walk(join(ROOT, "dist")).filter((f) =>
    [".html", ".css"].includes(extname(f)),
  ),
];

const violations = [];

for (const file of targets) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const n = i + 1;

    if (line.includes(EM_DASH)) {
      violations.push(
        `${rel}:${n}  em-dash (U+2014): ${line.trim().slice(0, 90)}`,
      );
    }

    const lower = line.toLowerCase();
    for (const word of BANNED_WORDS) {
      // Whole-word-ish match: bounded by non-letters. Hyphenated phrases and
      // apostrophes are handled by treating them literally in the needle.
      const re = new RegExp(
        `(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`,
        "i",
      );
      if (re.test(lower)) {
        violations.push(
          `${rel}:${n}  banned word "${word}": ${line.trim().slice(0, 90)}`,
        );
      }
    }

    if (EMOJI_RE.test(line)) {
      violations.push(
        `${rel}:${n}  emoji in copy: ${line.trim().slice(0, 90)}`,
      );
    }
  });
}

if (violations.length) {
  console.error(`\nProse guard FAILED (${violations.length} issue(s)):\n`);
  for (const v of violations) console.error("  " + v);
  console.error("");
  process.exit(1);
}

console.log(`Prose guard passed (${targets.length} files scanned).`);
