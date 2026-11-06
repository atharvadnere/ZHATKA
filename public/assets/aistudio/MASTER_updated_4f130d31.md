# MASTER.md — ZHATKA: Adaptive Campus Energy Response Planner

> Engineering blueprint and single source of truth for the Builder AI.
> Version 2.0 · Hackathon prototype (PS6 "The Sleeping Campus") · Team "The Other Side", SRMIST · All campus data is SIMULATED.
> Tagline: **Smarter Decisions. Safer Operations. Measurable Efficiency.**

**How to read this document.** Sections 1–6 explain *what* and *why*. Sections 7–11 define the five modules. Sections 12–17 define screens, design, architecture and data. Sections 18–24 define scenarios, testing, build order, rules, scope and acceptance. Where this document and your own instinct disagree, follow this document. Where this document is silent, choose the simplest conservative option and record it in `docs/DECISIONS.md`.

**You are building the application itself**, not another prompt. Build a working, demonstrable, fully interactive prototype. A beautiful UI with decorative buttons is a failure. Do not redesign the project into something more complicated, do not add features outside the five modules, and do not produce a generic energy dashboard.

---

## 1. Project overview

| Item | Value |
|---|---|
| Product name | ZHATKA — Adaptive Campus Energy Response Planner |
| Category | Campus Energy Intelligence and Resource Management |
| Hackathon problem | PS6 "The Sleeping Campus: Occupancy-Aware Energy Intelligence" |
| Team / institution | The Other Side / SRMIST |
| Nature | Simulated software prototype. It does **not** control real campus electrical infrastructure and receives **no** real campus sensor data. |
| Developers | Beginner students using AI builders. Simplicity beats cleverness. |
| Target builders | Lovable, Bolt, Replit, v0 or comparable. If the builder has a limitation, document it in `docs/DECISIONS.md` and use the simplest alternative that keeps the objectives unchanged. |

### 1.1 PS6 capability mapping (the judges' checklist)

| PS6 expected capability | Where it lives | Honest status in this MVP |
|---|---|---|
| Room-level occupancy and energy monitoring (supplied or simulated readings) | Module 1 (§7), Screen 1 | Full |
| Timetable and event-calendar integration to estimate expected room use | Module 1 `scheduledStatus` field (§7.2, §15) | **Simplified:** each room carries a simulated schedule status; no full timetable or event-calendar engine |
| Unusual consumption and possible equipment issues | Module 1 flags (§7.4) | Simple rule-based flags (high usage, empty-but-consuming), not a detector suite |
| Peak-demand forecasting and saving recommendations | Module 3 what-if scenario (§9), Module 4 recommendations | **Simplified:** peak/shortage is handled by the scenario planner; there is no forecasting model |
| Essential-equipment protection and configurable constraints | Module 4 registry (§10.1), Module 3 priorities and minimums (§9) | Full |
| Before/after savings, manual approval, audit history | Modules 4 and 5 (§10, §11) | Full, simulated |

Operational boundary from PS6: *simulated or explicitly authorised control endpoints only; essential loads protected; automated control requires configured approval and safeguards.* This spec satisfies it by making all control **simulated**, **approval-gated** and **safety-rechecked at action time**.

---

## 2. Product definition and objectives

ZHATKA is a **safety-first campus energy-management and decision-support application**. It helps campus administrators monitor electricity consumption, identify potential energy waste, validate incoming data, optimise limited electricity resources during shortages, and generate safe, explainable, human-approved recommendations.

**Three differentiators (in this order of importance for judging):**
1. **Dynamic resource prioritisation during electricity shortages** (Module 3).
2. **Data validation and robustness against malformed or malicious inputs** (Module 2).
3. **Protection of essential equipment and human-authorised decisions** (Module 4).

This is a **decision-support prototype**, not an electrical protection or supervisory control system. It recommends actions; it never physically switches anything.

**Objectives, in priority order**
1. Correct, explainable safety decisions.
2. Both hackathon constraints genuinely handled by working logic, not text on a dashboard.
3. A complete simulated workflow: monitor → validate → recommend → approve → (simulated) act → verify → audit.
4. Honest labelling of simulated / potential / estimated / measured-simulated values.
5. A clear, premium-looking interface over all of the above.

---

## 3. The two hackathon constraints (binding requirements)

These must change the application's real behaviour and must be testable.

### 3.1 Constraint 1 — Sudden resource shortage

Demand rises to **3×** while the available resource pool drops by **50%**. Electrical interpretation:

| Quantity | Value |
|---|---|
| Original demand | 100 kW |
| Original available capacity | 100 kW |
| New demand | 300 kW |
| New available capacity | 50 kW |
| New deficit | 250 kW |
| Share of new demand that can be supplied | 50 ÷ 300 = **16.67%** |

The application must flag this as a **severe resource emergency**. It must not distribute power blindly or cut every building proportionally. It must use configurable priority categories (P0–P3) and configurable minimum operating requirements. Implemented by Module 3.

### 3.2 Constraint 2 — Malformed or malicious inputs

The application must survive and correctly classify: missing fields, duplicate records, invalid timestamps, negative or unrealistic values, unexpected Unicode, malformed JSON, malformed CSV, unexpected data types, extremely large files, inconsistent identifiers, repeated or conflicting readings, and potentially malicious strings. Input is validated and sanitised **before** it can reach the monitoring, planning or recommendation engines. Invalid or suspicious records must never crash the app or silently influence decisions. Implemented by Module 2.

---

## 4. User and approval model

Institutional product. **No student accounts, registration, booking interface, login or role system.**

- One persona: **Campus Energy Administrator**. Every approval, rejection and configuration change is recorded with `actor = "Administrator (simulated)"`.
- The top bar shows a persistent notice: *"Simulated prototype — no real campus data, no real control."*
- There is no authentication. Never describe anything in the UI as authentication or security of users.
- Escalation targets (for infeasible allocations) are shown as text: "authorised campus electrical operators". No messaging is sent.

---

## 5. Core product principles

1. **Safety is a gate, never a score.** High savings can never make an unsafe action eligible.
2. **UNKNOWN ≠ EMPTY ≠ ZERO.** Absence of data is not absence of people.
3. **Humans decide.** Every simulated control action needs recorded administrator approval.
4. **Validate before use.** Nothing enters an engine until it passes the Module 2 pipeline (or is the built-in seed data, which is validated by the same code at load).
5. **Re-check at action time.** Safety is re-evaluated when an approved action is applied; approval is permission, not a guarantee.
6. **Explain everything.** Each recommendation stores evidence, not just a message.
7. **Be honest.** Label values `SIMULATED`, `POTENTIAL`, `ESTIMATED`, `MEASURED (SIMULATED)`. No machine-learning claims for rule logic. No claim of production-grade security.
8. **One responsibility per module.** Validation, monitoring, planning, safety, recommendation and audit logic live in separate pure-function modules outside React components.
9. **Every visible control works.** No decorative buttons, no hardcoded KPI values unrelated to state.

---

## 6. Scope: five modules, three screens

Build **exactly** these five interconnected modules. Do not add a sixth.

| # | Module | Primary screen |
|---|---|---|
| 1 | Campus Monitor | Screen 1 — Campus Overview |
| 2 | Data Integrity & Security Engine | Screen 3 — Data Integrity & Security |
| 3 | Adaptive Resource Planner | Screen 2 — Emergency Resource Planner |
| 4 | Safety & Recommendation Centre | Section/tab inside the app shell ("Safety & Recommendations") |
| 5 | Verification & Audit | Section/tab inside the app shell ("Audit & Verification") |

Sidebar order (use `react-router-dom` or simple tab state; either is fine):

1. Campus Overview
2. Emergency Planner
3. Data Integrity
4. Safety & Recommendations
5. Audit & Verification

Do not create dozens of pages or an enterprise-style application.

---

## 7. MODULE 1 — Campus Monitor

**Purpose:** give administrators a basic understanding of campus electricity consumption and surface possible inefficiencies, without ever treating a finding as permission to switch anything off.

### 7.1 Required functionality

1. Total electricity demand (see §7.5 for exact definition).
2. Available electrical capacity (shared with the Planner's original capacity, default 100 kW, labelled simulated).
3. Potentially avoidable consumption.
4. Data-quality summary (from the latest validation result and per-room data quality).
5. Room-level consumption table.
6. Occupancy and room capacity.
7. Occupancy sensor status.
8. Meter status.
9. Identification of rooms with unusually high consumption.
10. Identification of empty rooms still consuming power.
11. Select a room to inspect it (room details drawer).

### 7.2 Room state model

The labels below are **presentation classes derived from independent properties**. Do **not** store a single `status` column. Store the underlying properties and **derive** the display state.

| Property | Values | Source |
|---|---|---|
| `occupancyState` | `OCCUPIED`, `VERIFIED_EMPTY`, `UNKNOWN` | Occupancy resolver (§7.3) |
| `unknownReason` | `SENSOR_OFFLINE`, `SENSOR_DEGRADED`, `STALE_DATA`, `INVALID_DATA`, `NO_DATA`, or null | Resolver |
| `sensorStatus` / `meterStatus` | `HEALTHY`, `DEGRADED`, `OFFLINE` | Room record |
| `isProtected` | boolean | Protected-equipment registry (any active protected item in the room) — **never** inferred from room names |
| `maintenanceActive` | boolean | Simple per-room maintenance flag with optional end time, compared with the clock |
| `scheduleConflict` | `NONE`, `SESSION_BUT_EMPTY`, `NO_SESSION_BUT_OCCUPIED` | Resolver compares `scheduledStatus` with occupancy |
| `usageFlag` | `NORMAL`, `HIGH_USAGE`, `EMPTY_BUT_CONSUMING` | §7.4 |
| `dataQuality` | `HEALTHY`, `WARNING`, `UNRELIABLE` | §8.9 |

**Primary tile/row state** (display only), first match wins: `MAINTENANCE` → `PROTECTED` → `UNKNOWN` → `HIGH_USAGE` → `OCCUPIED` → `EMPTY (verified)`; every other true property appears as a secondary badge. Implement as one pure function `derivePrimaryState(roomProperties)` with unit tests. **The safety engine must never read the primary state**; it reads the underlying properties.

### 7.3 Occupancy resolver

Pure function; `UNKNOWN` is never coerced to zero.

```js
export function resolveOccupancy({ sensorStatus, occupancy, lastSeenTs, now, freshnessMinutes, scheduledStatus }) {
  let state = 'UNKNOWN';
  let unknownReason = null;
  let count = null;
  let ageMinutes = null;

  if (sensorStatus === 'OFFLINE') {
    unknownReason = 'SENSOR_OFFLINE';
  } else if (sensorStatus === 'DEGRADED') {
    unknownReason = 'SENSOR_DEGRADED';
  } else if (occupancy === null || occupancy === undefined || occupancy === 'UNKNOWN') {
    unknownReason = 'NO_DATA';
  } else {
    ageMinutes = minutesBetween(lastSeenTs, now);          // null/NaN timestamp -> INVALID_DATA
    const valid = Number.isInteger(occupancy) && occupancy >= 0;
    if (ageMinutes === null || ageMinutes < -5) {
      unknownReason = 'INVALID_DATA';                      // missing or future timestamp
    } else if (ageMinutes > freshnessMinutes) {
      unknownReason = 'STALE_DATA';
    } else if (!valid) {
      unknownReason = 'INVALID_DATA';
    } else {
      count = occupancy;
      state = count > 0 ? 'OCCUPIED' : 'VERIFIED_EMPTY';
    }
  }

  const inSession = scheduledStatus === 'IN_SESSION' || scheduledStatus === 'EVENT';
  let scheduleConflict = 'NONE';
  if (state === 'VERIFIED_EMPTY' && inSession) scheduleConflict = 'SESSION_BUT_EMPTY';
  if (state === 'OCCUPIED' && scheduledStatus === 'NO_SESSION') scheduleConflict = 'NO_SESSION_BUT_OCCUPIED';

  return { state, unknownReason, count, ageMinutes, scheduleConflict };
}
```

Rules: `null`, `undefined`, negative, non-integer or `NaN` occupancy is **never** coerced to 0. Default `freshnessMinutes` = 60 (editable constant in `src/config/defaults.js`). `scheduledStatus` values: `IN_SESSION`, `NO_SESSION`, `EVENT`, `UNKNOWN`.

### 7.4 Usage flags (simple, rule-based, thresholds configurable)

Skip flagging for a room when its **power meter** is not `HEALTHY` (show "meter unreliable" instead). Defaults live in `defaults.js`:

| Flag | Rule | Meaning |
|---|---|---|
| `HIGH_USAGE` | `powerKw ≥ highRatio × baselinePowerKw` (default 1.5) **and** `powerKw − baselinePowerKw ≥ highMinKw` (default 0.3 kW) | Unusually high; triggers an **investigate** recommendation only |
| `EMPTY_BUT_CONSUMING` | `occupancyState = VERIFIED_EMPTY` **and** `powerKw − baselinePowerKw ≥ emptyExcessMinKw` (default 0.5 kW) | Empty room using more than its idle baseline; triggers a **review** recommendation, subject to the safety engine |

A room carries **one** `usageFlag`. If both rules match (for example A-102: verified empty, 3.1 kW against a 0.6 kW baseline), `EMPTY_BUT_CONSUMING` wins, so the room gets one review recommendation and is counted once in the potentially-avoidable KPI. `HIGH_USAGE` applies only to rooms that are not flagged `EMPTY_BUT_CONSUMING`. `baselinePowerKw` is the room's normal expected load (idle baseline for empty rooms). Wording in the UI is always "possible equipment issue — inspection suggested", never "fault diagnosed".

### 7.5 KPI definitions (computed from state, never hardcoded)

| KPI | Definition |
|---|---|
| Total demand | Sum of `powerKw` over rooms in the table whose `meterStatus` is `HEALTHY` or `DEGRADED` (kW). Label: "Monitored sample rooms (simulated)". Rooms with `OFFLINE` meters are counted separately as "meter offline" and excluded from the sum. |
| Available capacity | `originalCapacityKw` from the Planner scenario (default 100 kW), labelled simulated. |
| Potentially avoidable consumption | Σ `(powerKw − baselinePowerKw)` over rooms flagged `HIGH_USAGE` or `EMPTY_BUT_CONSUMING` **and** not protected, not under maintenance, with `dataQuality ≠ UNRELIABLE`; UNKNOWN-occupancy and schedule-conflict rooms are listed as "excluded pending verification". Unit kW. Tag `POTENTIAL`. |
| Data-quality summary | Accepted / warning / rejected / quarantined / duplicate counts of the latest validation run, plus number of rooms with `dataQuality = UNRELIABLE`. |

### 7.6 Visual components

KPI cards; room table (columns: room, building, occupancy [count or UNKNOWN], capacity, power kW, baseline kW, sensor status, meter status, flags/badges, status); consumption bar chart (power vs baseline per room) or line chart; room details drawer; status indicators (icon **and** colour); search box and filters (building, status, flag). No 3D, no map, no campus twin.

### 7.7 Room details drawer

Shows: identifiers, capacity, occupancy (count or UNKNOWN with the reason), freshness age, sensor and meter status, power vs baseline, schedule status and any conflict, protected equipment list with reasons, maintenance flag (with a toggle and optional end time), data quality, active recommendations, and the current safety evaluation for `REVIEW_EMPTY_ROOM_LOAD` with its reason code (this feeds "why not?").

### 7.8 Important rules

- Empty does not automatically mean safe to switch off.
- Missing occupancy is `UNKNOWN`, never zero.
- High consumption triggers a review/investigate recommendation, never an automatic control action.
- Protected equipment is always identified in the table and drawer.

---

## 8. MODULE 2 — Data Integrity & Security Engine

**Purpose:** prevent corrupted, malformed or malicious data from influencing energy decisions. **This module must genuinely work**: uploading a file runs real validation code and its result changes what the rest of the app does.

Location: `src/logic/validation/`. No dependency on React. Pure functions in, plain objects out.

### 8.1 Input formats and limits

Administrators upload **CSV** or **JSON** files. A downloadable **sample valid dataset** (CSV and JSON) is provided; it is regenerated at download time with fresh timestamps so it passes freshness checks.

Limits (constants in `defaults.js`): max file size **1 MB**, max rows **5,000**, max string length **64** characters (free-text `note` field: **200**), max file name length 100.

### 8.2 Upload record schema ("room reading")

| Field | Required | Rule |
|---|---|---|
| `readingId` | yes | identifier format (§8.6) |
| `sourceId` | yes | identifier format |
| `roomId` | yes | identifier format **and** must exist in the room registry |
| `timestamp` | yes | ISO 8601 with timezone |
| `powerKw` | yes | finite number |
| `occupancy` | no | non-negative integer, or the literal `UNKNOWN`, or empty (treated as UNKNOWN) |
| `meterType` | no | `UNIDIRECTIONAL` (default) or `BIDIRECTIONAL` |
| `sensorStatus` | no | `HEALTHY`, `DEGRADED`, `OFFLINE` (default `HEALTHY`) |
| `note` | no | free text, length-limited, scanned for suspicious content |

Unknown extra fields are **ignored and reported as a WARNING**; they are never copied into application state. Accepted records are applied to the room registry (latest valid timestamp wins) and also stored as normalised `SensorReading` objects (§15) used for duplicate keys and audit.

### 8.3 Validation pipeline

Every uploaded file passes through all stages in order. A file-level failure at Stage 1 or 2 rejects the **file** (no records processed). From Stage 3 onwards, results are per record and a bad record never stops processing of the others.

**Stage 1 — File validation**
- Check extension is `.csv` or `.json` (case-insensitive) and file name length.
- Check `file.size ≤` max size **before** reading content; re-check text length after reading.
- Reject files containing NUL bytes (binary) or that do not start like their claimed type (JSON must start with `{` or `[` after trimming a BOM/whitespace).
- Enforce max row count (reject the whole file if exceeded).
- Browser MIME types are advisory only; never rely on them alone.

**Stage 2 — Format validation**
- JSON: `JSON.parse` inside try/catch. Accept either an array of records or `{ "records": [...] }`. Anything else → file rejected with "Unexpected JSON structure". Malformed JSON → file rejected with the parser's message (shown as inert text). Never use `eval`, `Function`, or `new Function`.
- CSV: PapaParse (or equivalent) with `header: true`, `skipEmptyLines: true`, `dynamicTyping: false` (all values arrive as strings), capped by max rows. Parser errors for a row (too many/too few fields, unterminated quotes) → that row `REJECTED` with the reason; if no usable rows remain → file rejected.
- Header check: all required column names must be present (case-sensitive after trimming, with NFKC normalisation). Missing required column → file rejected, naming the column.
- Copy only whitelisted fields into **new plain objects** (`Object.create(null)` or a fresh `{}` with explicit assignments). Reject any record containing own keys `__proto__`, `constructor` or `prototype`. Never `Object.assign`/spread untrusted objects into state.

**Stage 3 — Data-type validation**
- `occupancy`: JSON number must be an integer; JSON string only allowed as the literal `UNKNOWN`; CSV text must match `^\d+$` or equal `UNKNOWN` (case-insensitive) or be empty. Anything else → `REJECTED` (`INVALID_OCCUPANCY_TYPE`).
- `powerKw`: JSON must be a `number` (a numeric string in JSON is an unexpected type → `REJECTED`); CSV text must match `^-?\d+(\.\d+)?$` (no hex, no thousands separators, no `Infinity`/`NaN`) and `Number.isFinite` must be true. A non-numeric string such as `"high"` → `REJECTED` (`INVALID_POWER_TYPE`).
- `timestamp`: strict regex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$`, then confirm the date really exists (reject 2026-02-30) and `Date.parse` is finite. Failure → `QUARANTINED` (`INVALID_TIMESTAMP`). Missing timestamp → `QUARANTINED` (`MISSING_TIMESTAMP`). A timestamp more than 5 minutes in the future → `QUARANTINED` (`FUTURE_TIMESTAMP`). A timestamp older than the freshness window → `WARNING` (`STALE_TIMESTAMP`; the room becomes UNKNOWN with `STALE_DATA`, not zero).
- Identifiers: normalise with `String.prototype.normalize('NFKC')`, then match `^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$`; room IDs additionally follow the campus pattern (e.g. `A-101`). Bad format → `REJECTED` (`INVALID_ID_FORMAT`). Well-formed `roomId` not in the registry → `QUARANTINED` (`UNKNOWN_ROOM`).
- Booleans/enums (`meterType`, `sensorStatus`): only listed values (case-insensitive) → else `REJECTED`. No truthy coercion (`"yes"`, `1`, `"true"` are not accepted for enum fields).
- Missing required field: missing `readingId`, `sourceId`, `roomId` or `powerKw` → `REJECTED` (`MISSING_REQUIRED_FIELD`); missing `timestamp` → `QUARANTINED`. Missing `occupancy` → value becomes `UNKNOWN` with a `WARNING` (`OCCUPANCY_MISSING`) if everything else is valid.

**Stage 4 — Range validation**
- Occupancy `< 0` → `REJECTED` (`NEGATIVE_OCCUPANCY`).
- Occupancy `> roomCapacity` → `QUARANTINED` (`OCCUPANCY_EXCEEDS_CAPACITY`) — physically impossible without a counting error, so it must not drive decisions.
- Power: each room has a `maxPowerKw` (configured; default `max(10 kW, 4 × baselinePowerKw)` for new rooms, i.e. the room's rated circuit limit, not its normal load; seed values are in §17.1; editable in the registry). `powerKw > maxPowerKw` → `QUARANTINED` (`UNREALISTIC_POWER`). Any `|powerKw| > 100000` → `REJECTED` (`ABSURD_POWER`).
- **Negative power depends on meter type.** `UNIDIRECTIONAL` (default) → `REJECTED` (`NEGATIVE_POWER_UNIDIRECTIONAL`). A room explicitly configured `BIDIRECTIONAL` in the registry may report negative values (energy export) down to `−maxPowerKw`; they are accepted with a `WARNING` (`ENERGY_EXPORT`). A record that *claims* `BIDIRECTIONAL` in the file for a room registered `UNIDIRECTIONAL` is `QUARANTINED` (`METER_TYPE_MISMATCH`) — a file cannot reconfigure a meter.

**Stage 5 — Duplicate detection**
- Key = `` `${sourceId}|${roomId}|${timestampUtcMillis}` `` (after normalisation).
- Two passes over the file. Same key and identical payload → the first is kept, later ones are `DUPLICATE` (never counted twice). Same key but **different** values (conflicting readings) → **all** records with that key are `QUARANTINED` (`CONFLICTING_DUPLICATE`), because no value can be trusted.
- Also check against the keys of previously accepted readings stored in LocalStorage (cap the stored key set at 10,000, dropping the oldest, and say so in the UI).
- Every duplicate/conflict is written to the validation report **and** the audit history (one summary audit event per file, with counts).

**Stage 6 — Unicode and malicious-input handling**
- Normalise text with NFKC for comparisons; keep the original (escaped, truncated to 80 characters) only for display.
- `REJECT` identifiers or enum fields containing: C0/C1 control characters (`\u0000–\u001F`, `\u007F–\u009F`), zero-width characters (`\u200B–\u200F`, `\u2060`, `\uFEFF`), or bidirectional overrides (`\u202A–\u202E`, `\u2066–\u2069`) (`CONTROL_OR_HIDDEN_CHARACTERS`).
- Free text (`note`, and any string in a rejected position) is scanned for suspicious patterns: `<` or `>` tags, `javascript:`, `data:text/html`, `on\w+\s*=`, `<script`, SQL fragments such as `'; DROP`, template markers `{{`, `${`. A match → `QUARANTINED` (`SUSPICIOUS_TEXT`) and the text is displayed **only as inert escaped text**.
- CSV formula injection: values beginning with `=`, `+`, `-` (non-numeric), `@` in text fields are neutralised by prefixing `'` in any export or download the app produces (`FORMULA_LIKE_TEXT` → `WARNING`).
- Hard rules: never `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`, or dynamic `import()` of uploaded content; all uploaded text reaches the DOM through React text nodes (auto-escaped) or `textContent`. Never use uploaded strings as object keys, CSS, URLs or routes.

**Stage 7 — Classification**
Each record ends in exactly one class. Precedence when several findings apply: `REJECTED` > `QUARANTINED` > `DUPLICATE` > `WARNING` > `ACCEPTED`. All findings are kept in `reasons[]` even when the class is decided by the strongest one.

| Class | Meaning | Reaches the engines? |
|---|---|---|
| `ACCEPTED` | Fully valid | Yes |
| `WARNING` | Valid but needs attention (e.g. occupancy missing → UNKNOWN, stale timestamp, unknown extra field, energy export) | Yes, with the warning carried into data quality |
| `DUPLICATE` | Repeats an accepted reading | No |
| `REJECTED` | Structurally or physically invalid | No |
| `QUARANTINED` | Suspicious or unverifiable; kept for review | No |

### 8.4 Per-record result and file report

```js
const recordResult = {
  rowIndex: 3,                       // 1-based position in the file
  recordRef: 'A-102',                // escaped, truncated
  classification: 'REJECTED',
  reasons: [{ code: 'NEGATIVE_OCCUPANCY', field: 'occupancy', message: 'Occupancy cannot be negative (-4).' }],
  displayPreview: 'A-102 | -4 | 3.1 kW',   // inert text only
};
const fileReport = {
  fileName: 'upload.csv', fileSizeBytes: 1832, processedAt: '<ISO>',
  fileStatus: 'PROCESSED',           // or 'FILE_REJECTED'
  fileError: null,                   // human-readable reason when rejected
  totals: { total: 9, accepted: 3, warning: 1, duplicate: 1, rejected: 2, quarantined: 2 },
  records: [ /* recordResult[] */ ],
};
```

Rule: `accepted + warning + duplicate + rejected + quarantined = total`; a unit test asserts it.

### 8.5 Required validation interface (Screen 3)

File name and size; progress/stage indicator (a simple stepper that shows the seven stages and which one failed for file-level errors); totals tiles (processed, accepted, warning, duplicate, rejected, quarantined); detailed table (row, record, class, field, reason code, plain-language reason) with filter by class; an **error explanation panel** that explains in plain language what each class means and what the system did; a visible banner of the "Client-side validation only" notice (§8.8); link to the Overview data-quality status.

### 8.6 Sample bad-data cases (must all be reproducible)

| Record | Problem | Expected response |
|---|---|---|
| A-101 | All fields valid | `ACCEPTED` |
| A-102 | Negative occupancy | `REJECTED` |
| A-103 | Missing occupancy | `WARNING` — occupancy set to UNKNOWN (if otherwise valid) |
| A-104 | Duplicate timestamp and source | First kept, repeats `DUPLICATE` |
| A-105 | Invalid timestamp | `QUARANTINED` |
| A-106 | Malformed JSON (file-level) | **File rejected**, app keeps running |
| A-107 | Unexpected string in power field | `REJECTED` |
| A-108 | Unrealistic power reading | `QUARANTINED` |
| A-109 | Malicious HTML/script string | Never executed; `QUARANTINED`, shown as inert text |

Provide a downloadable and one-click-loadable **"Combined bad-data demo"** file that contains A-101 to A-105 and A-107 to A-109 (A-106 is demonstrated by the malformed-file generator) so Scenario 4 (§18) runs in one step.

### 8.7 Attack simulation controls

Buttons that generate controlled malformed test datasets from the valid sample (each shows the generated file content in a read-only, escaped preview box, then offers **Validate this file** and **Download**):

1. Inject missing fields.
2. Inject negative values.
3. Inject duplicate readings.
4. Inject invalid timestamps.
5. Inject unexpected data types.
6. Inject malicious-looking text.
7. Generate malformed JSON / malformed CSV (one toggle for the format).

Each button produces a deterministic file so the expected report is known and testable. Validating a generated file runs the **same** pipeline as a user upload (the generated text is passed through the same `validateFile` function as a `File`), never a shortcut.

### 8.8 Honest boundary (must be visible in the UI and README)

> This is a simulated data-ingestion security demonstration. It is **client-side validation only**. A real deployment would need server-side validation, authenticated and authorised ingestion endpoints, rate limiting, malware scanning, schema versioning, tamper-evident storage, and security review. Browser validation alone is not production-grade cybersecurity.

### 8.9 How validation results change decisions

Validation output feeds a per-room `dataQuality`:
- Evaluated from the **last record for that room, in file order, in the most recent file that contained the room**; a later valid upload therefore restores the room.
- `UNRELIABLE` if that record was `QUARANTINED` or `REJECTED`, or its meter is `OFFLINE`, or its latest accepted reading is stale beyond the freshness window.
- `WARNING` if its latest record was `WARNING`.
- `HEALTHY` otherwise.

`UNRELIABLE` data **holds** dependent recommendations (§10.4). Only `ACCEPTED` and `WARNING` records are ever applied to the room registry. Rejected, duplicate and quarantined records are retained solely in the report/audit.

---

## 9. MODULE 3 — Adaptive Resource Planner

**This is the most important differentiating feature of ZHATKA** and Screen 2 must be the strongest, clearest page of the app.

**Purpose:** calculate how limited electrical capacity should be allocated between campus loads during a demand emergency, using a **transparent, deterministic, priority-based algorithm**. It is not a trained AI model and must never be described as one. It does not switch anything.

Location: `src/logic/planner/`. Pure functions, no React.

### 9.1 Scenario inputs (three configurable inputs)

| Input | Control | Default | Valid range |
|---|---|---|---|
| Baseline campus demand | number input | 100 kW | 1–100,000 |
| Demand multiplier | slider + number | 3 | 0.5–5, step 0.1 |
| Available capacity percentage | slider + number | 50 % | 5–100, step 1 |

Derived values (shown automatically, recomputed on every change):

```
originalCapacityKw = baselineDemandKw                       // default 100 kW
availableKw        = originalCapacityKw × capacityPercent / 100     // 50 kW
currentDemandKw    = baselineDemandKw × multiplier                  // 300 kW
deficitKw          = max(0, currentDemandKw − availableKw)          // 250 kW
supplyRatio        = availableKw / currentDemandKw                  // 0.1667 → "16.67%"
```

Inputs are validated (finite, in range). Invalid input is clamped or rejected with a visible message; the planner never computes with `NaN`.

**Severity banner** (thresholds are constants in `defaults.js`): `supplyRatio ≥ 1` → NORMAL (teal); `0.75–1` → CAUTION (amber); `0.40–0.75` → SHORTAGE (amber/red); `< 0.40` → **SEVERE RESOURCE EMERGENCY** (red). The default scenario must show the severe banner.

### 9.2 Priority categories

Every load is configurable into exactly one category. **Room occupancy alone never determines the category.**

| Category | Name | Examples | Rule |
|---|---|---|---|
| `P0` | CRITICAL | Emergency lighting, fire safety, critical security, essential network infrastructure | Protected from ordinary shutdown/reduction recommendations. Allocated **in full** before anything else. |
| `P1` | ESSENTIAL | Essential laboratories, medical facilities, designated essential servers, other critical operations | Preserve the configured **minimum operating power**; topped up with priority after mandatory minimums are met. |
| `P2` | OPERATIONAL | Occupied classrooms, libraries, active laboratories, administrative operations | Can be carefully optimised down to the configured minimum. |
| `P3` | FLEXIBLE | Empty-room HVAC, decorative lighting, unused projectors, flexible non-essential equipment | First candidates for reduction, rescheduling or deferral. |

### 9.3 Load record fields (all editable in the Load Priority table)

`loadId`, `buildingId`, `roomId`, `loadName`, `priority` (P0–P3), `requestedKw` (reference value), `minimumKw` (minimum permitted operating power), `protected` (boolean), `deferrable` (boolean), `reductionConstraints` (text, e.g. "do not cut below 40% during exams"), `operationalNotes` (text), and `sortOrder` (integer, tie-break inside a category).

Validation on edit: `requestedKw ≥ 0` finite; `0 ≤ minimumKw ≤ requestedKw`; P0 loads are forced `protected = true`, `deferrable = false`; a load that is `protected` cannot be `deferrable`. Violations show an inline message and are not saved. Edits persist to LocalStorage and are written to the audit history as `CONFIG_CHANGED` with before/after.

### 9.4 Default (illustrative, simulated) load dataset

The reference table is defined at the reference scenario (100 kW × 3 = 300 kW). **Minimum values are team assumptions for the demo, not real campus requirements; they must be separately editable.**

| loadId | Load | Building / room | Priority | Requested kW | Min kW | Protected | Deferrable |
|---|---|---|---|---:|---:|---|---|
| L-01 | Emergency systems | Campus-wide | P0 | 8 | 8 | yes | no |
| L-02 | Network infrastructure | B / B-001 | P0 | 4 | 4 | yes | no |
| L-03 | Critical laboratory | B / B-110 | P1 | 15 | 10 | no | no |
| L-04 | Essential facilities | Campus-wide | P1 | 10 | 6 | no | no |
| L-05 | Occupied classrooms | A / multiple | P2 | 25 | 8 | no | no |
| L-06 | Library HVAC | D / D-002 | P2 | 25 | 6 | no | no |
| L-07 | Empty-room HVAC | Campus-wide | P3 | 80 | 0 | no | yes |
| L-08 | Nonessential lighting | Campus-wide | P3 | 50 | 0 | no | yes |
| L-09 | Flexible equipment | Campus-wide | P3 | 83 | 0 | no | yes |
| | **TOTAL** | | | **300** | **42** | | |

Mandatory total at defaults: P0 12 + P1 minimums 16 + P2 minimums 14 = **42 kW**, which fits in 50 kW.

### 9.5 Scaling the reference loads to the chosen scenario

So that the table always agrees with `currentDemandKw`:

```
fixedKw   = Σ requestedKw of loads where priority = P0 or protected      // do not scale with a surge
refOtherKw = Σ requestedKw of all other loads
scale     = refOtherKw > 0 ? max(0, (currentDemandKw − fixedKw) / refOtherKw) : 0
scaledRequestedKw(load) = fixed loads → requestedKw ; others → round2(requestedKw × scale)
effectiveMinKw(load)    = min(minimumKw, scaledRequestedKw)       // minimums are absolute safety floors; they do not scale
```

At the default scenario `scale = 1` exactly, so the table totals 300 kW. If `currentDemandKw < fixedKw`, show the warning "Scenario demand is below the protected load total" and use `scale = 0`. Totals may differ from `currentDemandKw` by at most 0.01 kW through rounding; show the table total, which is the value the allocator uses.

### 9.6 Allocation algorithm (deterministic; implement exactly)

1. **Validate** all load data and scenario inputs. Invalid loads are listed and excluded from allocation with a warning banner (they are never silently treated as zero).
2. **Reserve P0 / protected loads in full:** `mandatory = scaledRequestedKw`.
3. **Reserve P1 minimums:** `mandatory = effectiveMinKw`.
4. **Reserve P2 minimums:** `mandatory = effectiveMinKw`.
5. **P3 loads:** deferrable → `mandatory = 0`; non-deferrable → `mandatory = effectiveMinKw`.
6. **Feasibility check:** `mandatoryTotal = Σ mandatory`. If `mandatoryTotal > availableKw` (use a 1e-9 tolerance) → go to §9.8 (**infeasible**). Never reduce a protected load or a minimum to make it fit.
7. If feasible: `allocated = mandatory` for every load; `remaining = availableKw − mandatoryTotal`.
8. **Distribute remaining capacity by priority:** walk the loads ordered by `(priority P0→P3, sortOrder, loadId)`; for each, `topUp = min(scaledRequestedKw − allocated, remaining)`; add it; subtract from `remaining`. P0 is already full, so top-ups flow to P1, then P2, then P3.
9. **Flexible loads are reduced or deferred first** by construction (they receive only leftovers).
10. **Per-load accounting (keep these five numbers distinct, never merge them):**
    - `requestedKw` (scaled), `minimumKw` (effective minimum),
    - `allocatedKw`,
    - `reducedKw = requestedKw − allocatedKw` when `allocatedKw > 0`,
    - `deferredKw = requestedKw` when `allocatedKw = 0` and the load is deferrable,
    - `unmetKw = reducedKw + deferredKw` (requested power not supplied).
    Status per load: `FULL`, `REDUCED`, `AT_MINIMUM`, `DEFERRED`, or `UNSERVED_WARNING` (non-deferrable load allocated 0 because its minimum is 0; always flagged).
11. **Totals:** requested / allocated / unmet by category and overall; `utilisation = allocatedTotal / availableKw`; unmet total should equal `deficitKw` when capacity is binding.
12. **Plan explanation:** one structured explanation per affected load (§9.9).
13. **Require simulated administrator approval** before the plan is marked applied (§9.10).

Reference implementation shape:

```js
export function allocate({ loads, availableKw }) {
  const mandatory = loads.map((l) => mandatoryKw(l));          // step 2–5
  const mandatoryTotal = sum(mandatory);
  if (mandatoryTotal > availableKw + 1e-9) {
    return { feasible: false, mandatoryTotal, availableKw, shortfallKw: mandatoryTotal - availableKw, breakdown: breakdownByCategory(loads, mandatory) };
  }
  const allocated = [...mandatory];
  let remaining = availableKw - mandatoryTotal;
  const order = loads.map((l, i) => i).sort(byPriorityThenSortOrder(loads));
  for (const i of order) {
    const topUp = Math.min(loads[i].requestedKw - allocated[i], remaining);
    allocated[i] += topUp;
    remaining -= topUp;
  }
  return buildPlan(loads, allocated, availableKw);
}
```

**Expected default result** (must be asserted in tests): P0 = 12 kW (full); P1 = 24 kW (critical laboratory 15 — full; essential facilities 9 of 10); P2 = 14 kW (both at minimum: classrooms 8, library 6); P3 = 0 kW (all 213 kW deferred); allocated total 50 kW; unmet 250 kW; utilisation 100%; status **FEASIBLE**, severity SEVERE.

### 9.7 What the interface must clearly distinguish

Requested power · Minimum permitted power · Allocated power · Reduced or deferred power · Unmet requested power. Use five visibly different columns/segments (for example a stacked bar per load: allocated / reduced / deferred), never a single "cut" number.

### 9.8 Infeasible condition — "NO FEASIBLE SAFE ALLOCATION"

If `mandatoryTotal > availableKw`, show a prominent red state with the exact text **NO FEASIBLE SAFE ALLOCATION** and:
- why: "Mandatory requirements (X kW) exceed available capacity (Y kW) by Z kW";
- the **conflicting requirements**: a small table of P0 full requirements, P1 minimums, P2 minimums, non-deferrable P3 minimums, their subtotal and the capacity;
- the minimum capacity that *would* be feasible (`mandatoryTotal`, also as % of original capacity);
- a statement that protected-load rules were preserved and nothing was reduced to fit;
- **escalation**: "Escalate to authorised campus electrical operators" with a (simulated) escalation entry written to the audit history;
- the allocation columns show `NOT ALLOCATED`; no plan is generated; **Approve is disabled**; the status is never presented as valid.

State plainly in the UI: *a software algorithm cannot create electricity or resolve a physically impossible capacity situation.* Demo tip (include in the README): with defaults, setting capacity to **40 %** (40 kW) triggers this state because the mandatory total is 42 kW.

### 9.9 Recommendation explanation (per affected load)

For every load that is reduced, deferred or has unmet demand, the plan must state: which load; why it is reduced or deferred (e.g. "P3 flexible and deferrable; mandatory capacity left only 8 kW, assigned to higher priority P1 loads first"); its priority; requested kW; allocated kW; unmet kW; whether approval is required (always yes). Each entry becomes a recommendation record of type `APPLY_ALLOCATION_REDUCTION` (§10.7). Protected and P0 loads never appear as reduction targets.

### 9.10 Interactive controls (all must work)

Demand multiplier slider · available-capacity slider · baseline demand input · **Reset scenario** (restores 100 kW × 3, 50 %, and the default load table) · **Run allocation** (explicitly recomputes and writes an `ALLOCATION_RUN` audit event; the displayed result also recalculates live on any input change) · load-priority configuration (priority dropdown per load; requested/minimum/protected/deferrable editable) · optional minimum-power configuration · **Approve plan / Reject plan** with optional comment (applies to all pending reductions of the current plan; one audit event per load plus one plan-level event) · a `emergencyDurationHours` assumption input (default 1 h, labelled "assumption") used only to express shed power as kWh.

Approving applies the **simulated** state only: loads' `simulatedAllocatedKw` is set to the plan values, recommendations become `COMPLETED`, and a verification check marks them `VERIFIED` when the simulated total allocation is `≤ availableKw` (§11.4). If inputs change after approval, the plan is marked `SUPERSEDED` and must be re-run; approval is never carried silently to a different scenario.

### 9.11 Screen 2 layout

Top: scenario controls and the derived calculation shown as a small equation (`100 kW × 3 = 300 kW`, `100 kW × 50 % = 50 kW`, `300 − 50 = 250 kW deficit`, `50 ÷ 300 = 16.67 % supplied`). Then KPI tiles (baseline, current demand, available capacity, deficit, utilisation, supply ratio), the severity banner, requested vs allocated by category (grouped bar chart from real values), the load priority table with the five distinct power columns and a status chip per load, the feasibility panel, the unmet-demand panel, the per-load explanation list, and the approval panel.

---

## 10. MODULE 4 — Safety & Recommendation Centre

**Purpose:** bring together recommendations from the Campus Monitor (Module 1) and the Adaptive Resource Planner (Module 3), put every one of them through a safety gate, and let the administrator approve or reject them.

Location: `src/logic/safety/` and `src/logic/recommendations/`. The safety module has **no dependency on React or storage**; it receives plain objects and returns plain objects, so it can be unit-tested directly.

### 10.1 Critical Equipment Shield (protected-equipment registry)

A registry of equipment records, editable by the administrator (add / deactivate / toggle `protected`), persisted to LocalStorage, every change audited with before/after.

| Field | Notes |
|---|---|
| `equipmentId` | e.g. `EQ-001` |
| `name` | e.g. "Server rack R1" |
| `buildingId`, `roomId` | where it is |
| `category` | `SERVER`, `NETWORK`, `LAB_ESSENTIAL`, `SAFETY_SYSTEM`, `SECURITY`, `OTHER` |
| `protected` | boolean |
| `active` | boolean |
| `minimumOperatingKw` | number |
| `reasonForProtection` | text, shown wherever the protection is explained |

A room is `isProtected` if **any active** equipment record in it has `protected = true`. Protection is driven by this registry, **never by room names or room types**. Protected equipment is excluded from ordinary shutdown and reduction recommendations.

### 10.2 Safety rules (non-negotiable)

- Missing occupancy means UNKNOWN, not empty.
- Unreliable data (`dataQuality = UNRELIABLE`) holds dependent recommendations.
- Conflicting sensor and timetable information requires verification.
- An active maintenance window prevents conflicting recommendations (the maintenance flag is a simple on/off with an optional end time; the window ends when `now ≥ end`).
- Protected loads cannot be reduced through ordinary optimisation.
- Human approval must precede every simulated control action, and safety is re-checked at the moment the action is applied.

### 10.3 Action classes

```js
export const SHUTDOWN_CLASS = ['REVIEW_EMPTY_ROOM_LOAD', 'APPLY_ALLOCATION_REDUCTION'];
export const NON_INTRUSIVE_CLASS = ['INVESTIGATE_HIGH_USAGE', 'REQUEST_SENSOR_VERIFICATION'];
```

Shutdown-class actions change (simulated) power state and are fully gated. Non-intrusive actions only ask a human to look at something.

### 10.4 Safety decision engine

Input (plain object):

```js
const context = {
  targetType: 'ROOM',                 // or 'LOAD' for planner reductions
  targetId: 'A-102',
  now: '2026-11-10T11:00:00Z',
  occupancy: { state: 'VERIFIED_EMPTY', unknownReason: null, count: 0, ageMinutes: 4, scheduleConflict: 'NONE' },
  sensorStatus: 'HEALTHY',
  meterStatus: 'HEALTHY',
  dataQuality: 'HEALTHY',             // HEALTHY | WARNING | UNRELIABLE
  protectedEquipment: [],             // active protected registry items for the room
  loadProtection: null,               // for LOAD targets: { priority, protected }
  maintenance: { active: false },
};
const action = { type: 'REVIEW_EMPTY_ROOM_LOAD' };
```

Output:

```js
const result = {
  eligible: false,
  decision: 'HOLD',                    // ELIGIBLE_FOR_REVIEW | HOLD | PROTECT | SUPPRESS | KEEP_ON | PERMITTED_NON_INTRUSIVE
  reasonCode: 'OCCUPANCY_UNKNOWN',
  explanation: 'Occupancy cannot be verified because the sensor is offline.',
  requiredAction: 'SENSOR_VERIFICATION',
  targetId: 'B-203', actionType: 'REVIEW_EMPTY_ROOM_LOAD',
  checks: [],                          // ordered { id, label, status: 'PASS'|'FAIL'|'NOT_EVALUATED', detail } — drives the SafetyChecklist UI
  evidence: {}, evaluatedAt: '<ISO>',
};
```

Evaluation: conservative order, **first failing check wins**, missing input **fails closed**.

```js
export function evaluateSafety(context, action) {
  const checks = [];

  if (!context || !action || (context.targetType === 'ROOM' && !context.occupancy)) {
    return hold('INVALID_INPUT', context, action, checks);
  }
  if (NON_INTRUSIVE_CLASS.includes(action.type)) {
    const note = context.maintenance?.active ? 'Maintenance in progress. Investigation allowed.' : 'Action does not change electrical state.';
    return permitted('NON_INTRUSIVE_ACTION', note, context, action, checks);
  }
  if (!SHUTDOWN_CLASS.includes(action.type)) {
    return hold('INVALID_INPUT', context, action, checks);
  }

  // 1. Protection is absolute and is checked first.
  const isProtectedRoom = (context.protectedEquipment || []).length > 0;
  const isProtectedLoad = context.loadProtection && (context.loadProtection.protected || context.loadProtection.priority === 'P0');
  if (isProtectedRoom || isProtectedLoad) return protect('PROTECTED_ESSENTIAL_EQUIPMENT', context, action, checks);

  // 2. Maintenance.
  if (context.maintenance?.active) return suppress('MAINTENANCE_ACTIVE', context, action, checks);

  if (context.targetType === 'LOAD') {
    // Planner reductions have no occupancy; they stop here if the data feeding the scenario is unreliable.
    if (context.dataQuality === 'UNRELIABLE') return hold('DATA_UNRELIABLE', context, action, checks);
    return eligible('ELIGIBLE_FOR_ADMIN_REVIEW', context, action, checks);
  }

  // 3. Data quality.
  if (context.dataQuality === 'UNRELIABLE') return hold('DATA_UNRELIABLE', context, action, checks);

  // 4. Occupancy.
  const occ = context.occupancy;
  if (occ.state === 'UNKNOWN') return hold(unknownReasonToCode(occ.unknownReason), context, action, checks);
  if (occ.ageMinutes === null || occ.ageMinutes > FRESHNESS_MINUTES) return hold('OCCUPANCY_STALE', context, action, checks); // defence in depth
  if (occ.scheduleConflict === 'SESSION_BUT_EMPTY') return hold('CONFLICT_SESSION_BUT_EMPTY', context, action, checks);
  if (occ.state === 'OCCUPIED') return keepOn('OCCUPIED', context, action, checks);

  return eligible('ELIGIBLE_FOR_ADMIN_REVIEW', context, action, checks);
}
```

The `checks` array is filled in the order above; checks after the deciding one are `NOT_EVALUATED`. No function in this module may read tile states, rank scores or savings figures.

### 10.5 Reason codes

| Code | Decision | Meaning | Required action |
|---|---|---|---|
| `PROTECTED_ESSENTIAL_EQUIPMENT` | PROTECT | Protected equipment or a protected/P0 load is involved | `NONE_INVESTIGATE_ONLY` |
| `MAINTENANCE_ACTIVE` | SUPPRESS | Maintenance flag active | `NONE_WAIT_FOR_WINDOW_END` |
| `DATA_UNRELIABLE` | HOLD | Latest data for this target was quarantined/rejected, stale, or meter offline | `FIX_OR_REVALIDATE_DATA` |
| `SENSOR_OFFLINE` | HOLD | Occupancy sensor offline | `SENSOR_VERIFICATION` |
| `SENSOR_DEGRADED` | HOLD | Occupancy sensor degraded | `SENSOR_VERIFICATION` |
| `OCCUPANCY_STALE` | HOLD | Reading older than freshness limit | `SENSOR_VERIFICATION` |
| `OCCUPANCY_INVALID` | HOLD | Reading invalid | `SENSOR_VERIFICATION` |
| `OCCUPANCY_UNKNOWN` | HOLD | No usable occupancy data | `SENSOR_VERIFICATION` |
| `CONFLICT_SESSION_BUT_EMPTY` | HOLD | Schedule says in session, sensor says empty | `MANUAL_VERIFICATION` |
| `OCCUPIED` | KEEP_ON | People present | `NONE` |
| `ELIGIBLE_FOR_ADMIN_REVIEW` | ELIGIBLE_FOR_REVIEW | All checks passed | `HUMAN_APPROVAL` |
| `NON_INTRUSIVE_ACTION` | PERMITTED_NON_INTRUSIVE | Action does not change power | `NONE` |
| `INVALID_INPUT` | HOLD | Required context missing | `FIX_DATA` |

### 10.6 Safety invariants (non-negotiable; each has a test)

| ID | Invariant |
|---|---|
| INV-1 | UNKNOWN is never treated as zero occupancy. |
| INV-2 | Stale occupancy data is never treated as verified empty. |
| INV-3 | An occupied room never receives an occupancy-based shutdown-class recommendation. |
| INV-4 | A room with active protected equipment never yields an eligible shutdown-class result. |
| INV-5 | Active maintenance suppresses every shutdown-class recommendation. |
| INV-6 | Conflicting schedule and occupancy data triggers verification, not action. |
| INV-7 | Evaluation is always per room; building- or campus-level emptiness never overrides an occupied or unknown room. |
| INV-8 | A usage flag or anomaly never implies shutdown eligibility. |
| INV-9 | No simulated control action without a recorded administrator approval. |
| INV-10 | Safety is re-evaluated when the approved action is applied; a changed condition blocks it and writes a `CONTROL_BLOCKED` audit event. |
| INV-11 | Ranking and savings never change a safety decision. |
| INV-12 | Missing or invalid input fails closed. |
| INV-13 | P0 and protected loads are never reduced, deferred or placed in a reduction recommendation. |
| INV-14 | Mandatory minimums are never silently reduced; infeasible plans are never presented as valid. |
| INV-15 | Rejected, quarantined and duplicate records never reach any engine. |
| INV-16 | Uploaded text is never rendered as HTML or executed. |

### 10.7 Recommendation record and types

Fields (plus those listed in §15): `recommendationId`, `type`, `targetType`, `affectedLoadId`/`roomId`, `title`, `reason`, `evidence` (structured object, never only prose), `suggestedAction`, `currentPowerKw`, `baselinePowerKw`, `estimatedSaving` (`{ kwh, durationHours, status: 'ESTIMATED' }` or `null`), `priority` (`LOW|MEDIUM|HIGH|CRITICAL`), `dataQualityStatus`, `safetyStatus` (full structured safety result), `approvalStatus`, `dedupeKey`, `createdAt`.

| Type | Source | Class | Created when |
|---|---|---|---|
| `REVIEW_EMPTY_ROOM_LOAD` | Module 1 flag `EMPTY_BUT_CONSUMING` | Shutdown-class | Always generated for flagged rooms; if the safety engine does not return `ELIGIBLE_FOR_REVIEW`, the card is shown as **HELD / PROTECTED / SUPPRESSED** with the reason and approval disabled |
| `INVESTIGATE_HIGH_USAGE` | Module 1 flag `HIGH_USAGE` | Non-intrusive | Flagged rooms with a healthy meter |
| `REQUEST_SENSOR_VERIFICATION` | UNKNOWN occupancy, schedule conflict, or unreliable data | Non-intrusive | Whenever a room has UNKNOWN occupancy (offline, degraded, stale, invalid), a `SESSION_BUT_EMPTY` conflict, or `dataQuality = UNRELIABLE`, whether or not a shutdown-class recommendation exists for it |
| `APPLY_ALLOCATION_REDUCTION` | Module 3 plan, one per reduced/deferred load | Shutdown-class | When a feasible plan exists; never for P0/protected loads |

Generation is **idempotent** through `dedupeKey = type|targetId|sourceId`: if a pending record already exists for the key, update its evidence instead of creating another. Regeneration runs after: initial load, reset, file validation, equipment/maintenance/threshold change, planner scenario change, and after any applied action.

### 10.8 Recommendation queue and cards

Cards show: title; affected building/room or load; current power; baseline power; suggested action; estimated potential savings (tagged `ESTIMATED`); supporting evidence (expandable); data-quality status; priority; safety status (chip plus checklist); approval status.

**Status values:** `PENDING REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`, `VERIFIED`. A recommendation held by the safety engine stays `PENDING REVIEW` with `safetyStatus = HOLD/PROTECT/SUPPRESS` and a disabled Approve button that **shows the reason**. Held and protected items appear in a separate "Held and protected" tab, not mixed into the actionable queue.

Ranking inside the actionable queue is a transparent heuristic: sort by `priority` then estimated saving (descending) then `createdAt`. It must not be described as optimised and never overrides safety (INV-11). `priority`: `CRITICAL` for planner reductions during a severe emergency and for safety-system flags, `HIGH` for estimated saving ≥ 8 kWh, `MEDIUM` for ≥ 3 kWh, otherwise `LOW`.

### 10.9 State machine and approval workflow

```
PENDING REVIEW --approve--> APPROVED --apply (simulated)--> COMPLETED --verify--> VERIFIED
      |                        |--apply blocked (safety re-check fails)--> stays APPROVED, audit CONTROL_BLOCKED
      |--reject--> REJECTED
any non-terminal --(cause disappears or scenario changes)--> SUPERSEDED   (shown as a grey chip; not one of the five main statuses)
```

An administrator can: (1) open a recommendation; (2) review supporting information and the safety checklist; (3) **Approve** or **Reject**; (4) enter an optional comment (required for Reject); (5) the outcome is recorded in the audit history. Approve is allowed only when the **current** safety evaluation is `ELIGIBLE_FOR_REVIEW` or `PERMITTED_NON_INTRUSIVE`. After approval of a shutdown-class item, an **Apply (simulated)** button appears with a confirmation dialog; applying re-runs `evaluateSafety` first. Approval of a non-intrusive item moves it to `COMPLETED` when the admin marks "inspection done" (a single button; no task board).

Approval and application update **simulated application state only** (the room's `simulatedPowerState`, the loads' `simulatedAllocatedKw`) and never touch any real system. State this in every confirmation dialog.

---

## 11. MODULE 5 — Verification & Audit

**Purpose:** show that simulated energy-saving actions are recorded and that their outcomes can be evaluated honestly.

### 11.1 Audit record

Append-only in the UI (no edit or delete controls; the only way to clear it is the confirmed **Reset demo**, which writes a fresh `DEMO_RESET` event afterwards). Cap at 1,000 events; when exceeded, drop the oldest and show a visible notice with the dropped count.

| Field | Notes |
|---|---|
| `eventId` | e.g. `AUD-000123` (sequential counter stored in LocalStorage) — the "action identifier" |
| `recommendationId` | nullable (e.g. for file validation or config events) |
| `target` | affected room or load, nullable |
| `action` | one of the actions below |
| `requestedAction` | the suggested action text |
| `approvalStatus` | status at the time of the event |
| `actor` | `Administrator (simulated)` or `System (simulated)` |
| `timestamp` | ISO 8601 UTC; display in `Asia/Kolkata` |
| `reason` | admin comment or system reason |
| `beforeReading` | e.g. `{ powerKw: 3.1 }` or `{ allocatedKw: … }` |
| `afterReading` | same shape, after the simulated action |
| `simulatedResult` | short text/object, always flagged simulated |
| `outcome` | `SUCCESS`, `BLOCKED`, `FAILED` |

Required `action` values: `RECOMMENDATION_GENERATED`, `RECOMMENDATION_HELD`, `RECOMMENDATION_APPROVED`, `RECOMMENDATION_REJECTED`, `ACTION_COMPLETED`, `ACTION_VERIFIED`, `CONTROL_BLOCKED`, `ALLOCATION_RUN`, `ALLOCATION_ESCALATED`, `FILE_VALIDATED`, `FILE_REJECTED`, `ATTACK_SIMULATED`, `CONFIG_CHANGED`, `EQUIPMENT_CHANGED`, `MAINTENANCE_CHANGED`, `SCENARIO_LOADED`, `DEMO_RESET`. Config and equipment changes store `before` and `after` values.

The audit table is filterable (action, outcome, text search, date) and rows expand to show the full JSON. A "Download audit CSV" button is allowed; it must apply formula-injection neutralisation (§8.3 Stage 6).

### 11.2 Savings verification — three different numbers, never merged

| Figure | Definition | Where | Tag |
|---|---|---|---|
| **Potential savings** | Monitor view: `powerKw − baselinePowerKw` (kW) for flagged, safe-to-review rooms | Overview KPI, recommendation card | `POTENTIAL` |
| **Estimated savings** | `(currentKw − expectedPostActionKw) × durationHours` (kWh), computed when the recommendation is created. `expectedPostActionKw = baselinePowerKw` (the idle baseline); essential/protected loads are never counted. `durationHours` defaults to 4 (`estimatedDurationHours`, editable assumption). | Recommendation card, Audit detail | `ESTIMATED · SIMULATED` |
| **Measured savings (simulated)** | Computed after the simulated action from **simulated post-action readings** | Verification panel | `MEASURED (SIMULATED)` |

**Formula for measured savings:**

```
Savings (kWh) = Baseline consumption (kWh) − Post-action consumption (kWh)
```

Definitions used by the Verification panel (all over the same verification window `W` hours, default 4, same room, same day type):
- **Baseline consumption (kWh)** = the consumption the room would have had without the action = `beforeReading.powerKw × W` (the "no-action projection").
- **Previous consumption (kWh)** = consumption of the previous equal period from the room's simulated history = `previousPowerKw × W` (shown for context only; it is not used in the savings formula).
- **Post-action consumption (kWh)** = `afterReading.powerKw × W`, where the simulated post-action power is `baselinePowerKw + simulatedResidualKw` (default residual 0.3 kW, editable assumption — it is why measured ≠ estimated).

If the data are simulated, every result is labelled simulated. **Never claim actual campus electricity savings.** Where the periods or conditions are not equivalent, show a visible "not comparable" note instead of a number. All power is in **kW** and all energy in **kWh**; never mix the units.

For planner (`APPLY_ALLOCATION_REDUCTION`) recommendations the verification is a **capacity compliance check**, not a kWh claim: before = requested total kW, after = allocated total kW, result `VERIFIED` only if `allocatedTotal ≤ availableKw`. Shed power is shown in kW, and optionally in kWh using `emergencyDurationHours`, tagged as an assumption.

### 11.3 Verification panel

Shows, per completed action: before reading, after reading, baseline kWh, previous kWh, post-action kWh, potential, estimated and measured-simulated savings **in separate labelled cells**, the formula with its numbers substituted, the window `W`, and a "SIMULATED — not real campus data" tag. A summary row sums measured-simulated savings across verified actions (labelled simulated).

### 11.4 Verification flow

`COMPLETED → VERIFIED`: a **Verify** button (or automatic once the simulated post-action reading is recorded) recomputes the figures from stored before/after readings, checks comparability, sets `VERIFIED`, and writes an `ACTION_VERIFIED` audit event.

### 11.5 Persistence (LocalStorage)

Keys are namespaced and versioned (`zhatka.v1.*`): scenario configuration, load table, room registry and accepted readings, equipment registry, recommendations and decisions, audit events, latest validation report (summary only, not the whole file), accepted duplicate-key set, settings. Rules: wrap every read/write in try/catch (quota exceeded, storage disabled → show a banner and continue in memory); **never trust stored data** — run it through the same validators on load and fall back to defaults for anything invalid; include a `schemaVersion`; a **Reset demo** button (confirmation dialog, type `RESET`) restores the original sample dataset, default scenario, default loads and registry, clears recommendations/audit, then writes `DEMO_RESET`.

---

## 12. Screens and shared UI

Three primary screens inside one app shell (fixed left sidebar, top bar, content area, max width ~1440 px). **Top bar (always visible):** `SIMULATED DATA` badge, the notice "Simulated prototype — no real campus data, no real control", a **Demo scenarios** menu (§18), and the **Reset demo** button.

### 12.1 Screen 1 — Campus Overview (Module 1, with links into Modules 4 and 5)

Sidebar · header · KPI cards (total demand, available capacity, potentially avoidable consumption, data quality) · campus demand chart (power vs baseline per room, real values) · building/room table with search and filters · room details drawer (§7.7) · data-quality indicators · potential energy-waste alerts · link to Safety & Recommendations.

### 12.2 Screen 2 — Emergency Resource Planner (Module 3, with approval from Module 4)

See §9.11. Must be the strongest, clearest page.

### 12.3 Screen 3 — Data Integrity & Security (Module 2)

CSV/JSON upload (drag-and-drop **and** a file button) · **Download sample dataset** (CSV and JSON) · validation stepper/progress · totals tiles · detailed validation table with class filter · attack simulation buttons with escaped preview · error explanation panel · honest-boundary banner · link to data-quality status on Screen 1.

### 12.4 Sections — Safety & Recommendations, and Audit & Verification

Safety & Recommendations: the Critical Equipment Shield (registry table with add / toggle / deactivate), the recommendation queue (tabs: **Actionable**, **Held and protected**, **History**), and the detail pane with evidence, safety checklist, savings block, comment box and Approve / Reject / Apply buttons. Audit & Verification: the verification panel (§11.3) above the filterable audit table.

### 12.5 Shared components (build once, reuse)

`StatusBadge`, `KpiCard`, `DataTable`, `EvidencePanel`, `SafetyChecklist`, `RoomDrawer`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `LoadingState`, `SimulatedTag`, `PotentialTag`, `EstimatedTag`, `MeasuredSimulatedTag`, `SeverityBanner`.

Every data view has a **loading**, **empty** and **error** state (an upload with no valid records, an empty audit history, a corrupted LocalStorage entry all render a clear message, never a blank area or a crash). Wrap each screen in an error boundary that offers "Reset demo". Confirmation dialogs (with the text "Simulated action — no real electrical system is affected") for approve, reject, apply, reset.

---

## 13. Visual design system

The product must feel like a **premium energy-operations control room**, not a student project and not a gaming site.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B1426` | Page background (premium dark navy) |
| `--surface` | `#12203A` | Cards (slightly lighter slate/navy) |
| `--surface-2` | `#182A4A` | Raised/hover surfaces, table header |
| `--border` | `#243557` | 1 px borders |
| `--text` | `#F5F0E6` | Primary text (warm ivory) |
| `--text-dim` | `#AEB8CC` | Secondary text (contrast ≥ 4.5:1 on `--surface`) |
| `--teal` | `#2DD4BF` | Normal / success |
| `--amber` | `#F5A524` | Warning |
| `--red` | `#EF4444` | Critical / emergency |
| `--gold` | `#D4B483` | Branding (champagne gold) and key highlights |
| `--sky` | `#38BDF8` | OCCUPIED state |
| `--violet` | `#A78BFA` | PROTECTED state |

- **Style:** modern industrial control room; clean hierarchy; restrained colour (gold only for brand and key highlights); consistent card radius (10 px) and spacing (8 px grid); small but readable labels (≥ 12 px); large clear numerals for KPIs; professional table layouts with right-aligned numeric columns; subtle hover and transition effects (≤ 150 ms); **no** gratuitous animation, fake "live" pulses or decorative charts.
- **Typography:** Inter (fallback system sans-serif) for UI; a monospace face (`JetBrains Mono` or system mono) for numbers, IDs and timestamps.
- **Logo:** a simple **ZHATKA** wordmark in champagne gold with a subtle inline-SVG lightning-bolt motif. No elaborate illustration.
- **State cues:** colour is never the only cue — always icon plus label. UNKNOWN uses a hatched grey with a dashed border and a "?" icon, recognisable in the table, drawer and recommendation card:

```css
.state-unknown {
  background: repeating-linear-gradient(45deg, #2A3650, #2A3650 6px, #354463 6px, #354463 8px);
  border: 1px dashed #7C8AA8;
}
```
- **Charts:** Recharts, flat colours, labelled axes with units (kW, kWh), real data only.
- **Responsive:** desktop first (judging demo), usable on tablet; no horizontal page overflow at normal desktop widths (wide tables scroll inside their own container). Do not sacrifice readability to fit more on one screen.
- **Locale:** display times in `Asia/Kolkata`; store UTC ISO strings.
- Define colours once as CSS variables; one `<StatusBadge state="…" />` component.

---

## 14. Technical architecture and stack

The team are beginners; the implementation must stay straightforward and self-contained.

| Layer | Choice |
|---|---|
| Frontend | **React + Vite, JavaScript (no TypeScript)** |
| Styling | Plain CSS with variables (CSS modules optional); no UI framework required |
| Charts | Recharts |
| CSV parsing | PapaParse (safe, well-known) |
| Routing | `react-router-dom` or simple tab state |
| Storage | **Browser LocalStorage** + sample JSON seed files |
| Logic | Plain JavaScript functions in `src/logic/` |
| Tests | Vitest (lightweight, Vite-native) if the builder environment allows; otherwise the manual checklist in §19 |

**Do not introduce:** Node/Express backend, SQLite or any database, microservices, machine-learning pipelines, external AI APIs, IoT hardware integration, real smart-meter connections, real electrical control endpoints. The first version must run with `npm install && npm run dev` and no other setup. Any extra library needs a one-line justification in `docs/DECISIONS.md` and must be lightweight and directly serve a required feature.

```
SIMULATED SEED DATA + USER UPLOADS
        ↓
MODULE 2  validation pipeline (src/logic/validation)
        ↓  only ACCEPTED / WARNING records
MODULE 1  monitor logic (resolver, flags, KPIs)     MODULE 3  planner (src/logic/planner)
        ↓                                                  ↓
MODULE 4  safety engine + recommendation generator (src/logic/safety, recommendations)
        ↓  administrator approval (simulated)
MODULE 5  simulated action → verification → audit (src/logic/verification, audit)
        ↓
REACT UI (src/pages, src/components) — reads state, never contains business or safety logic
```

State: one central store (React Context + `useReducer`, or Zustand if the builder prefers) persisted to LocalStorage; reducers call the pure logic modules.

**Regeneration pipeline.** `refreshDerivedState(state, now)` runs after: initial load, reset, valid file applied, threshold/equipment/maintenance change, planner scenario change, applied action. Steps: resolve occupancy per room → usage flags → data quality → safety evaluation → generate/update recommendations (idempotent) → mark `SUPERSEDED` where the cause is gone → write audit events for new/changed items.

**Clock rule.** Domain logic receives `now` as a parameter (never calls `new Date()` itself) so it is testable. The app passes the real current time.

Suggested folder structure:

```
/ MASTER.md  README.md
  docs/DECISIONS.md  docs/STATUS.md
  public/sample/sample_valid.csv  sample_valid.json  sample_bad_demo.csv  sample_bad_demo.json
  src/
    config/defaults.js            thresholds, limits, severity cut-offs (the only place for constants)
    data/seed.js                  seed rooms, loads, equipment (§17)
    logic/
      validation/                 validateFile.js, stages.js, attackGenerators.js
      monitor/                    resolveOccupancy.js, flags.js, kpis.js, derivePrimaryState.js, dataQuality.js
      planner/                    scenario.js, allocate.js, explain.js
      safety/                     evaluateSafety.js, reasonCodes.js
      recommendations/            generate.js, rank.js
      verification/               savings.js, verify.js
      audit/                      auditLog.js
    store/                        AppStateProvider, reducers, persistence.js
    components/                   shared components (§12.5)
    pages/                        CampusOverview, EmergencyPlanner, DataIntegrity, SafetyRecommendations, AuditVerification
    styles/                       tokens.css, global.css
  tests/                          unit and scenario tests
```

---

## 15. Data model

Use consistent, structured JavaScript objects. Validate objects before use (including data loaded from LocalStorage). Timestamps are ISO 8601; power in **kW**, energy in **kWh** — never confuse them.

**Room record**
`roomId`, `buildingId`, `roomName`, `roomType`, `roomCapacity`, `occupancy` (integer or `'UNKNOWN'`), `occupancyStatus` (derived `OCCUPIED|VERIFIED_EMPTY|UNKNOWN`), `powerKw`, `baselinePowerKw`, `previousPowerKw`, `maxPowerKw`, `meterType` (`UNIDIRECTIONAL|BIDIRECTIONAL`), `meterStatus`, `sensorStatus`, `equipmentList` (equipment IDs), `scheduledStatus` (`IN_SESSION|NO_SESSION|EVENT|UNKNOWN`), `maintenance` (`{ active, until }`), `simulatedPowerState` (`NORMAL|REDUCED`), `timestamp`.

**Load record**
`loadId`, `buildingId`, `roomId`, `loadName`, `requestedKw`, `minimumKw`, `priority`, `protected`, `deferrable`, `reductionConstraints`, `operationalNotes`, `sortOrder`, `simulatedAllocatedKw` (nullable).

**Sensor reading** (normalised form of an accepted upload record; one per metric)
`readingId`, `sourceId`, `roomId`, `timestamp`, `metricType` (`OCCUPANCY|POWER`), `value`, `unit` (`count|kW`), `sensorStatus`.

**Equipment record** — fields in §10.1.

**Recommendation record**
`recommendationId`, `type`, `targetType`, `affectedLoadId`, `roomId`, `title`, `reason`, `evidence`, `suggestedAction`, `currentPowerKw`, `baselinePowerKw`, `estimatedSaving`, `priority`, `dataQualityStatus`, `safetyStatus`, `approvalStatus`, `adminComment`, `dedupeKey`, `createdAt`, `updatedAt`.

**Audit record** — fields in §11.1.

**Validation report** — shape in §8.4.

IDs are readable text (`A-101`, `L-03`, `EQ-001`, `REC-000012`, `AUD-000123`) generated from counters stored in LocalStorage. Booleans are real booleans. Never store derived display state (primary tile state) — derive it.

---

## 16. Required functional behaviour (every control must work)

| Control | Expected behaviour |
|---|---|
| Demand multiplier slider / baseline input / capacity slider | Recomputes demand, capacity, deficit, severity, load scaling and the allocation immediately; invalid input shows a message, never `NaN` |
| Run allocation | Recomputes from current inputs, writes `ALLOCATION_RUN` audit event, regenerates planner recommendations |
| Reset scenario | Restores 100 kW × 3, 50 %, default load table |
| Load priority/minimum/protected/deferrable edits | Validated inline, persisted, audited, plan recalculated |
| Approve / Reject plan | Applies to the plan's pending reductions; simulated state updated; audit events written |
| File upload / drag-and-drop | Runs the real pipeline; shows report; updates data quality; accepted records update the registry |
| Malformed JSON/CSV upload | Shows a clear file-level error; the app keeps running |
| Download sample dataset | Downloads a fresh valid file (CSV or JSON) |
| Each attack button | Generates its specific test file, shows an escaped preview, can validate and download it |
| Room search and filters | Actually filter the table and chart |
| Select room | Opens the drawer with live data |
| Maintenance toggle (drawer) | Updates the room, regenerates recommendations, audits |
| Add / toggle protected equipment | Updates the registry, regenerates recommendations, audits with before/after |
| Approve / Reject recommendation | Updates status and simulated state, records the optional comment, writes audit |
| Apply (simulated) | Re-runs the safety check; applies or blocks; audits |
| Verify | Computes before/after savings; sets `VERIFIED`; audits |
| Audit filters / expand rows / download CSV | Work on real events; CSV neutralises formula injection |
| Demo scenarios menu | Loads each of the five scenarios (§18) from a clean state |
| Reset demo | Confirm (type `RESET`), restores the original state, writes `DEMO_RESET` |

Rules: no static placeholder buttons; no hardcoded KPI values unrelated to application state; charts display actual state values; everything simulated is labelled simulated.

---

## 17. Seed data (simulated)

All values below are **illustrative simulated data** and must be labelled as such. Timestamps are generated at load/reset time as `now − 2 minutes` so readings start fresh. Every seed record passes through the same validators as uploaded data.

### 17.1 Rooms

| Room | Building | Type | Capacity | Occupancy | Power kW | Baseline kW | Previous kW | Max kW | Sensor | Meter | Schedule |
|---|---|---|---:|---|---:|---:|---:|---:|---|---|---|
| A-101 | A | Classroom | 60 | 32 | 4.2 | 4.0 | 4.1 | 15 | HEALTHY | HEALTHY | IN_SESSION |
| A-102 | A | Classroom | 60 | 0 | 3.1 | 0.6 | 3.0 | 15 | HEALTHY | HEALTHY | NO_SESSION |
| B-203 | B | Computer lab | 40 | UNKNOWN | 2.8 | 2.5 | 2.6 | 12 | OFFLINE | HEALTHY | IN_SESSION |
| L-301 | L | Laboratory | 20 | 12 | 8.5 | 5.0 | 5.2 | 20 | HEALTHY | HEALTHY | IN_SESSION |
| C-105 | C | Classroom | 30 | 0 | 2.6 | 1.8 | 1.8 | 10 | HEALTHY | HEALTHY | IN_SESSION |
| D-002 | D | Library | 80 | 41 | 6.1 | 6.0 | 6.0 | 15 | HEALTHY | HEALTHY | IN_SESSION |
| B-001 | B | Server room | 4 | 0 | 4.0 | 4.0 | 4.0 | 10 | HEALTHY | HEALTHY | NO_SESSION |

The first four rows are the brief's demonstration dataset (A-101 Normal, A-102 Review, B-203 Sensor offline, L-301 High usage). C-105, D-002 and B-001 are additional illustrative rooms (schedule conflict, normal library, protected server room). No real SRMIST data is used.

### 17.2 Protected-equipment registry (seed)

`EQ-001` Server rack R1 — B-001, category SERVER, protected, active, minimum 3.5 kW, reason "Institution-designated essential server".

### 17.3 Expected derived values at seed (use as test fixtures)

- Total monitored demand: **31.3 kW**; available capacity 100 kW (simulated).
- Flags: A-102 `EMPTY_BUT_CONSUMING` (excess 2.5 kW); L-301 `HIGH_USAGE` (ratio 1.7, excess 3.5 kW); C-105 `EMPTY_BUT_CONSUMING` (excess 0.8 kW) with `scheduleConflict = SESSION_BUT_EMPTY`; B-203 occupancy UNKNOWN (`SENSOR_OFFLINE`); B-001 PROTECTED.
- Potentially avoidable consumption: **6.0 kW** (A-102 2.5 + L-301 3.5; C-105 and B-203 excluded pending verification; B-001 protected).
- Recommendations: A-102 `REVIEW_EMPTY_ROOM_LOAD` eligible (estimated 10.0 kWh, priority HIGH); L-301 `INVESTIGATE_HIGH_USAGE`; B-203 `REQUEST_SENSOR_VERIFICATION`; C-105 `REVIEW_EMPTY_ROOM_LOAD` **held** (`CONFLICT_SESSION_BUT_EMPTY`) plus a `REQUEST_SENSOR_VERIFICATION`.

### 17.4 Load dataset

As in §9.4. Default scenario 100 kW × 3, 50 %.

### 17.5 Sample files

`sample_valid.csv/json`: one valid reading per seed room (generated with fresh timestamps; also embedded as a JS generator so downloads never go stale). `sample_bad_demo.csv/json` ("Combined bad-data demo"): the nine readings below, where `readingId` is the case ID from §8.6 and `roomId` is a seeded room.

| readingId | roomId | Content | Expected |
|---|---|---|---|
| A-101 | A-101 | all fields valid | ACCEPTED |
| A-102 | A-102 | occupancy `-4` | REJECTED |
| A-103 | D-002 | occupancy empty | WARNING (UNKNOWN) |
| A-104 | L-301 | valid, source `SRC-1`, timestamp T | ACCEPTED |
| A-104 | L-301 | identical repeat (same source and timestamp T) | DUPLICATE |
| A-105 | C-105 | timestamp `2026-13-45T25:61:00Z` | QUARANTINED |
| A-107 | B-203 | `powerKw = "high"` | REJECTED |
| A-108 | A-101 | `powerKw = 250` (room max 15) | QUARANTINED |
| A-109 | D-002 | `note = <script>alert(1)</script>` | QUARANTINED, shown as inert text |

Expected totals: total 9 · accepted 2 · warning 1 · duplicate 1 · rejected 2 · quarantined 3. (A-106, malformed JSON, is produced by the malformed-file attack button and must show `FILE_REJECTED`.)

---

## 18. The five required demonstration scenarios

All five must be testable inside the finished app, each loadable from the **Demo scenarios** menu (which restores a clean seed first, then applies the setup) and also reproducible by hand.

**Scenario 1 — Normal campus.** Load the seed. Expect the table, KPIs and recommendations in §17.3: total demand 31.3 kW, potentially avoidable 6.0 kW, UNKNOWN shown for B-203, A-102 flagged as empty-but-consuming, L-301 flagged high usage.

**Scenario 2 — Emergency demand.** Baseline 100 kW, multiplier 3×, capacity 50 %. Confirm: new demand 300 kW; available capacity 50 kW; deficit 250 kW; supply ratio 16.67 %; severity SEVERE; allocation per §9.6 (P0 12, P1 24, P2 14, P3 0; unmet 250 kW; protected loads untouched; P3 loads deferred first). Then set capacity to 40 % and confirm **NO FEASIBLE SAFE ALLOCATION** (mandatory 42 kW > 40 kW), with the conflict table, escalation text and a disabled Approve.

**Scenario 3 — Critical equipment.** The menu entry adds protected equipment `EQ-002` "Server rack R2" to the apparently empty room A-102 (the same can be done by hand in the registry). Confirm that A-102's `REVIEW_EMPTY_ROOM_LOAD` recommendation changes from eligible to **PROTECTED** (`PROTECTED_ESSENTIAL_EQUIPMENT`), Approve is disabled with the reason shown, the potentially-avoidable KPI falls from 6.0 to 3.5 kW, and `EQUIPMENT_CHANGED` and `RECOMMENDATION_HELD` events appear in the audit history.

**Scenario 4 — Malicious / invalid data.** Upload (or one-click load) the Combined bad-data demo (§17.5). Confirm the report: 9 total · 2 accepted · 1 warning · 1 duplicate · 2 rejected · 3 quarantined, each with a meaningful reason, the script string displayed as inert text, and no crash. Then run the malformed-JSON and malformed-CSV buttons and confirm a clear file-level rejection. Confirm that the rooms whose last record was rejected/quarantined show `dataQuality = UNRELIABLE`, and that dependent recommendations (e.g. A-102's review, whose record was rejected) become **HELD** with `DATA_UNRELIABLE`. Uploading the valid sample afterwards restores HEALTHY.

**Scenario 5 — Approval and verification.** From the seed, open A-102's recommendation (estimated 10.0 kWh). Add an optional comment and Approve; Apply (simulated) after the fresh safety check passes. The simulated reading for A-102 changes from 3.1 kW to 0.9 kW (baseline 0.6 + residual 0.3). Verification (window 4 h): baseline consumption 12.4 kWh, previous consumption 12.0 kWh, post-action consumption 3.6 kWh, **measured savings (simulated) 8.8 kWh**, shown beside estimated 10.0 kWh and potential 2.5 kW as three separate tagged numbers. Status moves PENDING REVIEW → APPROVED → COMPLETED → VERIFIED, with an audit event for each step containing before/after readings. The Overview total demand becomes 29.1 kW. Everything is labelled simulated.

---

## 19. Testing and validation

Nothing is reported as tested unless the test exists and passed. Untested items are labelled **UNTESTED** in `docs/STATUS.md`. If automated tests cannot run in the builder environment, provide the same checks as a manual checklist in `docs/STATUS.md` and mark them as manual.

**Unit tests (pure logic):**
- `resolveOccupancy`: healthy zero, healthy positive, stale, invalid (`null`, `-1`, `2.5`, `NaN`), `UNKNOWN`, offline, degraded, future timestamp, schedule conflicts both ways. `derivePrimaryState`: full priority table.
- Validation pipeline: every row of §8.6, each attack generator's expected report, boundary values (capacity, max power, 5-minute future skew), BOM and CRLF in CSV, empty file, header-only file, oversized file, too many rows, NUL bytes, prototype-pollution keys, bidi/zero-width characters, formula-like text, bidirectional vs unidirectional meters, duplicate vs conflicting duplicate. Invariant: `accepted + warning + duplicate + rejected + quarantined = total`.
- Planner: default scenario result exactly as in §9.6; capacity 40 % → infeasible; scaling at multiplier 1 and 5; P0 never reduced; minimums never reduced; protected non-P0 load treated as mandatory; five power figures distinct; `NaN`/out-of-range inputs rejected; determinism (same input → identical output).
- `evaluateSafety`: every reason code; fail-closed on missing input. **Exhaustive invariant test:** iterate every combination of occupancy state × unknown reason × schedule conflict × maintenance × protected equipment × data quality × action type and assert INV-1 to INV-8, INV-11 to INV-14 on every result (no random sampling).
- Savings: estimated and measured formulas with the §18 numbers; "not comparable" handling; kW/kWh never mixed.
- Persistence: corrupted JSON in LocalStorage falls back to defaults; invalid stored objects are rejected by validators.

**Scenario tests:** the five scenarios in §18 end-to-end against the reducers.

**Security-style checks:** a test that renders each hostile string from the attack generators and asserts the DOM contains it as text and no element or attribute was created from it.

---

## 20. Build order and Builder AI instructions

### 20.1 Before editing
- Read this file fully. If the repository already contains code, inspect it, note what works, and do not overwrite working code unnecessarily. Record the starting state in `docs/STATUS.md`.

### 20.2 Phases (each ends with `npm run build` succeeding, available tests passing, a completion report, and a working app)
1. **Foundation:** project scaffold, design tokens and app shell, seed data, data model validators, occupancy resolver, usage flags, KPIs, Screen 1 with table, filters, chart and drawer, LocalStorage persistence and Reset demo.
2. **Data integrity:** validation pipeline, sample/attack generators, Screen 3, data-quality feed into Screen 1.
3. **Planner:** scenario maths, allocation, infeasible state, explanations, Screen 2, planner approval.
4. **Safety and recommendations:** equipment registry, `evaluateSafety`, recommendation generator, queue, approval workflow, apply (simulated) with re-check.
5. **Verification and audit:** audit log, savings verification panel, Demo scenarios menu, final polish, README with limitations.

**Cut order if time runs out:** (1) chart polish, (2) maintenance toggle UI (keep the safety logic), (3) extra attack-generator variants beyond the seven buttons' basic output, (4) tablet layout refinements. **Never cut:** the planner and its infeasible detection, the validation pipeline, the safety engine, the approval workflow, the audit history, the labelling of simulated values.

### 20.3 Implementation discipline
- Work in small, testable steps; build and run after each. Do not generate the whole app in one pass without checking it runs.
- Every visible action must work or be absent. No placeholder buttons, no hardcoded KPIs.
- Business and safety logic live in `src/logic/`, never inside React components. The safety engine, occupancy resolver, validator and allocator each exist exactly once.
- No room-specific or load-specific hardcoding in safety or allocation decisions (never `if (roomId === 'B-001')`).
- All constants and thresholds live in `src/config/defaults.js`.
- Clear names; one statement per line.
- Label any mocked or placeholder functionality in the UI and in `docs/STATUS.md`.
- If something here is contradictory or impossible, choose the most conservative option, record it in `docs/DECISIONS.md`, and continue. Do not stop to ask unless the choice would break an invariant.

### 20.4 Safety and honesty rules for the Builder
- Never treat UNKNOWN as EMPTY or ZERO. Never treat stale data as fresh.
- Never create an eligible shutdown-class result for occupied, protected, maintenance-active, unknown, unreliable or conflicting cases.
- Never reduce a P0/protected load or a minimum operating requirement to make an allocation fit; report infeasibility.
- Never bypass human approval or skip the re-check at apply time.
- Never execute, evaluate or render uploaded content as code or HTML.
- Never claim machine learning, real-time integration, real SRMIST data, real control, production-grade security, or actual savings.
- Use the labels `SIMULATED`, `POTENTIAL`, `ESTIMATED`, `MEASURED (SIMULATED)` exactly as defined.
- Do not mark a feature complete until it works.

### 20.5 Completion report (end of every phase, in `docs/STATUS.md` and the final message)
What was implemented; files created; files modified; features working; tests run and passed (counts); known bugs; remaining tasks; blockers. Be factual; include failures.

---

## 21. Safety and engineering limitations (non-negotiable)

1. No actual physical electrical infrastructure control.
2. No automatic shutdown of critical or protected equipment.
3. No unsafe allocation when minimum operating requirements exceed capacity.
4. No recommendation based on unknown occupancy without verification.
5. No execution of malicious input.
6. No raw execution or raw HTML rendering of uploaded strings.
7. No fabricated real-world data or savings.
8. No claims of trained AI where rule-based logic is used.
9. No claims of production-grade security based on browser validation alone.
10. All simulated control decisions require administrator approval.

The system is a decision-support prototype, not an electrical protection or supervisory control system.

---

## 22. Out of scope (do not build)

Advanced machine-learning or statistical forecasting models; complex AI agents or chatbots; 3D digital twin and any campus map/twin view; live IoT integration, real sensor hardware, real smart-meter connections; physical breaker or relay control and any real electrical switching; solar and battery optimisation; study-hub booking and student accounts or authentication; room-consolidation advice, pre-class readiness windows and maintenance-task boards or worker logins; complex maintenance scheduling; backend services, databases, REST APIs; user roles; email/SMS notifications; multi-campus support; native mobile apps; unnecessary charts and decorative dashboards.

These can be future extensions. The architecture may allow them; do not build them.

---

## 23. Acceptance criteria and Definition of Done

The app is acceptable only when **all** of the following are true.

**Campus Monitoring** — sample rooms display correctly; occupancy and power visible; empty-room consumption identified; missing occupancy appears as UNKNOWN; protected rooms identified; KPIs match §17.3.

**Data Integrity** — CSV and JSON uploads work; missing fields handled safely; duplicate detection works (and conflicting duplicates are quarantined); invalid timestamps quarantined; negative occupancy rejected; unexpected data types do not crash the app; malformed input produces meaningful file-level errors; unicode and hostile strings stay inert; size/row limits enforced; attack simulations work; report totals add up; only accepted/warning records reach the engines.

**Resource Planning** — the 3× / 50 % scenario works with the exact §9.6 result; demand, capacity, deficit and supply ratio are correct; priorities and minimums respected; infeasible allocation detected and clearly shown; protected and P0 loads never reduced; the five power figures are distinguishable; unmet demand visible; every reduction explained.

**Safety and Approval** — recommendations have explanations and evidence; protected equipment blocks shutdown recommendations; unreliable data and unknown occupancy hold recommendations with visible reasons; admin can approve and reject with comments; decisions are recorded; apply re-checks safety.

**Verification** — before/after readings visible; potential, estimated and measured-simulated savings shown separately and correctly (§18 numbers); audit history lists real events; everything simulated is labelled; Reset demo works.

**Persistence** — LocalStorage persists scenario, load priorities, valid records, decisions and audit events across reloads; corrupted storage does not crash the app.

**Interface** — no broken navigation; no non-functional buttons; no console errors in normal use; no horizontal overflow at normal desktop widths; all major controls usable; consistent visual design; loading, empty and error states present.

**Project-level done for the demo:** all five scenarios run from a clean reset with no manual edits; the full chain works: validate → monitor → recommend → approve → apply (simulated) → verify → audit; every simulated, potential, estimated or measured number is labelled.

---

## 24. Assumptions, decisions to confirm, and limitations

**Assumptions made when converting the revised plan (edit here if the team decides otherwise)**
- **A1 Minimum operating values** in §9.4 (10, 6, 8, 6 kW) are demo assumptions chosen so that the default scenario is feasible and 40 % capacity is not.
- **A2 Load scaling:** reference loads are defined at 100 kW × 3; protected/P0 loads stay fixed and the rest scale so that the table total equals baseline × multiplier (§9.5).
- **A3 Original capacity** equals baseline demand (100 kW at default).
- **A4 Savings definitions:** baseline consumption in the savings formula is the no-action projection of the pre-action reading; "previous consumption" is context only (§11.2). Window W = 4 h; residual = 0.3 kW; both editable.
- **A5 Timetable/event calendar** is reduced to a per-room `scheduledStatus`; there is no forecasting model (§1.1).
- **A6 Maintenance** is a simple per-room flag with optional end time, kept only because the revised plan says active maintenance prevents conflicting recommendations.
- **A7 Upload schema** (§8.2) is a room-reading record; the plan's `SensorReading` model is the normalised internal form.
- **A8 Freshness** 60 minutes; sample downloads are timestamped at download time.
- **A9 Tariff/cost:** no currency figures are shown in this version; savings are in kWh and kW only.
- **A10 Thresholds** (`highRatio` 1.5, `highMinKw` 0.3, `emptyExcessMinKw` 0.5, severity cut-offs) are untuned defaults for the simulated dataset.

**Limitations (must appear in the README and in an "About" panel in the app)**
- All data, sensors, schedules and control are simulated; no connection to SRMIST systems.
- There is no authentication or user-level security of any kind.
- Detection and recommendations are rule-based, not machine learning.
- Validation is client-side only and is a demonstration, not production-grade cybersecurity.
- Savings are estimates or simulated measurements from stated formulas; real verified savings require real post-intervention metering.
- The allocation algorithm is transparent logic for a prototype; it cannot create electricity, and real deployment would need redundant sensing, hardware interlocks, formal review of essential-load registries, cybersecurity review, and integration testing with real building systems.
- Browser LocalStorage is per-browser and not tamper-proof; the audit history here is a demonstration, not a tamper-evident record.

---

*End of MASTER.md.*
