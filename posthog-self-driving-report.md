# PostHog Self-driving Setup Report

_Generated: 2026-07-04_

## Summary

PostHog Self-driving has been configured for **remcostoeten.nl**. Session Replay, Error Tracking, Support, GitHub Issues, and the scout gate are now wired to the inbox; the scout troop is tuned to 3 active scouts (general, web-analytics, web-vitals) matched to this site's profile as a personal portfolio and blog. Findings will start appearing in your [Self-driving inbox](https://us.posthog.com/project/497538/inbox) within approximately 30 minutes.

---

## AI data processing

**Approved.** Organization-level AI data processing consent was granted before this run; all Self-driving features depending on it are active.

---

## GitHub

| | |
|---|---|
| **Status** | Connected during this run |
| **Integration ID** | 182441 |
| **Account** | remcostoeten |
| **Repo granted** | remcostoeten/remcostoeten.nl |

---

## Products enabled

The `products-enable` MCP tool was not available in this PostHog deployment. Products were **not** toggled server-side by this run.

| Product | Status | Notes |
|---|---|---|
| Session Replay | Not toggled (tool unavailable) | `posthog.init` is clean — no `disable_session_recording` override. Active recordings confirmed. Enable in Project Settings if not already on. |
| Error Tracking | Not toggled (tool unavailable) | `posthog.init` is clean — no `capture_exceptions: false` override. Enable in Project Settings. |
| Support (Conversations) | Not toggled (tool unavailable) | Enable in Project Settings. Tickets only arrive once an inbound channel (email / inbox / Slack) is connected — see Follow-ups. |

**`posthog.init` override check:** `src/core/analytics/posthog.tsx` is clean — no options that would suppress session recording or exception capture. The server-side product enables will take full effect once turned on.

---

## Signal sources

| source_product | source_type | Action | Config ID |
|---|---|---|---|
| `signals_scout` | `cross_source_issue` | **Scout gate is on by default** — no row needed | — |
| `error_tracking` | `issue_created` | **Enabled** | `019f2ea1-add5-7bae-8885-c5e456f9e982` |
| `error_tracking` | `issue_reopened` | **Enabled** | `019f2ea1-b016-7221-8053-45d85c11fcd1` |
| `error_tracking` | `issue_spiking` | **Enabled** | `019f2ea1-b312-751b-86e7-3f6b46a4f861` |
| `session_replay` | `session_analysis_cluster` | **Enabled** (10% sample rate, server default) | `019f2ea1-b86e-7c22-a2fb-d88ded624de2` |
| `conversations` | `ticket` | **Enabled** (dormant until a channel is connected) | `019f2ea1-bacb-7689-b906-546251fce526` |
| `github` | `issue` | **Enabled** | `019f2eaa-56bb-773a-abfd-bb921ffe33f9` |
| `pganalyze` | `issue` | **Enabled** (dormant — no warehouse source yet) | `019f2eaa-5bce-7f0d-9d75-4971875abb60` |

---

## Connected tools

| Tool | Status | Notes |
|---|---|---|
| **GitHub Issues** | **Connected by this setup** (source ID `019f2eaa-3c44-0000-a2d3-6764d3d83a6f`, first sync started) | Only the `issues` table is syncing. More tables (pull requests, etc.) can be enabled from the [data sources UI](https://us.posthog.com/project/497538/data-management/sources). |
| **pganalyze** | **Responder enabled but warehouse source not detected (dormant)** | You selected pganalyze, but no warehouse source exists yet. The responder is armed and will start emitting once you add the source. See Follow-ups. |
| **Linear** | Not used — skipped | |
| **Zendesk** | Not used — skipped | |

---

## Scout troop

**3 active, 22 disabled.**

### Enabled

| Scout | Reason |
|---|---|
| `signals-scout-general` | Always on — watches cross-product correlations and surfaces no specialist covers |
| `signals-scout-web-analytics` | Specialist: primary surface for a portfolio/blog site — session volume, attribution, landing-page health |
| `signals-scout-web-vitals` | Specialist: explicit Core Web Vitals investment in this project (Lighthouse score work); monitors LCP/INP/CLS/FCP per page |

### Disabled

| Scout | Reason |
|---|---|
| `signals-scout-error-tracking` | Covered by native `error_tracking` inbox source — intentional, not a gap |
| `signals-scout-session-replay` | Covered by native `session_replay` inbox source — intentional, not a gap |
| `signals-scout-ai-observability` | No LLM/AI usage in this project |
| `signals-scout-anomaly-detection` | Not selected as specialist; general scout covers cross-product anomalies |
| `signals-scout-apm` | No distributed tracing / OpenTelemetry in use |
| `signals-scout-csp-violations` | No CSP reporting configured |
| `signals-scout-customer-analytics` | Not a B2B product; no group/account analytics |
| `signals-scout-data-pipelines` | No CDP destinations, batch exports, or hog flows |
| `signals-scout-data-warehouse` | Not a primary surface; enable if warehouse monitoring becomes relevant |
| `signals-scout-experiments` | No active A/B experiments |
| `signals-scout-feature-flags` | No confirmed active feature flag usage; enable if flags are adopted |
| `signals-scout-health-checks` | Not selected as specialist; general scout covers cross-product health |
| `signals-scout-inbox-validation` | Not appropriate for a fresh setup with no shipped fixes to validate |
| `signals-scout-insight-alerts` | Not selected as specialist |
| `signals-scout-logs` | PostHog logs product not in use |
| `signals-scout-mcp-tool-calls` | No `$mcp_tool_call` telemetry in this project |
| `signals-scout-observability-gaps` | Not selected as specialist; general scout covers this cross-product surface |
| `signals-scout-product-analytics` | Web analytics/vitals are more relevant than funnel/retention for a portfolio site |
| `signals-scout-replay-vision` | Replay Vision scanners not configured |
| `signals-scout-revenue-analytics` | No payment SDK or revenue events |
| `signals-scout-skills-store` | Skill hygiene not a user-facing monitoring priority |
| `signals-scout-surveys` | No PostHog surveys in use |

---

## Custom scouts

**Gap analysis performed.** One candidate was identified and proposed; user declined.

| Candidate | Decision | Filter that applies |
|---|---|---|
| Blog post traffic regression (`signals-scout-blog-health`) | **Proposed, declined** | User opted to keep the built-in troop |
| YT Music / activity feed freshness | **Ruled out** | No confirmed PostHog events for API failures on this surface; not watchable |

**Noise escape hatch:** If any enabled scout produces noise, set `emit: false` on its config in PostHog Settings → Self-driving to switch it to dry-run mode without disabling it entirely.

---

## Follow-ups

- [ ] **Enable products manually** — `products-enable` MCP tool was unavailable. Go to [Project Settings](https://us.posthog.com/project/497538/settings) and enable Session Replay, Error Tracking, and Conversations (Support).
- [ ] **Connect a Conversations inbound channel** — Go to [PostHog Settings → Conversations](https://us.posthog.com/project/497538/settings) and connect an email, inbox, or Slack channel so support tickets start flowing into the inbox.
- [ ] **Connect pganalyze warehouse source** — Go to [New data warehouse source](https://us.posthog.com/project/497538/pipeline/new/source) and add pganalyze with your API credentials. The responder is already armed and will start emitting automatically once the source syncs.
- [ ] **Review GitHub Issues sync scope** — Only the `issues` table is currently syncing. Add more tables (PRs, etc.) from the [data sources UI](https://us.posthog.com/project/497538/data-management/sources) if needed.
- [ ] **Enable `signals-scout-feature-flags`** in PostHog if you start using feature flags actively.
- [ ] **Enable `signals-scout-experiments`** in PostHog if you start running A/B experiments.

---

## What happens next

The scout coordinator picks up fresh configs within ~30 minutes and the first scout runs begin. Findings cluster into reports in your [Self-driving inbox](https://us.posthog.com/project/497538/inbox). Immediately-actionable reports (broken pages, web vital regressions, GitHub issue spikes) can be resolved directly from the inbox with code tasks.
