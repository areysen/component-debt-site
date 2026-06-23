#!/usr/bin/env node
/**
 * Link guard. Runs over the built output (dist/) and asserts:
 *   - every internal href (starting "/") resolves to a built page or asset
 *   - the Substack outbound link is present and correct
 *   - outbound links carry rel="noopener"
 *
 * Exits non-zero on any broken internal link or missing/incorrect Substack URL.
 * Run after `astro build`.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const SUBSTACK = "https://componentdebt.substack.com";

if (!existsSync(DIST)) {
  console.error("Link guard: dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => extname(f) === ".html");

// Resolve an internal href to a file in dist/. Astro emits /audit -> audit/index.html
// (or audit.html). Accept either shape, plus direct asset paths.
function internalResolves(href) {
  const clean = href.split("#")[0].split("?")[0];
  if (clean === "" || clean === "/")
    return existsSync(join(DIST, "index.html"));
  const rel = clean.replace(/^\//, "");
  const candidates = [
    join(DIST, rel),
    join(DIST, rel + ".html"),
    join(DIST, rel, "index.html"),
    join(DIST, rel.replace(/\/$/, ""), "index.html"),
  ];
  return candidates.some((c) => existsSync(c));
}

const problems = [];
let substackSeen = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);

  // All href="..." occurrences.
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    if (href.startsWith("/")) {
      if (!internalResolves(href)) {
        problems.push(`${rel}: broken internal link -> ${href}`);
      }
    }
  }

  // Substack link present and exact.
  const substackTags = [
    ...html.matchAll(/<a\b[^>]*href="([^"]*substack[^"]*)"[^>]*>/gi),
  ];
  for (const tag of substackTags) {
    substackSeen++;
    if (tag[1] !== SUBSTACK) {
      problems.push(
        `${rel}: Substack href is "${tag[1]}", expected "${SUBSTACK}"`,
      );
    }
    if (!/rel="[^"]*noopener[^"]*"/i.test(tag[0])) {
      problems.push(`${rel}: Substack link missing rel="noopener"`);
    }
  }
}

if (substackSeen === 0) {
  problems.push(
    "No Substack link found in any built page (expected in nav and footer).",
  );
}

if (problems.length) {
  console.error(`\nLink guard FAILED (${problems.length} issue(s)):\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}

console.log(
  `Link guard passed (${htmlFiles.length} page(s), ${substackSeen} Substack link(s), no broken internal links).`,
);
