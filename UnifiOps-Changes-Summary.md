# UnifiOps — Changes Made

**Date:** August 18, 2026
**Scope:** Fixes and improvements made in response to `UnifiOps-Review.md`
**Status:** Compiled, type-checked, built, and browser-tested (see verification section)

---

## Summary

Worked through the review's priority punch list items 1–6, plus the dead-button bugs and the route-state gap it flagged in §4. 21 files touched — 5 new, 16 modified. Everything below was verified by compiling, running a production build, and driving the app in a real browser (Chrome via Playwright) — not just read through.

---

## 1. Dead buttons — now wired

- **Business Admin Console: Approve / Request fix / Reject** now work. Each produces a decision receipt with a working **Undo decision** button. Tested live: approving a request updates its status badge in the table and the "Pending"/"Approved" stat cards in the same click.
- **Verification Desk's reset button** — was `onReset={() => decide}`, which returned a function reference without calling it, and nothing even called `onReset`. Replaced with a working **Reopen for review** button.
- **"Generate report" / "Export queue" / "Export report"** now download real CSV files (request ID, submitter, status, decision, etc.) rather than doing nothing.
- **"View supporting document"** now toggles a preview panel that states plainly the actual file will appear once document storage is connected — honest rather than silently broken.
- **Citizen "Help" button** is now a real panel with 4 answers, including an explanation of what the AI confidence percentage means (the review noted citizens had no context for this number).

## 2. Decisions now propagate everywhere (was: reviewer decisions vanished)

Built a shared decision model (`lib/decisions.ts`) used by both the government Verification Desk and the Business Admin Console. Each page now owns the decision state and derives the queue, the detail drawer, and the stat cards from the same source — so approving a request updates all three at once instead of only the local receipt.

Verified live: approving REQ-2041 now updates the "In your queue" stat and the queue list badge in the same click (previously both stayed frozen at "In Review").

## 3. Reference IDs and stats — no longer fabricated

- **Citizen reference ID** was hardcoded to `REQ-2042` regardless of the actual application. Now generated per submission with a service-specific prefix (e.g. `BIR-4172` for Birth Certificate). Verified two consecutive runs produce different IDs.
- **Government Admin stat cards** dropped the invented `1,040` total request count and the `+128` padding constant added to "Pending" — every number now counts the same rows the table below shows, so a stakeholder cross-checking a stat against the visible list will get a number that reconciles.
- **Business Admin stat cards** dropped the invented `1,284` "Total processed" and the `+₹41.2L` padding added to "Total amount." Replaced with "In this queue" / "Queue value," which count only the real (mock) rows.

  **Note:** these are visibly smaller numbers than before. If anyone saw the old (fake, larger) figures in an earlier demo, worth explaining why they changed.

## 4. Accessibility (WCAG 2.1 AA)

- **Contrast.** Re-measured every status/verification badge's rendered color in the browser (not just the source tokens) — light and dark, across all 5 pages. All now pass 4.5:1; worst case is 4.53:1 (was as low as 1.71:1 in dark mode, where `--success`/`--warning` had never been redefined at all). Added `--success-strong`, `--destructive-strong`, `--info`, `--info-strong` tokens for text use, keeping the original tones for fills/borders.
- **Keyboard access.** Business Admin Console table rows are now reachable by Tab and openable with Enter (previously mouse-only via `onClick` on a bare `<tr>`). Verified live via keyboard navigation.
- **Off-canvas mobile sidebar** no longer leaves nav links in the tab order when closed — now marked `inert` below the desktop breakpoint. Verified at a 390px viewport.
- **Citizen stepper** now carries `aria-current="step"` and an accessible label with step position and state, so a phone user (where the text labels are hidden) isn't left with six unlabeled numbered circles.
- **Header search (`⌘K`)** was decorative — no shortcut wired, not an actual input. Now a working shortcut that focuses the real per-page search box, and it only appears on pages that have one.

## 5. Route-level error handling (from §4 of the review)

Added `app/error.tsx` (a real error boundary with retry) and `app/loading.tsx` — neither existed before.

## 6. Bug found beyond the original review

`document-flow.tsx`'s generated record reference (`EXP-4523` style) was computed inline from `Math.random()` directly in the render body — meaning it changed on every keystroke while filling in a missing field, and would differ between server and client on first paint. Fixed to mint once, when the record is generated. The "Download" button on that screen also did nothing; now exports a CSV of the generated record.

---

## Verification performed

- `npx tsc --noEmit` — clean, zero errors
- `npx next build` — compiles, all 7 routes prerender successfully
- Production and dev servers both run with zero console errors and zero hydration warnings across all 6 pages, desktop and mobile viewports
- 18 browser-driven interaction tests (Chrome via Playwright), all passing — decision flows, keyboard nav, CSV downloads, reference ID generation, sidebar inert state, help panel
- Badge contrast measured directly from rendered computed styles (canvas-based), not recalculated by hand — light and dark, all 5 pages with content, all badges pass

**Known local-environment note:** `pnpm build` fails before reaching Next.js due to an unrelated pnpm dependency-approval check (`msw@2.14.6`); this is pre-existing and not caused by these changes. `npx next build` works and is what was used to verify.

---

## Explicitly not done (needs a product decision, not just code)

These were flagged in the original review as longer-term items and were left alone:

1. **Consolidate `AdminConsole` and `OperationsView`** into one shared component — an interaction-pattern decision, not picked unilaterally.
2. **Design AI-failure states** (low confidence, corrupted upload, timeout) — needs UX input.
3. **Per-request audit trail / History tab** — new surface, needs a spec.
4. **"Edit fields" in Verification Desk** still does nothing — real inline field editing is a larger feature than a wiring fix.
5. **Backend, auth/RBAC, real document AI pipeline** — unaddressed. Anyone can still navigate directly to `/government/admin` with no login.

## Worth knowing before the next person touches this

- **Dark mode is not actually reachable in the app today** — `app/layout.tsx` hardcodes `<html className="light">`. The dark-mode color tokens were fixed and verified (by toggling the class manually), so they're correct *if* dark mode is ever switched on, but nobody will see the fix without that switch.
- `package.json` declares `lint: eslint .` but no ESLint config file exists in the project — that script fails regardless of these changes.
