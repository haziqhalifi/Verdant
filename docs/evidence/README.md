# CodeBuddy build evidence

> **Hackathon requirement.** The organiser handbook requires **at least 3 screenshots, or a
> recording, of the CodeBuddy / WorkBuddy build chats**, kept in the repository. This folder holds
> those artefacts.

## How to capture

1. Open each CodeBuddy session transcript in turn.
2. Capture full-window frames that show the prompt, the tool's reasoning, and the diff — the
   moments that show *engineering judgement* are the most compelling.
3. Save PNGs here as `01-...`, `02-...`, `03-...` (and a `cover.png` 16:9 at 380×216 px or
   larger for the showcase).
4. `docs/CODEBUDDY_LOG.md` references these files by name.

## Required files

| File | Purpose |
|---|---|
| `cover.png` | 16:9 cover image for the project showcase (≥ 380×216 px) |
| `01-stack-pivot.png` | The FastAPI→Express pivot: prior work preserved, not discarded |
| `02-disk-blocker.png` | Docker "not enough space on disk" reported honestly, not hidden |
| `03-tsc-narrowing.png` | `tsc` "no overlap" error fixed via `isBlocked(state)` funnel |
| `04-eval-caught-bug.png` | Retrieval eval reporting 0.5833, root-caused to slug/title mismatch |
| `05-hero-card.png` | Live API hero card: setpoint rejected, resequence selected |

Until real captures are dropped in, the placeholders below document what each frame should show.
**Do not fabricate screenshots** — re-run the session and capture the real frames.
