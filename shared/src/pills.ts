/**
 * Intelligence Pill value types — shared wire types.
 *
 * A Pill is the identity of a body of expertise. A PillVersion is an immutable
 * snapshot of that expertise at a point in time, with a status. The model may
 * only ever *choose* a version by ID — it never authors, edits or scores one.
 */

import type { AssetType } from "./assets";

/** FR-07 action tiers, ordered from safest to most autonomous. */
export const ACTION_TIERS = ["recommend", "execute_with_approval", "escalate"] as const;
export type ActionTier = (typeof ACTION_TIERS)[number];

export const PILL_STATUSES = [
  "draft",
  "in_review",
  "approved",
  "rejected",
  "retired",
  "superseded",
] as const;
export type PillStatus = (typeof PILL_STATUSES)[number];

/** FR-02 claim kinds. Anything other than `unknown` must cite a transcript excerpt. */
export const CLAIM_KINDS = ["measured", "derived", "assumed", "unknown"] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

export interface PillStep {
  order: number;
  instruction: string;
}

export interface ContextRequirements {
  assetTypes: AssetType[];
  chillerPlant: string | null;
  tariffSgdPerKwh: number | null;
  minGfaSqm: number | null;
}

export interface Pill {
  id: string;
  slug: string;
  title: string;
  domain: string;
  ownerId: string;
  originSiteId: string;
  currentVersionId: string | null;
  createdAt: string;
}

export interface PillVersion {
  id: string;
  pillId: string;
  version: number;
  status: PillStatus;
  summary: string;
  triggers: string[];
  actionTier: ActionTier;
  steps: PillStep[];
  claimIds: string[];
  contextRequirements: ContextRequirements;
  authorId: string;
  reviewerId: string | null;
  reviewNote: string | null;
  approvedAt: string | null;
  supersedesVersionId: string | null;
  createdAt: string;
}

export interface Claim {
  id: string;
  pillVersionId: string;
  kind: ClaimKind;
  text: string;
  sourceExcerptId: string | null;
  confidence: number;
}

export interface PillOption {
  id: string;
  pillVersionId: string;
  label: string;
  detail: string;
  actionTier: ActionTier;
  sgdDelta: number;
  policyRank: number;
  sourceExcerptId: string | null;
}

export interface TranscriptExcerpt {
  id: string;
  pillId: string;
  speaker: string;
  text: string;
  capturedAt: string;
  tags: string[];
  embedding: number[] | null;
}

export interface PillSummary {
  pill: Pill;
  version: PillVersion | null;
  claimCount: number;
  optionCount: number;
}

export interface PillDetail {
  pill: Pill;
  version: PillVersion | null;
  claims: Claim[];
  options: PillOption[];
  excerpts: TranscriptExcerpt[];
  history: PillVersion[];
}

export interface CandidateScore {
  pillId: string;
  pillVersionId: string;
  score: number;
  matchedTriggers: string[];
}

export interface PillSelection {
  pillId: string;
  pillVersionId: string;
  score: number;
  reason: string;
  candidates: CandidateScore[];
  modelAssisted: boolean;
}

export interface EvalCaseResult {
  caseId: string;
  expectedPillId: string;
  selectedPillId: string | null;
  hit: boolean;
}

export interface EvalReport {
  total: number;
  hits: number;
  precision: number;
  recall: number;
  results: EvalCaseResult[];
}

export interface ClaimInput {
  kind: ClaimKind;
  text: string;
  sourceQuote: string | null;
  confidence?: number;
}

export interface ClaimSuggestions {
  suggestions: { kind: ClaimKind; text: string; sourceQuote: string | null }[];
  rejected: number;
  modelAssisted: boolean;
  source: string;
}

export interface PillOptionInput {
  label: string;
  detail: string;
  actionTier: ActionTier;
  sgdDelta: number;
  policyRank: number;
  sourceQuote: string | null;
}

export interface CapturePayload {
  title: string;
  domain: string;
  summary: string;
  triggers: string[];
  steps: string[];
  actionTier: ActionTier;
  contextRequirements: ContextRequirements;
  claims: ClaimInput[];
  options?: PillOptionInput[];
  transcript: { speaker: string; text: string }[];
}

/**
 * The policy hierarchy. When two options conflict, the lower rank wins —
 * comfort never outranks safety, and an energy target never outranks a lease term.
 */
export const POLICY_TIERS = {
  safety: 0,
  statutory: 1,
  lease_comfort: 2,
  energy_target: 3,
  preference: 4,
} as const;

export type PolicyTier = keyof typeof POLICY_TIERS;

/** Policy hierarchy labels for display. Lower rank wins. */
export const POLICY_TIER_LABELS: Record<number, string> = {
  0: "Safety",
  1: "Statutory",
  2: "Lease comfort",
  3: "Energy target",
  4: "Preference",
};
