/**
 * Audit value types — shared wire types (FR-11).
 *
 * The log is append-only and hash-chained: each entry commits to the previous
 * entry's hash, so any edit or deletion anywhere in the chain is detectable.
 */

import type { Role } from "./governance";

/** The complete vocabulary of audited actions. Anything not listed here is a bug. */
export const AUDIT_ACTIONS = {
  CASE_CREATED: "case.created",
  CASE_GATE_TRIGGERED: "case.gate_triggered",
  CASE_CONTEXT_BLOCKED: "case.context_blocked",
  CASE_PILL_SELECTED: "case.pill_selected",
  CASE_CARD_ASSEMBLED: "case.card_assembled",
  CASE_ACTION_ROUTED: "case.action_routed",
  CASE_OUTCOME_RECORDED: "case.outcome_recorded",
  PILL_CLAIMS_SUGGESTED: "pill.claims_suggested",
  PILL_CAPTURED: "pill.captured",
  PILL_REVISED: "pill.revised",
  PILL_SUBMITTED: "pill.submitted",
  PILL_APPROVED: "pill.approved",
  PILL_REJECTED: "pill.rejected",
  PILL_ROLLED_BACK: "pill.rolled_back",
  SEED_RUN: "seed.run",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ENTITY_TYPES = ["case", "pill"] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface AuditLogEntry {
  id: string;
  seq: number;
  prevHash: string;
  hash: string;
  action: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  shortHash: string;
  shortPrevHash: string;
}

export interface AuditVerification {
  valid: boolean;
  entries: number;
  brokenAtSeq: number | null;
}
