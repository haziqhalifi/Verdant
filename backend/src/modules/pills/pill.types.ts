/**
 * Intelligence Pill value types.
 *
 * Wire types are shared from `@verdant/shared`. Backend-only types
 * (`PillCaptureInput`, `isActionTier`) stay here.
 */

import { ACTION_TIERS } from "@verdant/shared";
import type {
  ActionTier,
  ContextRequirements,
  ClaimInput,
  PillOptionInput,
} from "@verdant/shared";

export {
  ACTION_TIERS,
  PILL_STATUSES,
  CLAIM_KINDS,
  POLICY_TIERS,
  POLICY_TIER_LABELS,
} from "@verdant/shared";
export type {
  ActionTier,
  PillStatus,
  ClaimKind,
  PillStep,
  ContextRequirements,
  Pill,
  PillVersion,
  Claim,
  PillOption,
  TranscriptExcerpt,
  PillSummary,
  PillDetail,
  CandidateScore,
  PillSelection,
  EvalCaseResult,
  EvalReport,
  ClaimInput,
  ClaimSuggestions,
  PillOptionInput,
  CapturePayload,
  PolicyTier,
} from "@verdant/shared";

export function isActionTier(value: unknown): value is ActionTier {
  return typeof value === "string" && (ACTION_TIERS as readonly string[]).includes(value);
}

/** Backend-only: the raw capture input shape before it becomes a `CapturePayload`. */
export interface PillCaptureInput {
  title: string;
  domain: string;
  summary: string;
  triggers: string[];
  steps: string[];
  actionTier: ActionTier;
  contextRequirements: ContextRequirements;
  claims: ClaimInput[];
  /** Explicit priced options. When omitted, options are derived from `steps`. */
  options?: PillOptionInput[];
  transcript: { speaker: string; text: string }[];
}
