# ⚡ ZHATKA — Adaptive Campus Energy Response Planner

**Smarter Decisions. Safer Operations. Measurable Efficiency.**

ZHATKA is a safety-first campus energy intelligence prototype developed for **CodeNex — PS6: The Sleeping Campus** by **Team Sudoers, SRMIST**.

It helps campus operators understand room-level energy use, validate incoming readings, plan how limited electrical capacity could be allocated during a demand emergency, and review explainable recommendations without compromising protected equipment.

> **Prototype notice:** ZHATKA uses simulated campus, occupancy, energy, demand, capacity and approval data. It does not connect to SRMIST systems, real meters or physical electrical controls. All actions and outcomes in the prototype are simulated.

---

## The problem

Campus buildings can consume electricity even when classrooms, laboratories and common areas are underused. Timetables do not always reflect actual occupancy, room-level readings can be unreliable, and a room that appears empty may still contain essential equipment.

A useful campus energy tool must do more than display consumption. It should help operators understand the context behind a reading, identify possible inefficiencies, protect essential services and explain what should happen next.

## Our approach

ZHATKA is designed around three principles:

1. **Data-aware decisions** — validate readings before they influence calculations or recommendations.
2. **Constraint-aware resource planning** — allocate limited electrical capacity using transparent priorities and minimum operating requirements.
3. **Safety-first recommendations** — protect essential loads, show why an action is suggested and require human review before recording a simulated action.

## The two hackathon constraints

### Constraint 1 — Demand shock and reduced resources

The demand suddenly rises to **3× the original level**, while available resource capacity falls to **50%**.

The default simulated scenario is:

| Measure | Value |
|---|---:|
| Baseline demand | 100 kW |
| Demand multiplier | 3× |
| New requested demand | 300 kW |
| Baseline capacity | 100 kW |
| Available capacity | 50% (50 kW) |
| Unmet demand | 250 kW |

ZHATKA's Adaptive Resource Planner uses configurable load priorities and minimum operating requirements to produce a transparent allocation proposal. It distinguishes requested, minimum, allocated, curtailed/deferred and unmet power.

If mandatory minimum requirements exceed the available capacity, the planner reports **NO FEASIBLE SAFE ALLOCATION** and calls for escalation to authorised campus electrical operators. It does not silently reduce protected requirements or pretend that software can solve a physically impossible shortage.

### Constraint 2 — Malformed or malicious input

The Data Integrity Lab tests how the application handles unexpected or unsafe input, including:

- Missing fields and unexpected data types.
- Duplicate and conflicting records.
- Invalid or future timestamps.
- Negative, non-finite or implausible readings.
- Unexpected Unicode or control characters.
- Malformed JSON and CSV.
- Malicious-looking text, such as script or HTML fragments.

The validator parses and checks data before it can be applied to the shared simulated dataset. Invalid or conflicting records are rejected or quarantined; they must not crash the application, execute as code or silently influence energy decisions.

---

## Core modules

### 1. Campus Monitor

Provides a room-level view of simulated campus energy use and occupancy context.

- Campus demand, baseline demand and available capacity.
- Room occupancy, room capacity and current power consumption.
- Baseline power where sample data is available.
- Sensor and meter health.
- Basic timetable context.
- Possible empty-room waste and unusual-consumption warnings.
- Room details and explanations for flagged readings.

**Important:** `UNKNOWN` occupancy is never treated as `EMPTY`. A verified-empty room is not automatically safe to switch off.

### 2. Data Integrity & Security Lab

Accepts normalized CSV and JSON measurement files and runs them through a validation pipeline.

- File type, size and row-count checks.
- Safe JSON/CSV parsing.
- Required-field and data-type validation.
- Numeric range and timestamp validation.
- Unicode and control-character handling.
- Exact duplicate detection and conflicting-duplicate quarantine.
- Record classifications: `ACCEPTED`, `WARNING`, `DUPLICATE`, `REJECTED` and `QUARANTINED`.
- Test inputs for missing fields, negative occupancy, unrealistic power, duplicates, bad timestamps, unexpected types and malicious-looking strings.

Only accepted, normalized records may update the shared demo dataset. Missing occupancy remains unknown rather than being filled with zero.

### 3. Adaptive Resource Planner

The main differentiating feature: a deterministic, priority-based planner for constrained electrical capacity.

Each load has a requested power, minimum permitted power, priority, protection status and allocation order.

| Priority | Category | Planning behaviour |
|---|---|---|
| **P0** | Critical / protected | Fully protected; requested power is reserved and cannot be curtailed by the ordinary planner. |
| **P1** | Essential | Must receive at least its configured minimum; additional capacity is allocated after mandatory minimums are reserved. |
| **P2** | Operational | Must receive its configured minimum; additional capacity is allocated after P1. |
| **P3** | Flexible | First candidates for reduction, rescheduling or deferral, subject to configured minimums. |

The allocation process:

1. Validate available capacity and every load record.
2. Sum all configured minimum operating requirements.
3. Check feasibility before allocating additional power.
4. If feasible, reserve minimums and distribute remaining capacity in priority order: P0, P1, P2, P3, using a stable allocation order for ties.
5. Calculate allocated, curtailed/deferred and unmet power for each load.
6. Explain the result and present it for simulated administrator approval.

This is a transparent deterministic algorithm, **not a trained AI model or live grid controller**.

### 4. Safety & Recommendation Centre

Combines monitoring findings and planner results into explainable recommendations.

- Protected-equipment registry.
- Safety checks for data quality, occupancy uncertainty, maintenance flags, minimum requirements and allocation feasibility.
- Recommendation reasons and supporting evidence.
- `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `HELD`, `BLOCKED` and `COMPLETED` states.
- Simulated approval/rejection by the campus administrator.
- A changed scenario invalidates a previous allocation approval and requires a new review.

Safety is a gate, never a score: potential savings cannot override protected-load rules or minimum operating requirements.

### 5. Verification & Audit

Records what the administrator decided and what happened in the simulation.

- Timestamped action history.
- Recommendation and approval outcomes.
- Before/after simulated readings.
- Estimated energy and cost impact, where calculable.
- Resettable demo state.

Estimated savings use:

```text
Estimated savings (kWh) =
  (Baseline load (kW) - Expected post-action load (kW)) × Duration (hours)

Estimated cost saving (INR) =
  Estimated savings (kWh) × Assumed tariff (INR/kWh)
```

All prototype savings and outcomes are labelled **ESTIMATED · SIMULATED**. They are not measured campus savings.

---

## Application workspaces

The MVP is intentionally limited to three primary workspaces:

1. **Campus Overview** — KPIs, room table, room details and alerts.
2. **Emergency Resource Planner** — demand/capacity controls, priority load table, allocation results and feasibility explanation.
3. **Data Integrity Lab** — CSV/JSON upload, validation summary, rejected/quarantined records and test-input controls.

Recommendation, safety and audit features appear as integrated panels or views. This keeps the prototype focused and manageable for a beginner-level hackathon team.

## Technology

The planned MVP stack is deliberately lightweight:

- **ChatGPT** — Problem Understanding and Prompt Engineering.
- **Claude** — Core App Functionality Definition
- **Google AI Studio** — Building the finalised draft into a website.
---

## Website Link
- https://zhatka.ai.studio
---

## Demo scenarios

Use the built-in sample data and scenario controls to demonstrate the following end-to-end behaviours:

| Scenario | What to demonstrate |
|---|---|
| Normal campus | Room occupancy, energy readings and possible avoidable consumption. |
| Demand shock | 100 kW baseline demand → 300 kW requested demand; capacity falls to 50 kW; planner calculates 250 kW unmet demand and proposes a priority-based allocation. |
| Infeasible safety case | Reduce available capacity below total mandatory minimums; show `NO FEASIBLE SAFE ALLOCATION` and escalation guidance. |
| Protected equipment | Confirm a P0 critical load is not curtailed by the ordinary planner. |
| Malformed input | Upload or inject missing fields, negative occupancy, duplicates, conflicting readings, invalid timestamps, unexpected types and malformed files. |
| Approval and verification | Review a feasible simulated plan, approve or reject it, record the simulated outcome and inspect the audit trail. |

All scenario values are illustrative and should be clearly labelled as simulated in the application.

---

## Project structure

The implementation may follow this lightweight structure (adapt to the actual repository as needed):

```text
src/
  app/              # Application shell and navigation
  components/       # Reusable cards, tables, badges and dialogs
  pages/            # CampusOverview, ResourcePlanner, DataIntegrityLab
  modules/
    campus/         # Room status and basic anomaly rules
    validation/     # File parsing, validation and deduplication
    planner/        # Load validation and resource allocation
    safety/         # Recommendation safety checks
    audit/          # Audit log and savings calculations
  data/             # Seed campus data and valid sample CSV/JSON
  state/            # Shared application state
  styles/           # Theme tokens and global styles
  utils/            # Formatting and time helpers
```

---

## Safety, security and limitations

ZHATKA is a **decision-support prototype**. It is not an electrical protection system or production control platform.

- No real SRMIST systems, campus meters or occupancy sensors are connected.
- The demand shock and all load readings are simulated.
- The planner proposes allocations; it does not switch breakers, HVAC units or equipment.
- Human approval is required before recording a simulated operational action.
- P0 loads are protected from ordinary curtailment; P1/P2 minimum operating requirements must be respected in a feasible plan.
- If mandatory minimums exceed capacity, the planner reports infeasibility and directs operators to authorised emergency procedures.
- Browser-side input validation demonstrates safe handling of test files; it is not production-grade cybersecurity. A deployed system would also require server-side validation, authentication, access control, secure logging and security review.
- The allocation logic is deterministic and rule-based, not machine learning.
- Savings are estimated from simulated inputs and are not claims of actual energy or cost savings.
- Real deployment would require qualified electrical engineering review, approved data sources, protection coordination, fail-safe interlocks and institutional authorisation.

---

## Team

**Sudoers**  
SRM Institute of Science and Technology (SRMIST)  
CodeNex Hackathon · The Other Side

---

## Acknowledgement

Built as a hackathon prototype exploring safer, more explainable and more resilient campus energy management.

**ZHATKA — Smarter Decisions. Safer Operations. Measurable Efficiency.**
