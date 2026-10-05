# CodeBuddy build log (FR-12)

> **Submission requirement.** The organiser handbook requires **at least 3 screenshots, or a
> recording, of the CodeBuddy / WorkBuddy build chats**, kept in the repository.
>
> This file is the index for that evidence. The captures live in [`docs/evidence/`](./evidence/)
> and are referenced by name below. **Do not fabricate them** — they were exported from the real
> CodeBuddy Code session that built Verdant.

## How to capture

1. Keep this session's CodeBuddy transcript open.
2. Capture the moments that show *engineering judgement*, not just code appearing. The most
   compelling frames are the ones where the tool disagreed with the first approach, where a test
   caught a real bug, or where a blocker was reported honestly rather than worked around.
3. Save screenshots under `docs/evidence/` and reference them here — see
   [`docs/evidence/README.md`](./evidence/README.md) for the file-name conventions.

## Suggested captures — all actually shown in this build

| # | Moment | Why it is worth showing | File |
|---|---|---|---|
| 1 | Tool reads the PRD PDF, hits "binary file" wall, switches to `pdftotext` via Python, then pivots to `ls` / `find` to confirm the workspace before any code is written | The build started from the PRD and verified the toolchain before scaffolding — not from a template | `evidence/01-prd-loaded-tool-explores-workspace.jpeg` |
| 2 | Environment check before any plan: Node 24.14, npm 11.14, Python 3.13 (with the MS-Store `python3` trap), pip 26, Docker CLI present but **daemon not running** | Honest environment reporting drove the build sequence (Docker Desktop must start before Phase 1) | `evidence/04-environment-facts-table.jpeg` |
| 3 | **Risks section: do NOT add `uvloop`, asyncpg cp313 wheel fallback, `python3` alias is broken, `shadcn@latest` forces Tailwind v4** | The build picked deps around real Windows traps rather than picking them blindly | `evidence/08-risks-and-gotchas-uvloop-asyncpg-shadcn.jpeg` |
| 4 | **Module boundaries table: which concerns may NOT touch an LLM** (gate, parse, context check, metrics, claim validation) and the one concern that may (`select_pill`) | The determinism contract was spelled out as a table *before* any code was written | `evidence/09-module-boundaries-table.jpeg` |
| 5 | The `SelectionResult` Pydantic contract: `selected_pill_id: str` must be in the candidate set, no free prose; fallback to deterministic scoring on violation | The LLM is constrained at the schema level, not just prompted | `evidence/10-llm-output-contract-state-typeddict.jpeg` |
| 6 | The full 8-node LangGraph topology with the **hero-case concrete path** (`parse_case → evaluate_gate(continue) → check_context(ok) → select_pill → compute_metrics → assemble_card → route_action → END`) — the building-wide setpoint drop is explicitly marked `never_do / conflict` | The product claim (`execute_with_approval`, setpoint rejected) was designed in advance | `evidence/11-langgraph-topology-hero-path.jpeg` |
| 7 | The full Postgres DDL with all the enum types the domain needs (role, claim_kind, action_tier, pill_status, pill_domain, case_status, audit_action) and the `transcript_excerpts.embedding vector(1536)` for pgvector | The data layer was designed up front, not retrofitted | `evidence/12-db-schema-ddl.jpeg` |
| 8 | **"Two things to flag": (1) FR-03 returns 403 not 400 because `assertCan` fires before `assertAuthorCannotApprove`; (2) the browser pass was skipped because `agent-browser` would pull ~500 MB of Chromium and disk was tight** | Honest gaps, not hidden | `evidence/19-two-things-flagged-403-and-no-browser.jpeg` |
| 9 | The built-and-verified summary: 74/74 tests, live hero card, gate escalation, transfer block, audit chain valid; plus the **deliberate deviations** the author flagged for review (added `revisePill`, added four controllers, fixed a slug/title bug the eval harness caught) | Build closed with self-critique, not a victory lap | `evidence/17-built-49-files-deviations-reported.jpeg` |

## Evidence log

| Date | Tool | What was done | Artefact |
|---|---|---|---|
| 2026-10-02 | CodeBuddy | PRD read, environment confirmed, scaffold plan written (`stellar-cascade-loveloce-jujIMPPkq.md`) | `evidence/01-…` `02-…` `03-…` `04-…` |
| 2026-10-02 | CodeBuddy | 8-phase ordered build plan + risks catalogue (uvloop, asyncpg, shadcn, Docker daemon off, port 5432 collision) | `evidence/08-…` `14-…` `15-…` `16-…` |
| 2026-10-02 | CodeBuddy | Module-boundaries table + `SelectionResult` Pydantic contract + LangGraph topology with hero path + Postgres DDL designed up front | `evidence/09-…` `10-…` `11-…` `12-…` |
| 2026-10-02 | CodeBuddy | 49 files / ~4,900 lines built, 74/74 tests pass; deviations and one eval-found slug bug flagged in the report | `evidence/17-built-49-files-deviations-reported.jpeg` |
| 2026-10-02 | CodeBuddy | Frontend wired and verified (`tsc`, `eslint`, `vite build` clean); two honest gaps logged (FR-03 403 ordering, no browser render) | `evidence/18-frontend-complete-and-verified.jpeg`, `evidence/19-two-things-flagged-403-and-no-browser.jpeg` |
| 2026-10-03 | CodeBuddy | Reconciled the schema after the FastAPI → Express pivot (enums, missing tables) and added the generated `data/seed.sql` with a drift-guard | `data/schema.sql`, `data/seed.sql`, `scripts/db-smoke.sh` |

## WorkBuddy

The PRD lists WorkBuddy as **optional**, suggested for running the capture interview. It was **not**
used. If it is added, log those captures here too and note what it contributed — the handbook scores
the proof, not the tool choice.

## Repo evidence that is already committed

Independent of screenshots, the repository itself evidences the build:

- `git log` — the scaffold commit (`93d1558`), then the FastAPI → Express pivot, then the schema reconciliation, then the AI-assisted claim-drafting feature.
- `backend/src/__tests__/` — 103 tests: gate recall, audit tamper detection, FR-02/FR-03 governance,
  pipeline exits, determinism, the HTTP surface, SQL escaping, schema↔seed drift guard, and
  claim-drafting verbatim-quote enforcement.
- `backend/src/modules/pills/eval.service.ts` + `synthetic/tickets.dataset.ts` — the retrieval eval,
  with deliberately colliding pills so it has to discriminate. (The slug/title bug the eval
  surfaced is documented in `evidence/17-…`.)
- `backend/src/modules/cases/gate.service.ts` + `tickets.dataset.ts::GATE_POSITIVE_FIXTURES` — the
  FR-08 gate and its recall fixture.
- `.github/workflows/ci.yml` — the gate that runs on every push.
- `docs/DECISIONS.md` — the reasoning behind twelve architectural choices.
- `scripts/verify.sh` — the single quality gate; same checks CI runs.