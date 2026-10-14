/**
 * Case value types — shared wire types.
 *
 * A Case is one comfort/energy complaint. Running it produces a DecisionCard:
 * the gate verdict, the context verdict, the chosen pill, the deterministic
 * metrics, the priced options, and the routing decision.
 */

import type { ActionTier, PillSelection } from "./pills";
import type { MetricSet } from "./analytics";

export const CASE_STATUSES = [
  "open",
  "gated",
  "blocked",
  "escalated",
  "decided",
  "closed",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const OUTCOME_VERDICTS = ["improved", "no_change", "worse", "pending"] as const;
export type OutcomeVerdict = (typeof OUTCOME_VERDICTS)[number];

export interface GateResult {
  triggered: boolean;
  severity: string | null;
  ruleId: string | null;
  matchedText: string | null;
  escalateTo: string | null;
  message: string;
}

export interface ContextMismatch {
  field: string;
  required: string;
  actual: string;
  note: string;
}

export interface ContextCheckResult {
  compatible: boolean;
  checked: string[];
  mismatches: ContextMismatch[];
}

export interface ParsedCase {
  symptom: string;
  floor: number | null;
  zone: string | null;
  observedAt: string | null;
  reportedTemperatureC: number | null;
  targetTemperatureC: number | null;
  tokens: string[];
}

export interface Case {
  id: string;
  siteId: string;
  assetId: string | null;
  tenantId: string | null;
  floor: number | null;
  zone: string | null;
  reportedAt: string;
  symptom: string;
  description: string;
  reportedBy: string;
  status: CaseStatus;
  transferFromPillId: string | null;
  parsed: ParsedCase | null;
  gate: GateResult | null;
  contextCheck: ContextCheckResult | null;
  createdAt: string;
}

export interface DecisionOption {
  id: string;
  caseId: string;
  pillVersionId: string;
  label: string;
  detail: string;
  actionTier: ActionTier;
  sgdDelta: number;
  policyRank: number;
  selected: boolean;
}

export interface Outcome {
  id: string;
  caseId: string;
  optionId: string | null;
  decidedBy: string;
  decidedAt: string;
  verdict: OutcomeVerdict;
  comfortDeltaC: number | null;
  energyDeltaKwh: number | null;
  note: string;
}

export interface Hop {
  node: string;
  status: "ok" | "halt";
  latencyMs: number;
  note: string;
}

export type RouteDecision = ActionTier | "blocked";

export interface DecisionCard {
  case: Case;
  gate: GateResult | null;
  contextCheck: ContextCheckResult | null;
  selection: PillSelection | null;
  metrics: MetricSet | null;
  summary: string | null;
  options: DecisionOption[];
  route: RouteDecision | null;
  hops: Hop[];
  policyNote: string;
  auditVerified: boolean;
}

export interface CaseCreatePayload {
  siteId: string;
  floor?: number | null;
  zone?: string | null;
  symptom: string;
  description?: string;
  reportedAt?: string;
  transferFromPillId?: string | null;
}

export interface CaseDetail {
  case: Case;
  options: DecisionOption[];
  outcomes: Outcome[];
}

export interface OutcomePayload {
  optionId?: string | null;
  verdict: OutcomeVerdict;
  comfortDeltaC?: number | null;
  energyDeltaKwh?: number | null;
  note?: string;
}
