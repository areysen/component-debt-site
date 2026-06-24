# Component Debt site: project rules

`component-debt-site` is the public marketing site for Component Debt, Andrew Reysen's
independent design system audit consulting practice. Astro, deployed on Vercel. These
rules apply to every session, local or cloud.

## Prose (applies to all site copy, code comments, README, and docs)

- **No em-dashes.** Use commas, colons, parentheses, or "and". En-dashes only for true
  numeric ranges (2024-2026). This includes visible site copy, not just docs. Grep for the
  em-dash character before declaring any change done.
- Voice: short declarative sentences, direct second-person address, concrete technical
  examples, blunt assessments, no hedging. Move from specific observation to general
  principle. Comfortable saying "this is broken" when something is broken.
- Never use: delve, leverage (as a verb), robust, seamless, game-changer, unlock (as a
  metaphor), dive into, it's worth noting, in today's fast-paced world, at the end of the
  day, genuinely, straightforward.
- No emojis in published copy.
- Prefer full forms in formal copy ("cannot" not "can't").
- **Verify before asserting.** Keep marketing claims defensible against what is actually
  delivered. Do not overstate the audit's scope or the tool's coverage.

## Accessibility (this is the brand's whole point)

- The author is **red/green colorblind**. All UI must meet **WCAG AA** (4.5:1 normal text,
  3:1 large/UI), with contrast ratios **computed mathematically**, not eyeballed.
- **Never convey state by color alone.** Always pair color with text, shape, or length.
- Carry over the token palette and AA-contrast decisions already worked out in the source
  asset `launchpad.html` (see brief). Do not silently change colors without re-checking
  contrast.
- Semantic HTML, real focus states, keyboard-navigable, alt text on every image.

## Business constraints

- Andrew is W2 at InvestCloud. Per his agreement (Section 8.6), Component Debt cannot take
  **fintech or wealthtech** clients. Site copy must not market to or imply fintech clients.
- The offer ladder: $2,500 fixed-scope audit (front door), $6k-$15k remediation (upsell).
  One week, fully async, written report plus recorded walkthrough plus a 30-minute Q&A.
- Blog lives on Substack (componentdebt.substack.com). The site links out, does not rehost.

## Engineering

- Astro, TypeScript where applicable. Keep `npm run build` green before any commit.
- Run a local accessibility/contrast check before shipping any new page or color change.
- Shared layout and nav as components. Do not duplicate the header across pages.
