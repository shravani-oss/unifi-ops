# UnifiOps — Deep Review & Recommended Changes

**Reviewed:** live site (unifiops.vercel.app) + full source (Next.js 16 / React 19 / Tailwind 4, ~3,200 lines across `app/`, `components/`, `lib/`)
**Date:** August 18, 2026

## What this project actually is right now

This is a v0-generated **front-end-only prototype**. There is no backend: no API routes, no database, no auth, no real OCR/AI extraction. Every "request," "confidence score," and "extracted field" lives in two hardcoded arrays (`lib/mock-data.ts`, `lib/business-data.ts`). Every AI step (extraction, verification) is a `setTimeout` that resolves after ~1.8s and always succeeds. That's a completely reasonable way to build a click-through demo, and the visual design is genuinely strong — clean type scale, a coherent OKLCH color system, good use of source-labeling (AI/manual/derived/missing) as the core trust mechanic. But it means "suggest changes" splits into two different conversations: **things that make the demo itself better**, and **the much bigger gap between this and a real product**. Both are below.

---

## 1. Bugs to fix before showing this to anyone else

These aren't nitpicks — I clicked through the live site and each of these is visibly broken, and they undercut the platform's own pitch ("nothing is hidden," "reversible").

- **Business Admin Console's Approve / Request fix / Reject buttons do nothing.** `components/business/admin-console.tsx` renders all three with no `onClick` at all. I verified this live: clicking "Approve" on EXP-4471 leaves the status pill at "In Review." This is the single most important interaction in the business side of the app and it's a dead button.
- **The "View supporting document," "Generate report," "Export report/queue," and citizen "Help" buttons are all non-functional** — no handlers anywhere. Right now every "Generate report" button (there are two on the business admin page alone) does nothing when clicked.
- **Verification Desk (government employee) decisions don't propagate back to the list.** I approved REQ-2041 live — the decision panel correctly shows "Request approved," but the request in the queue list to its left still shows the "In Review" badge, and the top-of-page "In your queue" stat doesn't change. The decision is recorded in a `decision` state map that the queue list and stat cards never read from.
- **`DecisionResult`'s reset button is broken by construction.** In `verification-desk.tsx` line 165: `onReset={() => decide}` — this passes a function that returns a reference to `decide` without calling it, and no button in `DecisionResult` even calls `onReset`. Net effect: once you approve/reject/request-correction on a request, there's no way back — you're stuck looking at the decision receipt for that request permanently (until reload).
- **Citizen submission reference ID is hardcoded** (`components/citizen/citizen-workflow.tsx` line 353: `"REQ-2042"`) regardless of which service you applied for or how many times you run through the flow. Anyone testing the flow twice will immediately notice it's fake.
- **The header search box (`⌘K` hint) and the business admin console search input are decorative** — no keyboard shortcut is wired, and in `admin-console.tsx` the search state exists and filters correctly, but the header one (`dashboard-shell.tsx`) is just a static div with placeholder text, not an actual input.
- **Stat-card numbers don't reconcile with the tables under them.** E.g. government admin's "Pending" stat is `governmentRequests.filter(...).length + 128` — an arbitrary `+128` padding constant — while the operations table below only ever shows the 7 mock rows. If a stakeholder cross-checks the number against the visible list, it won't add up.

## 2. Accessibility findings (WCAG 2.1 AA)

I checked this with real math against your OKLCH tokens in `app/globals.css`, and one live keyboard test — not a guess.

- **Fails contrast — "Verified" status badges.** `bg-success/12 text-success` (used everywhere: `StatusBadge`, `VerificationBadge`, citizen-workflow legend) computes to a **2.99:1** contrast ratio. WCAG AA requires 4.5:1 for normal text. This is your single most-used status signal in the whole app and it doesn't meet the bar. Fix: darken `--success` for text use, or switch badge text to a dedicated darker `success-foreground` token the way you already do for `warning-foreground` and `accent-foreground` (those pass comfortably at 13–15:1).
- **Borderline fail — "Rejected"/"Failed" badges.** `bg-destructive/10 text-destructive` computes to **4.12:1**, just under the 4.5:1 normal-text threshold. Same fix pattern: introduce a `destructive-foreground` badge tone rather than reusing the raw `--destructive` value as text color.
- **Keyboard trap — Business Admin Console table rows are mouse-only.** `admin-console.tsx` puts `onClick` directly on `<tr>` elements with no `tabIndex`, `role="button"`, or `onKeyDown`. I tabbed through the page live and focus skips the rows entirely — a keyboard-only user cannot open the request detail drawer. Contrast this with `operations-view.tsx`, which does the equivalent interaction correctly with real `<button>` elements. Fix the admin console to match that pattern (or better: share one component, see §4).
- **Off-canvas mobile sidebar stays in the tab order when closed.** `dashboard-shell.tsx` hides the sidebar with `-translate-x-full` only — no `hidden`, `inert`, or `aria-hidden`. A keyboard/screen-reader user on mobile can tab into nav links that are invisible off-screen. Add `inert` (or toggle `aria-hidden` + `tabIndex={-1}` on children) when `open` is false.
- **Citizen stepper loses its only text label on mobile.** In `citizen-workflow.tsx`, step labels ("Scan QR," "Review," etc.) are `hidden sm:block` — on a phone the six-step progress indicator is just numbered circles with no `aria-label` or `aria-current="step"` conveying which step you're on. Add an `aria-current="step"` and a visually-hidden text label per step.
- **Decorative-vs-informative icons are handled well overall** — most icons carry `aria-hidden`, and labels/inputs are properly paired with `htmlFor`/`id`. This is better than most prototypes at this stage; the gaps above are specific, not systemic.

## 3. Product / UX recommendations

- **Unify the two "admin" experiences.** Government's `OperationsView` (accordion rows, expand-in-place) and Business's `AdminConsole` (table + side drawer) solve the identical problem — filter, scan, inspect one record — with two different interaction patterns and two separate implementations. Your own pitch is "one engine... government or business." Right now the UI doesn't back that up, and you're maintaining filter/search/badge logic twice. Worth consolidating into one `RequestsExplorer` component parameterized by sector.
- **Unify the two "employee" review experiences**, or make the difference intentional and visible. Government's Verification Desk is a reviewer approving someone else's submission; Business's Automation Hub is closer to self-service (submitter = reviewer, no queue). If that's a deliberate product distinction (citizen-facing government service vs. internal business automation), say so somewhere in the UI — right now it just reads as inconsistent.
- **Give the Verification Desk an undo/re-open path.** Since decisions currently dead-end the UI (see bug above), and "reversible" is one of your three trust pillars on the homepage, this is worth prioritizing over new features — it's the one place the product's core promise and the actual UI directly contradict each other.
- **Add a real per-request audit trail.** The homepage trust section says "every extraction, check and decision visible and reversible," but the only history surface is a generic global `ActivityFeed` — it's not scoped to a specific request. A "History" tab on the request detail view (who/what/when, extraction → verification → decision → notification) would make that trust claim concrete instead of aspirational copy.
- **Design the failure states, not just the happy path.** Right now AI extraction always succeeds after 1.8s. What does low-confidence extraction, a corrupted upload, or an AI service timeout actually look like to a citizen or reviewer? For a product whose whole value prop is "AI reads documents, humans stay in control," the moments where the AI is *wrong or unsure* are the ones that need the most design attention, not the least.
- **Explain confidence scores to citizens, not just employees.** A citizen sees "94%" next to their own submitted field with no context. Employees have the "AI assists — you decide" framing; citizens don't get any explanation of what the number means for them.

## 4. Code / architecture notes

- **Component duplication**: `AdminConsole` and `OperationsView` (and to a lesser extent `VerificationDesk` vs `DocumentFlow`) implement parallel logic for filtering, searching, and status display. Consolidating (per §3) also fixes the keyboard-accessibility gap in one place instead of two.
- **No shared "decision" state model.** Both review surfaces invent their own local `useState` for decisions that never touches the underlying `ServiceRequest`/`BusinessRequest` records. Even for a prototype, lifting this into a small shared store (e.g., Zustand, or just a `useReducer` at a layout level) would let a decision made in one view actually show up everywhere else, which is currently the most visible thing making the app feel unfinished.
- **This is presentation-only — the real work is the backend.** No API layer, no persistence, no auth, no document storage, no actual OCR/LLM integration. Before this becomes a real product for government or business documents (Aadhaar, GST, PAN, contracts), you need, roughly in order: authentication + role-based access control (right now anyone can navigate straight to `/government/admin` with zero login), a database for requests/fields/decisions, a real document-extraction pipeline with confidence scoring and a defined failure mode, file storage with access controls (these are literally identity documents), and an audit log that's actually persisted, not a mock array.
- **No tests, no `error.tsx`/`loading.tsx` route-level Next.js states, no ESLint config found** in the extracted project — worth adding basic route error boundaries and at least smoke tests around the decision flows once they're wired to real state.

---

## Priority punch list

1. Wire up Business Admin Console's Approve/Request fix/Reject (dead buttons on the most important business action)
2. Fix `Verified` and `Rejected` badge contrast (WCAG AA fail, affects the app's core status signal everywhere)
3. Make Business Admin Console table rows keyboard-accessible
4. Make Verification Desk decisions update the queue list/stats, and fix the broken reset path
5. Replace hardcoded citizen reference ID with a generated one
6. Fix off-canvas mobile sidebar tab-order leak
7. Then: consolidate the duplicated admin/review components, design AI-failure states, add a per-request audit trail
8. Longer term: real backend, auth/RBAC, actual document AI pipeline — before this touches real citizen or vendor documents
