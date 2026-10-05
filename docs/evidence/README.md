# CodeBuddy build evidence

> **Hackathon requirement.** The organiser handbook requires **at least 3 screenshots, or a
> recording, of the CodeBuddy / WorkBuddy build chats**, kept in the repository. This folder holds
> those artefacts.

## Files

| File | What it shows |
|---|---|
| `cover.png` | 16:9 cover image (1920×1080) — Verdant wordmark, hero numbers, and the selected / rejected decision |
| `01-prd-loaded-tool-explores-workspace.jpeg` | Tool reads the PRD PDF, hits the binary-file wall, falls back to `pdftotext`, then runs `ls` / `find` to confirm the workspace is empty |
| `02-prd-summary.jpeg` | First session output: HARVEST PRD summary (core concept, hero case, stack, deliverables, timeline, key risks) |
| `03-environment-check-model-switch.jpeg` | Model switch to Deepseek-V4.1-Flash + workspace inspection |
| `04-environment-facts-table.jpeg` | The environment-fact table the tool wrote before scaffolding: Node v24.14.0, npm 11.14.1, Python 3.13.13 (the MS-Store `python3` trap), pip 26.1.2, Docker CLI 29.7.2 with daemon NOT running |
| `05-scaffold-plan-file-tree.jpeg` | The full file tree with the "no LLM" annotations on the deterministic services |
| `06-backend-services-and-tests-arch.jpeg` | Backend services + tests files, with explicit "no LLM" / "version/approve/rollback" / "agent boundary" annotations |
| `07-data-and-frontend-files.jpeg` | Data layer (schema, seed, generator) + frontend tree |
| `08-risks-and-gotchas-uvloop-asyncpg-shadcn.jpeg` | The risks catalogue: `asyncpg` on cp313/win_amd64 (pin or psycopg fallback), `uvloop` unsupported on Windows, `python3` alias broken, `shadcn@latest` forces Tailwind v4 + React 19 codemod |
| `09-module-boundaries-table.jpeg` | The determinism contract as a table: red-flag gate / signal parsing / context check / metrics / claim validation may NOT touch an LLM; only `select_pill` may |
| `10-llm-output-contract-state-typeddict.jpeg` | The `SelectionResult` Pydantic contract (`selected_pill_id` must be in candidate set) + the `AgentState` TypedDict |
| `11-langgraph-topology-hero-path.jpeg` | The full 8-node LangGraph topology with the hero-case concrete path and the building-wide setpoint drop marked `never_do / conflict` |
| `12-db-schema-ddl.jpeg` | Full Postgres DDL: extensions, enum types (`role_name`, `claim_kind`, `action_tier`, `pill_status`, `pill_domain`, `case_status`, `audit_action`), `app_users`, `user_roles`, `tenants`, `transcript_excerpts` with `vector(1536)` |
| `13-frontend-pages-endpoints-seed-data.jpeg` | Frontend pages ↔ endpoints table + seed-data checklist the hero case needs to render |
| `14-ordered-build-sequence-phase-0-5.jpeg` | Ordered build phases 0–5 with exact verification commands |
| `15-phase-6-8-risks-gotchas.jpeg` | Phases 6–8 + extended risks catalogue |
| `16-build-sequence-table-final-gate.jpeg` | The single build-sequence table + `bash scripts/verify.sh` as the final gate |
| `17-built-49-files-deviations-reported.jpeg` | The "Built" summary: 49 TS files, ~4,900 lines, 74/74 tests, live API hero card, transfer block, audit chain valid — plus the deliberate deviations the author flagged (`revisePill`, four controllers, slug/title eval bug fixed) |
| `18-frontend-complete-and-verified.jpeg` | Frontend complete: five pages + router, `tsc` clean, `eslint` clean, `vite build` clean, `verify.sh` ✔ |
| `19-two-things-flagged-403-and-no-browser.jpeg` | "Two things to flag": (1) FR-03 returns 403 not 400 because `assertCan("pill:review")` fires before `assertAuthorCannotApprove`; (2) the browser pass was skipped because `agent-browser` would pull ~500 MB of Chromium and the disk was tight |
| `20-readings-volume-schema-reconciliation.jpeg` | Schema reconciliation: explicit field names (`kwPerRt`, `loadRt`, ISO-8601 `ts`), derivation math, and the `tariffSgdPerKwh` ↔ `cases.tariff` ↔ `tariff` naming divergence the rewrite had to fix |

## How these were captured

These were exported from the CodeBuddy Code session that built the project. They are real
screenshots, not reconstructions. The corresponding `docs/CODEBUDDY_LOG.md` indexes the moments
worth grading and references these files by name.