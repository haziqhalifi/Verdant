# Submission copy — paste into the form

Draft text for the AI CAN DO IT Tencent Cloud Hackathon SG 2026 submission form (handbook §8).
Figures come from the synthetic, seeded demo world and are labelled as such.

---

## Project title

**Verdant — Governed Intelligence Pills for Building Operations**

## Short blurb (hard limit: under 10 words)

> Retiring engineers' judgement, captured, governed and safely reused.

*(8 words.)*

## Chosen case study

Real Estate track (Keppel) — **AI HARVEST: Turning Expert Know-How into Reusable Intelligence**.
Pill focus: Energy Optimisation and Tenant Experience.

---

## Project description

### 1. Project overview — scenarios, users, value

Verdant turns a building chief engineer's judgement into **Intelligence Pills**: versioned,
reviewed, provable units of know-how that an operations team can apply to live incidents.

- **Target scenario:** comfort and energy incidents in a Grade-A office tower's chiller plant, for
  example a "too hot" complaint on Level 23 while plant efficiency is drifting.
- **Users:** the Chief Engineer (captures and owns pills), the Pill Reviewer (approves; never their
  own work), the Asset Operations Manager (runs cases and approves actions), Site Operators, and a
  Governance Admin (audit).
- **Value:** the right fix, priced and explained, in seconds, even after the expert has retired,
  with a human approving anything that acts.

### 2. Real-world scenario insights — pain points, audience, problems solved

- **Source of pain:** after a retrofit, energy is down in aggregate, but nobody can say *which lever*
  worked, and the engineer who knows is retiring. Knowledge sits with a few experts, new staff take
  years to build it, and best practice is applied inconsistently across buildings.
- **Audience:** asset and facilities operations teams running a multi-building portfolio.
- **Problems solved:**
  1. **Capture:** a guided interview, with AI-drafted claims, records the engineer's knowledge,
     including what the engineer explicitly *doesn't* know.
  2. **Trust:** every claim must quote the engineer verbatim, or it cannot be saved.
  3. **Wrong intuitive fixes:** the pill prices every option and refuses the one that breaches
     policy. In the hero case it rejects "drop the building-wide setpoint" (+S$642.60) in favour
     of re-sequencing chiller staging (−S$1,285.20).
  4. **Unsafe reuse:** a pill cannot run at a building whose plant, tariff or floor area differs.

### 3. Solution design — business and technical architecture, and how prompts drive the AI

**Business flow:** Capture → Review → Apply → Record outcome → Revise. Every transition is
role-checked and written to a SHA-256 hash-chained audit log. Diagrams: `docs/SOLUTION.md`.

**Technical stack:** Vite + React 19 console, Express + TypeScript API, deterministic in-memory
store seeded from one RNG seed, and a Postgres + pgvector schema for the durable path.
103 automated tests run in CI.

**Design rule — the AI never writes guidance and never produces a number.** The model is
confined to one file (`backend/src/modules/pills/model.ts`) with two narrow prompts:

1. **Claim drafting (capture).** The system prompt asks the model to turn the transcript into
   short claims tagged *measured / derived / assumed / unknown*, each with a `source_quote` copied
   *character-for-character* from one transcript line, and never to invent numbers. The code then
   re-checks every quote against the transcript. A paraphrased or invented quote is dropped,
   counted, and audited. The engineer edits the suggestions, and nothing is saved until the engineer
   submits.
2. **Pill selection (apply).** The model receives the case and a closed list of retrieved
   candidate IDs, and must reply with JSON naming exactly one of them. An ID outside the set, a
   malformed reply, or a timeout falls back to the top-scoring candidate.

Everything safety-critical is deterministic code: the red-flag gate (smoke, legionella, illness,
odour, setpoint band) runs *before* any model call, and all metrics (kW/RT drift, excess kWh, SGD,
weather normalisation) are computed from telemetry. The model is OpenAI-compatible and optional,
so it can run on Tencent Hunyuan, and the demo works with no API key.

### 4. Business value — metrics and impact

On the seeded Tower K data (synthetic, illustrative):

| Metric | Value |
|---|---|
| Plant efficiency drift detected | 0.6230 → 0.7130 kW/RT (+0.09) |
| Excess energy from the drift | 1,836 kWh/day at 850 RT |
| Excess cost | S$514.08/day at S$0.28/kWh (≈ S$188k/year if left unaddressed) |
| Wrong fix avoided | building-wide setpoint drop, +S$642.60 |
| Selected fix | re-sequence chiller staging, −S$1,285.20 |
| Retrieval quality | precision 1.0, recall 1.0 over 12 historical tickets |
| Unsafe transfers blocked | Tower K pill → Harbourfront One blocked on 3 mismatches |
| Audit integrity | every decision hash-chained and verifiable |

**Impact:** expertise survives retirement, is reused across the portfolio only where it fits,
and every recommendation is explainable to an auditor.

---

## Other form fields

| Field | Status |
|---|---|
| CodeBuddy / WorkBuddy conversation history (≥ 3 screenshots) | **To do — must be real captures.** Save under `docs/evidence/` and index them in `docs/CODEBUDDY_LOG.md`. |
| Cover image (16:9) | `docs/evidence/cover.png` (1920×1080) and `docs/evidence/cover-380x216.png` |
| Demo video (optional, 5–8 min) | Suggested flow: `README.md` → *Demo script* |
| Project link (optional, bonus) | Not deployed yet |
| Source code | https://github.com/haziqhalifi/Techive |
