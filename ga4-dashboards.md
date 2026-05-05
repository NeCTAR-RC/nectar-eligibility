# GA4 Dashboard Setup Guide

Step-by-step instructions for creating analytics dashboards in both GA4 properties (Non-Prod and Production). These dashboards track the success metrics defined in the PRD and provide operational insight into tool usage.

## Table of Contents

- [Key Concepts](#key-concepts)
- [GA4 Admin Setup (Prerequisites)](#ga4-admin-setup-prerequisites)
- [Dashboards & Explorations](#dashboards--explorations)
  - [Assessment Funnel](#assessment-funnel)
  - [Outcome & Duration Analysis](#outcome--duration-analysis)
  - [Researcher Profile & Answer Distribution](#researcher-profile--answer-distribution)
  - [Post-Result Engagement](#post-result-engagement)
  - [Back Navigation](#back-navigation)
  - [Session Health](#session-health)
  - [Reports Library Dashboards](#reports-library-dashboards)
  - [Referral Traffic](#referral-traffic)
  - [Link Tracking & Service Click-through](#link-tracking--service-click-through)
- [Reusable Segments](#reusable-segments)
- [Reporting & Data Export](#reporting--data-export)
- [Practical Notes](#practical-notes)

---

## Key Concepts

### PRD Success Metrics — What the Dashboards Must Cover

| #   | PRD Goal                                      | GA4 Coverage                                                                   |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| 3   | Engagement Score > 60% in first 12 months     | Built-in Engagement Rate (no custom dashboard)                                 |
| 4   | Referral traffic from allocation request form | [Referral Traffic](#referral-traffic)                                          |
| 6   | Click-through rate on service recommendations | [Link Tracking & Service Click-through](#link-tracking--service-click-through) |

PRD Goals #1, #2, #5, #7, #8 are measured externally (Freshdesk, allocation system, Grafana, WAVE/Lighthouse) — not in GA4.

### Two Types of Sessions

| Concept                                        | Source                                             | What it means                                                                                                                           |
| ---------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **GA4 session**                                | GA4's built-in `session_id` (cookie-based)         | A browser visit. Expires after 30 min inactivity. One GA4 session can contain multiple assessment runs if the user clicks "Start Over". |
| **App session** (`session_id` event parameter) | App's localStorage, incremental per assessment run | One assessment attempt. Each "Start Over" creates a new app `session_id`. A single GA4 session can have multiple app sessions.          |

When counting "how many assessments were completed", use **Event count for `assessment_complete`** (one per app session), not GA4's Sessions metric. When counting "how many unique people used the tool", use **Active Users** (GA4's deduplicated user count).

### Lifecycle Events: `assessment_complete` vs `result_viewed`

Two events bracket the post-questions phase, and the gap between them is meaningful:

| Event                 | Fires when                                                          | What it means                                                              |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `assessment_complete` | User answers the final question — they arrive at the outcome screen | They saw their eligibility outcome (tick or X)                             |
| `result_viewed`       | User acknowledges requirements and proceeds to the full result page | They engaged with the result content (PDF, services, next steps available) |

`assessment_complete` count − `result_viewed` count = users who saw their outcome but stopped at the requirements gate. Segment by `Outcome` to see whether ineligible vs eligible users drop off at different rates.

### Repeat User Skew

A single user can complete the assessment multiple times (each "Start Over" = new app session). This inflates event counts. Every dashboard should account for this:

- **`is_repeat`** on `assessment_complete` — `"true"` if the browser has completed before. Filter to first-time completions only.
- **`is_first_download`** on `pdf_download` — `"true"` for the first-ever PDF download per browser. Filters meaningful downloads from re-downloads.
- **Active Users** (GA4 built-in) — Deduplicated unique users, regardless of repeat runs.
- **Event count** — Total volume including repeats. Useful for capacity planning but not "how many researchers used the tool".

**Approach**: Show both raw event counts AND unique-user / first-time-only filtered views so stakeholders see total usage AND deduplicated impact.

### Engagement Rate (PRD Goal #3)

The PRD target: _"achieve an engagement score of > 60% in the first 12 months."_

GA4's built-in **Engagement Rate** = Engaged Sessions / Total Sessions. A session is "engaged" if it lasts > 10 seconds, has a key event, OR has 2+ page views. Since the assessment involves multiple page views (each step is a URL change), most real assessment sessions will be engaged — making this a meaningful quality signal.

The metric is based on traffic to the eligibility site in Google Analytics, not a ratio against Nectar Cloud user numbers.

---

## GA4 Admin Setup (Prerequisites)

Do this **once per property** (Non-Prod and Production). Dashboards will not show custom data until these are registered.

### 1. Register Custom Dimensions

`Admin > Data display > Custom definitions > Custom dimensions > Create custom dimension`

| Dimension name    | Scope | Event parameter     |
| ----------------- | ----- | ------------------- |
| Step ID           | Event | `step_id`           |
| Answer Value      | Event | `answer_value`      |
| Outcome           | Event | `outcome`           |
| Assessment Path   | Event | `path`              |
| Last Step         | Event | `last_step`         |
| From Step         | Event | `from_step`         |
| To Step           | Event | `to_step`           |
| CTA Label         | Event | `cta_label`         |
| Is Repeat         | Event | `is_repeat`         |
| Is First Download | Event | `is_first_download` |

Note: `session_id` is intentionally not registered as a custom dimension due to high cardinality. GA4's built-in session tracking handles session grouping.

### 2. Register Custom Metrics

`Admin > Data display > Custom definitions > Custom metrics > Create custom metric`

| Metric name      | Scope | Event parameter    | Unit     |
| ---------------- | ----- | ------------------ | -------- |
| Duration Seconds | Event | `duration_seconds` | Seconds  |
| Question Number  | Event | `question_number`  | Standard |

### 3. Mark Key Event

`Admin > Data display > Events` — find `assessment_complete` in the event list, toggle **"Mark as key event"** to ON. Keep counting method as "Once per event".

This surfaces assessment completion on the main GA4 dashboard and enables it as a conversion metric in all reports and explorations.

Note: The event must have been received at least once before it appears in the list. Run through the assessment with DebugView enabled to populate it (see [README.md — Testing with GA4 DebugView](README.md#testing-with-ga4-debugview)).

### 4. Set Data Retention to 14 Months

`Admin > Data settings > Data retention` — set Event data retention to **14 months** (maximum for standard GA4).

This is critical for Explore reports, which only access data within the retention window. The default 2 months is insufficient for trend analysis. Standard Reports use aggregated data and are not affected.

### 5. Verify Enhanced Measurement

`Admin > Data streams > [web stream] > Enhanced measurement` — confirm these are toggled ON:

- **Page views** — tracks each step URL change (useful for funnel analysis)
- **Scrolls** — 90% scroll depth
- **Outbound clicks** — enable it, but note it does not fire for `@ardc-ui/react` `<Link>` anchors (React Aria `usePress` blocks the click event). Outbound clicks are tracked via explicit `cta_click` instrumentation in code instead — see [Link Tracking](#link-tracking--service-click-through).

---

## Dashboards & Explorations

### Assessment Funnel

**GA4 feature**: Explore > Funnel exploration. **Name**: `Funnel Exploration`. Closed funnel (the app routes all users through step 1; no deep-linking). Per-outcome drop-off via user-scoped segments applied via `SEGMENT COMPARISONS`. Variables: dimensions `Step ID`, `Answer Value`, `Outcome`, `Device category`; metrics default.

**5 funnel steps (applies to all tabs):**

| #   | Name                           | Event                 | Parameter filter |
| --- | ------------------------------ | --------------------- | ---------------- |
| 1   | Visited                        | `session_start`       | —                |
| 2   | Answered at least one question | `step_completed`      | —                |
| 3   | Assessment completed           | `assessment_complete` | —                |
| 4   | Viewed Result                  | `result_viewed`       | —                |
| 5   | (per tab — see below)          | (per tab)             | (per tab)        |

Use sequencing **"is indirectly followed by"** on every step (plain `session_start → step_completed` sequence has page_views etc. in between, so indirect is required).

**Tabs in the exploration:**

| Tab              | Step 5 event   | Step 5 parameter filter |
| ---------------- | -------------- | ----------------------- |
| `Downloaded PDF` | `pdf_download` | —                       |
| `Applied`        | `cta_click`    | —                       |

---

### Outcome & Duration Analysis

**GA4 feature**: Explore > Free-form exploration. **Name**: `Outcome & Duration Analysis`. Variables: dimensions `Outcome`, `Is Repeat`, `Date`, `Assessment Path`; metrics `Event count`, `Active users`, `Duration Seconds`. Filter is per-tab: every tab needs `Event name` exactly matches `assessment_complete` set individually.

| Tab                  | Viz   | Rows / Breakdowns       | Columns                | Values                        |
| -------------------- | ----- | ----------------------- | ---------------------- | ----------------------------- |
| Outcome Distribution | Donut | Outcome (→ BREAKDOWNS)  | —                      | Event count                   |
| Outcome Trends       | Line  | — (Date = X axis, auto) | Outcome (→ BREAKDOWNS) | Event count                   |
| First Time VS Repeat | Table | Outcome                 | Is Repeat              | Event count, Active users     |
| Duration by Outcome  | Table | Outcome                 | —                      | Duration Seconds, Event count |
| Duration by Path     | Table | Assessment Path         | —                      | Duration Seconds, Event count |

**Duration metric**: GA4 event-scoped custom metrics default to SUM. Register a Calculated Metric `Avg Duration Seconds` (Admin > Custom definitions > Calculated metrics; formula `{Duration Seconds}/{Event count}`, unit Seconds), then use it in Duration by Outcome and Duration by Path tabs. It can take a few hours to appear in the Explore metric picker after registration.

---

### Researcher Profile & Answer Distribution

**GA4 feature**: Explore > Free-form exploration. **Name**: `Researcher Profile & Answers`. Variables: dimensions `Event name`, `Step ID`, `Answer Value`, `Assessment Path`; metric `Event count`.

All tabs 1–6 use: Breakdowns = Answer Value, Values = Event count, Filter = `event_name` exactly matches `step_completed` + `step_id` condition.

| Tab                   | step_id filter           | Visualisation | Notes                                                                      |
| --------------------- | ------------------------ | ------------- | -------------------------------------------------------------------------- |
| Professional Role     | `professional-role`      | Bar           | —                                                                          |
| AU Affiliation        | `australian-affiliation` | Donut         | yes/no                                                                     |
| Auckland Affiliation  | `auckland-affiliation`   | Donut         | yes/no                                                                     |
| Funding Sources       | `funding-source`         | Bar           | `answer_value` is comma-separated; each combo is a distinct value          |
| Member Organisation   | `member-organisation`    | Donut         | yes/no                                                                     |
| Selected Organisation | `member-organisation`    | Table         | Add filter `answer_value` begins with `yes,` — format is `yes, [org-name]` |
| Full Paths            | _(no step_id filter)_    | Table         | Rows = Assessment Path, filter `event_name` = `assessment_complete`        |

---

### Post-Result Engagement

**GA4 feature**: Explore > Free-form exploration. **Name**: `Post-Result Engagement`. Variables: dimensions `Event name`, `Outcome`, `Last Step`; metric `Event count`.

| Tab                 | Viz | Breakdowns | Values      | Filter                                              |
| ------------------- | --- | ---------- | ----------- | --------------------------------------------------- |
| Restarts by Outcome | Bar | Outcome    | Event count | `Event name` exactly matches `assessment_restarted` |
| Abandonment by Step | Bar | Last Step  | Event count | `Event name` exactly matches `assessment_abandoned` |

---

### Back Navigation

**GA4 feature**: Explore > Free-form exploration. **Name**: `Step Back Analysis`. UX diagnostic — identifies which questions users reconsider.

- Visualisation: Table
- Rows: From Step, To Step
- Values: Event count
- Filter: `event_name` exactly matches `step_back`

---

### Session Health

**GA4 feature**: Explore > Free-form exploration. **Name**: `Session Health`. Confirms the localStorage session-resume feature works in the wild.

| Tab                       | Config                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Session Events            | Table: Rows = Event name (`session_restored`, `session_expired`). Values = Event count.                  |
| Session Trend             | Line: Date × Event count for `session_restored`.                                                         |
| GA Session vs App Session | Table: Active Users, Sessions, Event count for `assessment_complete`. Ratio reveals runs-per-GA-session. |

Plus `Reports > Tech > Tech details` for device/browser/OS breakdown — built-in, no config needed.

---

### Reports Library Dashboards

Two custom reports live in `Reports > Library` (built identically in both properties), alongside a saved Traffic acquisition copy used by [Referral Traffic](#referral-traffic).

#### Nectar Eligibility - Overview Report

**GA4 feature**: Overview report. **Purpose**: top-level KPI snapshot for stakeholders. **Default date range**: Last 28 days.

- **Hero scorecards**: `Active users`, `Key events`, `Engagement rate`, `Duration Seconds`
- **Cards** (6):

| Card                            | Metric                                                         | Dimension       |
| ------------------------------- | -------------------------------------------------------------- | --------------- |
| Active users by Country         | Active users                                                   | Country         |
| Active users by Device category | Active users                                                   | Device category |
| Active users by Browser         | Active users                                                   | Browser         |
| Event count by Event name       | Event count                                                    | Event name      |
| New vs. Returning users         | Active users / Event count / Key events / Total revenue (tabs) | Date trend      |
| Overview hero card              | Active users / Event count / Key events / Total revenue (tabs) | —               |

#### Nectar Eligibility - Detailed Report

**GA4 feature**: Detail report. **Purpose**: assessment path × outcome breakdown with duration. **Default date range**: Last 28 days.

- **Filter**: `Event name` exactly matches `assessment_complete`
- **Dimensions**: `Assessment Path`, `Outcome`
- **Metrics**: `Duration Seconds`, `Event count`
- **Charts**:
  - Line chart — `Duration Seconds by Assessment Path` over time (daily granularity)
  - Bar chart — `Duration Seconds by Assessment Path`

Both reports sit in the Library without being published to a collection — reach them via `Reports > Library` and star them for quick nav.

---

### Referral Traffic

**PRD Goal #4**: _"Integrate tool into the new allocation request process — referral traffic from `dashboard.nectar.rc.edu.au/allocation/request/edit`"_

**GA4 feature**: built-in **Traffic acquisition** report. Open from `Reports > Library` (Detail report named "Traffic acquisition"). Unfiltered is sufficient while traffic is low. When the source list grows long, add `Session source/medium contains dashboard.nectar.rc.edu.au` to the saved copy in `Reports > Library`.

---

### Link Tracking & Service Click-through

**PRD Goal #6**: _"Increase awareness and usage of other ARDC Nectar Cloud Services — click-through rate on service recommendations"_

**GA4 feature**: Explore > Free-form exploration. **Name**: `Link Tracking & Service Click-through`. Variables: dimensions `CTA Label`, `Outcome`, `Date`, `Event name`; metric `Event count`.

All 4 tabs filter `Event name` exactly matches `cta_click`:

| Tab                   | Viz  | Breakdowns | Values      |
| --------------------- | ---- | ---------- | ----------- |
| CTA Clicks by Label   | Bar  | CTA Label  | Event count |
| CTA Clicks by Outcome | Bar  | Outcome    | Event count |
| CTA Trend by Label    | Line | CTA Label  | Event count |
| CTA Trend             | Line | —          | Event count |

**`cta_click` comes from app code.** Every tracked CTA has explicit `onPress` firing `trackCtaClick(outcome, ctaLabel, sessionId)` from [src/services/analytics.ts](src/services/analytics.ts). GA4's auto outbound-click does not fire for `@ardc-ui/react` `<Link>` anchors (`react-aria-components` `usePress` stops event propagation), so auto click tracking is not used — see [README.md](README.md) for the house rule.

For the PRD's 6-monthly review: extract CTA counts from "CTA Clicks by Label". Click-through rate per service = CTA clicks / `assessment_complete` count for eligible outcomes.

---

## Reusable Segments

Three user-scoped outcome segments live inside the Funnel Exploration (scoped to that exploration; not promoted to property):

| Segment            | Scope | Condition                                                     |
| ------------------ | ----- | ------------------------------------------------------------- |
| National Outcome   | User  | `event_name = assessment_complete AND outcome = national`     |
| Local Outcome      | User  | `event_name = assessment_complete AND outcome = local`        |
| Ineligible Outcome | User  | `event_name = assessment_complete AND outcome = not-eligible` |

If a future exploration needs them, open the segment chip in the Funnel Exploration and click **"Save to property"**. Ad-hoc segments (e.g. First-time Completions) can be defined inside an exploration in ~30 seconds — no need to pre-build.

GA4's auto-added default segments (Direct/Paid/Mobile/Tablet traffic, US) pre-populate every new exploration. They're e-commerce template defaults — ignore or remove per-exploration for a cleaner Variables panel.

---

## Reporting & Data Export

- **Scheduled email**: any `Reports > Library` report → **Share icon** > **Schedule email delivery**. Daily/weekly/monthly PDF or CSV.
- **CSV/PDF download**: any report → **Share icon** > **Download file**.
- **Exploration export**: any Explore tab → **Share icon** > **Export data** (CSV, TSV, PDF, Google Sheets).
- **GA4 API**: [Google Analytics Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1) for programmatic access (Python, Apps Script, etc.).

---

## Practical Notes

- **Build on Non-Prod first**, then recreate on Production. GA4 has no export/import for explorations between properties — they must be rebuilt manually.
- **Wait 24–48 hours** after admin setup for data to propagate to standard reports. Explore reports access real-time data.
- **Data thresholding**: Low traffic may cause GA4 to hide dimensions. Switch `Admin > Reporting identity` to "Device-based" to reduce this.
- **Explorations are per-user**: Use three-dot menu > Share to share with team members. They can then duplicate and modify.
- **Free GA4 limits**: 50 custom dimensions, 50 custom metrics. This app uses 10 + 2, well within limits.
- **Funding source caveat**: `answer_value` for the funding-source step is comma-separated (e.g., "ncris, government-grant"). GA4 treats each unique combination as a separate dimension value.
- **Organisation answer format**: `answer_value` for member-organisation is `yes, [org-name]` or `no, [org-name]`. Filter for values starting with `yes,` to see selected organisations.
