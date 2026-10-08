# Route Content Matrix

## Purpose
This matrix is the source-of-truth inventory for route-level content quality in the app shell. It captures the current state and the expansion targets used in this delivery.

## Shared Page Pattern
All route surfaces should follow this pattern:

1. Title and operating context
2. KPI/status strip
3. Primary action surface
4. Contextual guidance (what to do next)
5. Empty/fallback states
6. Recovery links to adjacent modules

## Route Inventory

| Route | View key | Primary module | Current state | Gap found | Expansion target |
|---|---|---|---|---|---|
| `/` | `main` / `weaver` mode split | `modules/main/MainView.tsx` or `modules/weaver/Weaver.tsx` | Strong visuals and ambient narrative | Limited tactical guidance and no explicit "next best action" cards | Add operational guidance panel, quick mission cards, and clearer CTA copy |
| `/operations` | `operations` | `modules/operations/OperationsView.tsx` | Rich tools (kanban, timeline, dispatch) | Dense controls with little explanatory framing for new users | Add "operator guidance" and empty-state coaching for filters and task lists |
| `/marketing` | `marketing` | `modules/marketing/MarketingView.tsx` | Multiple tabs and advanced cards | Tabs assume prior domain context, no integrated playbook guidance | Add campaign playbook panel and tab-intent descriptions |
| `/security` | `security` | `modules/security/SecurityView.tsx` | Existing module present | Not in this phase scope | No changes in this phase |
| `/finance` | `finance` | `modules/finance/FinanceView.tsx` | Existing module present | Not in this phase scope | No changes in this phase |
| `/help` | `help` (new) | `modules/help/HelpView.tsx` | Not present | No in-app docs/help bridge route | Add a first-class help center and wire into nav/routes |

## Scope Applied In This Delivery
- In scope: `main`, `operations`, `marketing`, and a new `help` route.
- Out of scope: full content rewrites for every existing module route.
