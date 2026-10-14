/**
 * Case value types.
 *
 * Wire types are shared from `@verdant/shared`. Backend-only types
 * (`GateSeverity`, `GATE_SEVERITIES`, `PipelineState`, `CaseCreateInput`) stay here.
 */

import type { Actor } from "@/modules/governance/actor";
import type { MetricSet } from "@/modules/analytics/analytics.types";
import type { PillSelection } from "@/modules/pills/pill.types";
import type {
  ParsedCase,
  GateResult,
  ContextCheckResult,
  DecisionOption,
  Hop,
  RouteDecision,
} from "@verdant/shared";

export {
  CASE_STATUSES,
  OUTCOME_VERDICTS,
} from "@verdant/shared";
export type {
  CaseStatus,
  OutcomeVerdict,
  GateResult,
  ContextMismatch,
  ContextCheckResult,
  ParsedCase,
  Case,
  DecisionOption,
  Outcome,
  Hop,
  RouteDecision,
  DecisionCard,
  CaseCreatePayload,
  CaseDetail,
  OutcomePayload,
} from "@verdant/shared";

/** FR-08 red-flag categories. Backend-only — the wire type uses `string | null`. */
export const GATE_SEVERITIES = [
  "safety",
  "odour",
  "illness",
  "legionella",
  "setpoint_band",
] as const;
export type GateSeverity = (typeof GATE_SEVERITIES)[number];

/** The mutable state threaded through the pipeline. Mirrors the LangGraph AgentState. */
export interface PipelineState {
  caseId: string;
  actor: Actor;
  parsed: ParsedCase | null;
  gate: GateResult | null;
  contextCheck: ContextCheckResult | null;
  selection: PillSelection | null;
  metrics: MetricSet | null;
  summary: string | null;
  options: DecisionOption[];
  route: RouteDecision | null;
  hops: Hop[];
  error: string | null;
}

/** Backend-only input shape (the wire payload is `CaseCreatePayload`). */
export interface CaseCreateInput {
  siteId: string;
  floor?: number | null;
  zone?: string | null;
  symptom: string;
  description?: string;
  reportedAt?: string;
  /** Set to attempt a cross-site transfer of an existing pill version (FR-09). */
  transferFromPillId?: string | null;
}
