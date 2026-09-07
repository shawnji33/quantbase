# Quantbase — Design Prototype Handoff

A high-fidelity, front-end prototype of the Quantbase **Explore strategies** marketplace and
the **new onboarding flow**, built for design sign-off and team feedback. This document is the
single source of truth for the dev team to review, run, and extend the work.

- **Status:** Front-end only (no backend, no real auth). All data is mock.
- **Prepared:** 2026-07 (onboarding added 2026-07-15) · **Owner:** Shawn (shawn@surmount.ai)

---

## 1. Links

| Resource | URL |
|---|---|
| **Live prototype** (public, no login) | https://quantbase-five.vercel.app/strategies |
| **Login / sign-up** (incl. email-code verify) | https://quantbase-five.vercel.app/login |
| **Onboarding flow** (the new deliverable) | https://quantbase-five.vercel.app/onboarding |
| **Portfolio builder v2 — draft, not in flow yet** | https://quantbase-five.vercel.app/drafts/portfolio |
| **GitHub repo** (private) | https://github.com/shawnji33/quantbase |
| **Figma file** | https://www.figma.com/design/ZLwijhAPmSEr7JHXpD6vVd/Quantbase |
| **Vercel project** | `quantbase` (scope: shawns-projects) |

Production alias: `quantbase-five.vercel.app` · Root `/` redirects to `/login`.

Figma pages for the onboarding work:

| Figma page | Contents |
|---|---|
| **Production — Onboarding (Sidebar shell)** | All 14 shipped screens captured as editable layers (welcome → done, incl. funding variants A/B/C) — [open](https://www.figma.com/design/ZLwijhAPmSEr7JHXpD6vVd/Quantbase?node-id=24258-2) |
| **Onboarding flows — Jul 2026** | The 5-shell exploration archive (25 screens, image boards) — [open](https://www.figma.com/design/ZLwijhAPmSEr7JHXpD6vVd/Quantbase?node-id=24233-2) |
| **Draft — Portfolio builder v2** | Wealthsimple-style builder redesign under team review — [open](https://www.figma.com/design/ZLwijhAPmSEr7JHXpD6vVd/Quantbase?node-id=24267-2) |

---

## 2. Tech stack

- **Next.js 16.2.6** (App Router, Turbopack) · React · **TypeScript**
- **Tailwind CSS v4** (`@import "tailwindcss"`, CSS-first config in `app/globals.css`)
- **shadcn/ui** (`radix-nova` style, Radix primitives) — components in `components/ui/`
- **@remixicon/react** — icon set (design-system default)
- Fonts: **Inter** (sans/body), Geist Mono (mono) via `next/font`
- Deployed on **Vercel** (static prerender; all routes are `○ Static`)

---

## 3. Run / build / deploy

```bash
# install
npm install

# local dev  → http://localhost:3000
npm run dev

# production build (type-checks + lints)
npm run build

# deploy to Vercel production
vercel --prod
```

Node 18+ recommended. No environment variables are required (no backend).

---

## 4. Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/login` |
| `/login` | `app/login/page.tsx` | Auth UI (sign in / create account + email-code verify) — **UI only** |
| `/onboarding` | `app/onboarding/page.tsx` → `components/onboarding/flow.tsx` | Full onboarding flow: intent fork → risk/experience → portfolio builder → bank/funding → KYC → agreements. Sidebar shell (brand rail, content vertically centered on lg screens). Dev deep links: `?step=<id>&fund=a\|b\|c&name=<first>`. Funding step keeps a floating A/B/C variant switcher (decision still open). |
| `/strategies` | `app/strategies/page.tsx` → `components/marketplace/marketplace.tsx` | The marketplace (the main deliverable) |
| `/portfolio` | `app/portfolio/page.tsx` → `components/portfolio/dashboard-gate.tsx` | Dashboard (placeholder redesign, not final): account-approval states (in review / no portfolio / action needed / approved, floating "Account" switcher + `?status=`) gating the portfolio overview (aggregate hero, allocation donut, value chart, strategy table) |
| `/portfolio/[strategyId]` | `app/portfolio/[strategyId]/page.tsx` | Strategy detail: breadcrumb, switcher-as-title, holdings donut, value chart, Buy/Sell. Mock data in `lib/portfolio.ts` |
| `/verify-documents` | `app/verify-documents/page.tsx` | Identity-verification uploads: per-document drop zones w/ simulated progress, submission receipt persisted (sessionStorage) and surfaced on the dashboard tracker |
| `/edit-portfolio` | `app/edit-portfolio/page.tsx` | Standalone starting-portfolio editor (save & exit back to the in-review dashboard); `?blank=1` starts empty |
| `/settings` | `app/settings/page.tsx` | Settings index. Narrow screens show the section list; wide screens show the list plus the Account panel |
| `/settings/[section]` | `app/settings/[section]/page.tsx` → `components/settings/settings-page.tsx` | The six settings sections — `account`, `security`, `banking`, `documents`, `activity`, `preferences`. Each is a prerendered URL; unknown sections 404 |
| `/settings/close-account` | `app/settings/close-account/page.tsx` → `components/settings/close-account.tsx` | Self-serve account closure — readiness checklist → confirm → closure tracker → closed. Floating "Closure" + "Account" review switchers |

`app/strategies/layout.tsx` provides the fixed app shell (top bar + sidebar; only the
main column scrolls). `app/template.tsx` adds a subtle page-transition fade.

---

## 5. Project structure

```
app/
  globals.css            # Tailwind v4 + design tokens (colors, radii, glass, shadows)
  layout.tsx             # root layout, fonts, ThemeProvider, FigmaCaptureLoader
  template.tsx           # page-transition wrapper (fade)
  page.tsx               # / → redirect to /login
  login/page.tsx         # login/signup screen
  strategies/
    layout.tsx           # app shell: fixed header + sidebar, scrolling content
    page.tsx             # renders <Marketplace />
components/
  marketplace/
    marketplace.tsx      # search + category chips + sort + results grid (client)
    card-sparkline.tsx   # the strategy card (chart + metrics + risk + Invest)
  price-chart.tsx        # interactive SVG area chart w/ cursor-tracking tooltip (client)
  risk-score.tsx         # gray-purple segmented risk meter + methodology modal (client)
  figma-capture-loader.tsx  # dev-only: loads Figma capture script on #figmacapture hash
  theme-provider.tsx     # next-themes wrapper (dark mode支持)
  ui/                    # shadcn components (button, card, dialog, select, tooltip, ...)
lib/
  strategies.ts          # mock data + types + helpers (fmtPct, riskLabel)
  utils.ts               # cn() classname helper
public/
  logo-mark.jpg          # colored Quantbase mark
  logo-mark-white.png    # white mark (used in header / login)
```

---

## 6. Design system / tokens

Defined as CSS variables in `app/globals.css` (`:root` + `.dark`). Key values:

- **Brand / primary:** `#7046E5` (`--primary`, exposed as `oklch(0.537 0.225 288.5)`)
- **Card surface:** `--card` = `#fdfdfd`; page background `#F5F6F7`; card frame `#efefef`
- **Text ramp (gray-purple):** `#363643` (primary) · `#47475d` (secondary) · `#575872`
  (tertiary) · `#6d6f8a` (quaternary) · `#b4b5c5` (placeholder)
- **Borders:** `--border-secondary` = `rgba(10,13,18,0.08)`
- **Card shadow:** `--shadow-card` = `0 1px 12px rgba(10,13,18,0.03)`
- **Success (returns):** `#1d7e4f` green · **Negative:** `#d92d20` red
- **Risk meter:** filled `#575872`, track `#9a9ab2`, surface `#eeedf1`
- **Radii:** `--radius` = 10px; cards use `rounded-[16px]` (outer) / `rounded-[10px]` (inner)
- **`.glass`** utility: frosted backdrop blur + saturation for chrome
- Button size scale is **padding-based** (aligned to the design library): `xs/sm/default/lg`
  Primary = skeuomorphic indigo pill; Secondary = white pill (`border rgba(0,0,0,0.10)`)

Type sizes are on the even DS scale: labels 12px, body 14px, values/titles 16px.

---

## 7. Key components (behavior)

- **Strategy card** (`card-sparkline.tsx`): gray frame → title + optional "Partner funds"
  badge + description; white inner card with the interactive chart, three return metrics
  (1-year / 3-year / Inception, dividers between), and the risk-score row; a full-width
  secondary **Invest** pill.
- **PriceChart** (`price-chart.tsx`): smooth Bézier area chart. On hover, a dot follows the
  cursor continuously (interpolated along the curve) and a glass tooltip shows a
  "growth of $10,000" value + date. Default cursor (not a link). Respects reduced-motion.
- **RiskScore** (`risk-score.tsx`): 5 segment bars + `n / 5`. Info icon → hover tooltip
  ("How is this calculated?") → click opens a **modal** with the full risk methodology copy.
- **Marketplace** (`marketplace.tsx`): live search (name/manager), multi-select category
  chips (All / Crypto / Gov't / Meme / Partner / Quantbase), sort (Performance Inception /
  1-Year / Title A–Z / Z–A), animated results, empty-state with "Clear all".

---

## 8. Data model (mock)

All strategies live in `lib/strategies.ts` (`Strategy[]`). To wire a real API, replace this
array with fetched data of the same shape:

```ts
type Strategy = {
  id: string
  name: string
  manager: string
  blurb: string
  partner: boolean
  categories: Category[]        // "Crypto" | "Gov't" | "Meme" | "Partner" | "Quantbase"
  inceptionYear: number
  oneYear: number               // %
  threeYear: number             // %
  inceptionReturn: number       // %
  risk: number                  // 0–5
  dailyVol: number              // %
  maxDrawdown: number           // %, negative
  minInvest: number
  series: number[]              // normalized price series for the chart
}
```

There are 13 sample strategies spanning every category, with a mix of positive/negative
returns and varied inception years to exercise all UI states.

---

## 9. Known placeholders / not implemented (for the dev team)

These are intentional gaps — the prototype is front-end only:

- **No backend / API** — data is the static `strategies` array.
- **No real auth** — the login form only prevents default on submit; social buttons are inert.
- **"Invest"** buttons and card have **no navigation** yet (no strategy detail page exists).
- **"See fee schedule"** and other `href="#"` links are placeholders.
- The chart tooltip value is a **hypothetical "$10k growth"** derived from the series, not real
  account data. Dates are spread inception→today.
- **Risk score** is rounded to an integer for display (`4 / 5`); real scoring per the modal copy
  is not computed here.
- `FigmaCaptureLoader` is a **dev tool** (loads Figma's capture script only when the URL hash
  starts with `#figmacapture`) — harmless in prod, safe to remove if undesired.

---

## 10. Figma references (design source of truth)

File: https://www.figma.com/design/ZLwijhAPmSEr7JHXpD6vVd/Quantbase

| Frame | node-id |
|---|---|
| Explore strategies page (current) | `24185-2` |
| Strategy card (option A, spec) | `24121-14535` |
| Risk score row (spec) | `24146-14826` |
| Risk Score Calculation modal | `24159-2` |
| Risk tooltip state | `24161-2` |

---

## 11. Sign-off checklist

- [ ] Review live prototype: https://quantbase-five.vercel.app/strategies
- [ ] Confirm design matches Figma (`24185-2` and card `24121-14535`)
- [ ] Confirm data model shape (`lib/strategies.ts`) for API integration
- [ ] Decide on strategy **detail page** scope (Invest / card click target)
- [ ] Decide on **auth** provider (currently UI-only)
- [ ] Confirm copy: net-of-fees banner + risk methodology modal
- [ ] Accessibility pass (keyboard, focus, reduced-motion are already respected)

---

## 12. Settings (added 2026-09-07)

Two-pane: section list on the left, detail on the right. Selection is a real
route (`/settings/security`), so back/forward and support deep links work.

### Sections

| Section | Shape | Notes |
|---|---|---|
| Account | Form | Inline fields, one persistent Save, disabled until dirty. Per-field validation, inline errors. Hosts the Close account entry |
| Security | Toggles + list | Two-factor, password reset, active sessions |
| Banking | Record + destructive action | Masked account/routing with reveal, confirmed disconnect |
| Documents | Tabular | Tax forms always visible; statements filtered by year and paginated |
| Activity | Tabular | Date-range filter, pagination, status pills only on exceptions |
| Investing | Summary + edit | Risk tolerance and experience as conclusions, edited in a dialog |

Six sections, not the five originally scoped: Activity is separate from Documents
because "what happened to my account" and "give me a PDF" are different tasks
with different UI shapes.

### Rules the panels follow

- **Status before detail.** Most visits are to check something, so every nav item
  carries its own state ("Two-factor off" in amber, "Chase ••••4831" in green)
  and each panel repeats it as a pill in the header. `sectionStatus` /
  `sectionTone` in `lib/settings.ts`.
- **Nothing sensitive renders by default.** Account and routing numbers are
  masked until revealed (`RevealValue`). The two-factor secret and QR are
  generated only inside the setup dialog — before that they exist nowhere in
  the DOM.
- **Toggles never flip optimistically.** The two-factor switch shows real state;
  turning it on opens setup, turning it off opens a confirm. A failed save
  leaves the switch where it was.
- **Three states per action.** `useAsyncAction` models working / done / error.
  Success is transient, errors persist until the next attempt and render inline
  next to the control, never as a page banner.
- **Confirm anything high-stakes.** Disconnecting a bank and disabling two-factor
  both route through `ConfirmDialog`.
- **Skeletons, not blank space.** Statements and Activity render `RowSkeleton`
  while loading.
- **Consistent verbs.** "Save" for forms, "Verify" only for confirmation steps,
  and specific verbs elsewhere ("Send reset link", "Disconnect", "Download").

### Responsive

Pure CSS at the `md` breakpoint, no JS: `/settings` is the list on narrow
screens, `/settings/<id>` is the detail with a back arrow. Both panes show side
by side from 768px up. `h1` is "Settings"; each panel heading is an `h2`.

### Review switcher

Bottom-left, two groups: **Saves** (Succeed / Fail) forces the error state on
every save; **Data** (Fast / Slow) stretches the fetch so loading skeletons are
reviewable.

### Prototype notes

- Settings state lives in `sessionStorage` (`qb-settings`) — per tab, so a fresh
  tab starts from defaults.
- The two-factor code accepts any 6 digits; the QR is a deterministic
  placeholder, not a real enrolment code.
- Download buttons on documents are inert.

---

## 13. Account closure (added 2026-09-07)

Self-serve closure, reached from the header avatar → **Account settings** → **Close account**.

### The gates are a sequence, not a set

The three prerequisites in the brief can't be evaluated independently, so `lib/account-closure.ts`
models them as an ordered chain where each gate unlocks the next:

| # | Gate | Blocks because | Conditional? |
|---|---|---|---|
| 0 | Cancel incoming deposit | An in-flight ACH lands after the balance hits zero and re-funds a closing account | Yes — only if one is in flight |
| 1 | Turn off auto-investments | Recurring buys re-enter positions the user just sold | Yes — only if one is live |
| 2 | Sell your investments | Positions must be liquidated to cash | No |
| 3 | Wait for trades to settle | Proceeds are unsettled for ~1 business day and can't be withdrawn | No |
| 4 | Withdraw your cash | Closing with a balance strands the user's money at the broker | No |

Gates 0 and 1 **were not in the original request** — both are genuinely blocking and both are
reachable in the product today. They render as conditional rows, so the common account sees a clean
three-step list. The `Account: 5 gates / 3 gates` review switcher toggles between the two shapes.

Only one gate is actionable at a time. Rows below it say *"Available once…"* rather than showing a
disabled button, and the settlement row explicitly says there is nothing for the user to do — that
wait is time, not action, and without saying so it reads as a bug.

### Lifecycle

`open` → (all gates cleared) → confirm → `requested` → `closed`, with cancel from `requested` back to
`open`. Closure **outranks account-approval status** on the dashboard: `dashboard-gate.tsx` renders
the tracker or the closed state instead of the portfolio. State persists in `sessionStorage` under
`qb-closure`, because the real flow spans days (T+1 settlement, then 1–3 business days of ACH).

### Quiver acknowledgment

Shown to **everyone** on the confirm step with a **required** checkbox, not just to users we can see
holding a Quiver strategy — holdings data can't see someone who held one in the past and still pays
for the subscription. Copy states that the subscription is billed by Quiver, not Quantbase, and
points at `james@quiverquant.com` (mailto + copy-to-clipboard). The checkbox gates the submit button.

### Files

```
lib/account-closure.ts                     # lifecycle, snapshot, gate evaluator
components/app-shell.tsx                   # header + sidebar, extracted from both layouts; avatar menu
components/settings/
  bits.tsx                                 # SettingsPage / Card / Row / BackLink
  use-closure.ts                           # sessionStorage-backed closure state
  account-settings.tsx                     # /settings/account
  close-account.tsx                        # orchestrator + review switchers
  closure-checklist.tsx                    # the gate list
  closure-actions.tsx                      # sell-all, withdraw-all, cancel-deposit, turn-off-auto, cancel-closure
  closure-confirm.tsx                      # Quiver ack + reason + email-code
  closure-tracker.tsx                      # requested state
  account-closed.tsx                       # terminal state
```

### Prototype compressions (change before shipping)

- Settlement resolves after **7s** (`SETTLE_DELAY_MS`) and closure completes after **9s**
  (`CLOSE_DELAY_MS`) so the whole lifecycle is reviewable in one sitting. Real timings are stated in
  the copy.
- The email code accepts **any** 6 digits.
- `Sell` on the strategy detail page and `Transfer` in `AccountPanel` are still inert — those are
  *partial* sell/transfer flows and there's no partial-position model behind them. Sell-all and
  withdraw-all (the flows closure actually needs) are real.

### Open policy questions (compliance/ops, not design)

1. **How long does sign-in survive closure?** The 1099-B for the closing year is issued *after* the
   account is gone. Built assuming **seven years, read-only, documents only**.
2. **Residual cash** (trailing dividends, interest, settlements) landing on a zero-balance account.
   Built assuming **Quantbase contacts the user and reimburses to the last linked bank**.
3. **Can a closed account be reopened?** Built assuming **no — full re-onboarding**. The closed
   screen deliberately offers no re-open path; if that policy changes it needs a new entry point.

---

## 14. Onboarding flow — overview & file index

**Flow:** sign-up (`/login`) → email-code verify → welcome → US-residency gate (non-US → waitlist,
cannot register) → intent fork (specific strategy / build-me-a-portfolio / build-my-own) →
[guided path: risk question → experience matrix → "building your portfolio" moment] →
portfolio builder → bank connect (Plaid mock / manual / demo mode) → funding → KYC ×5 →
agreements + signature → optional "how did you hear" → done.

**Key behaviors**
- Shell: purple brand rail (260px, 300px on ≥1536px screens) with phase progress, per-phase
  reassurance copy, and a live portfolio preview; step content vertically centered on lg screens.
- Portfolio recommendation comes from `recommendPortfolio()` in `lib/onboarding.ts` — risk answer
  caps strategy risk, no crypto experience filters crypto out, weights 40/30/20/10.
- No auto-rebalancing anywhere by design in the v2 draft; production builder still auto-rebalances
  (pending team decision on the draft).
- Dev deep links for review/capture: `/onboarding?step=<id>&fund=a|b|c&name=<first>`.

**Open decisions**
- **Funding variant** — A (skippable, default) / B (defer to first invest) / C (required). A floating
  "Design review" switcher on the funding step flips between them in prod.
- **Portfolio builder v2** (`/drafts/portfolio`) — donut + steppers + "why this mix" redesign, not
  yet wired into the flow.

**Files**
- `app/onboarding/page.tsx` — route entry
- `components/onboarding/flow.tsx` — step state machine, phase map, deep links
- `components/onboarding/shells.tsx` — the sidebar shell (rail, progress, back/save-exit)
- `components/onboarding/steps-about.tsx` — welcome, eligibility, waitlist, intent, risk, experience, heard
- `components/onboarding/portfolio-builder.tsx` — production builder + "generating" moment
- `components/onboarding/portfolio-builder-v2.tsx` — draft v2 (donut, steppers, add panel)
- `components/onboarding/bank-funding.tsx` — bank connect, Plaid mock, manual form, funding A/B/C
- `components/onboarding/kyc.tsx` — 5 KYC steps, affiliations compliance modal, agreements, done
- `components/onboarding/ui.tsx` — StepShell, OptionCard, chips, notes
- `lib/onboarding.ts` — questions, recommendation logic, KYC ranges, agreements
- `app/drafts/portfolio/page.tsx` — draft route (unlinked, noindex)

---

## 15. Strategy page — file index

Every file that makes up the `/strategies` (Explore strategies) page.

**Route & shell**
- [`app/strategies/page.tsx`](https://github.com/shawnji33/quantbase/blob/main/app/strategies/page.tsx) — route entry, renders `<Marketplace />`
- [`app/strategies/layout.tsx`](https://github.com/shawnji33/quantbase/blob/main/app/strategies/layout.tsx) — fixed header + sidebar shell
- [`app/layout.tsx`](https://github.com/shawnji33/quantbase/blob/main/app/layout.tsx) — root layout, fonts, providers
- [`app/template.tsx`](https://github.com/shawnji33/quantbase/blob/main/app/template.tsx) — page-transition wrapper
- [`app/globals.css`](https://github.com/shawnji33/quantbase/blob/main/app/globals.css) — design tokens / global CSS

**Page + card**
- [`components/marketplace/marketplace.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/marketplace/marketplace.tsx) — search / filters / sort / results grid
- [`components/marketplace/card-sparkline.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/marketplace/card-sparkline.tsx) — strategy card
- [`components/price-chart.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/price-chart.tsx) — interactive chart
- [`components/risk-score.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/risk-score.tsx) — risk meter + methodology modal

**Data & utilities**
- [`lib/strategies.ts`](https://github.com/shawnji33/quantbase/blob/main/lib/strategies.ts) — mock data + types
- [`lib/utils.ts`](https://github.com/shawnji33/quantbase/blob/main/lib/utils.ts) — `cn()` helper
- [`components/theme-provider.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/theme-provider.tsx) — theme provider
- [`components/figma-capture-loader.tsx`](https://github.com/shawnji33/quantbase/blob/main/components/figma-capture-loader.tsx) — dev-only capture loader

**shadcn/ui primitives used**
- [`button`](https://github.com/shawnji33/quantbase/blob/main/components/ui/button.tsx) ·
  [`card`](https://github.com/shawnji33/quantbase/blob/main/components/ui/card.tsx) ·
  [`input`](https://github.com/shawnji33/quantbase/blob/main/components/ui/input.tsx) ·
  [`select`](https://github.com/shawnji33/quantbase/blob/main/components/ui/select.tsx) ·
  [`dialog`](https://github.com/shawnji33/quantbase/blob/main/components/ui/dialog.tsx) ·
  [`tooltip`](https://github.com/shawnji33/quantbase/blob/main/components/ui/tooltip.tsx)

**Browse folders**
- [`components/marketplace/`](https://github.com/shawnji33/quantbase/tree/main/components/marketplace) ·
  [`app/strategies/`](https://github.com/shawnji33/quantbase/tree/main/app/strategies)
