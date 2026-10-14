/**
 * Audit value types — FR-11.
 *
 * The log is append-only and hash-chained: each entry commits to the previous entry's hash,
 * so any edit or deletion anywhere in the chain is detectable.
 *
 * Wire types (`AUDIT_ACTIONS`, `AuditAction`, `AUDIT_ENTITY_TYPES`, `AuditEntityType`,
 * `AuditVerification`) are shared from `@verdant/shared`. The backend's `AuditLogEntry`
 * extends `ChainEntry` (internal storage shape); the wire shape returned by the API includes
 * `shortHash` / `shortPrevHash` via `presentAuditEntry`.
 */

import type { Actor } from "@/modules/governance/actor";
import type { Role } from "@/modules/governance/roles";
import type { ChainEntry } from "@/shared/hash";

export {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@verdant/shared";
export type { AuditAction, AuditEntityType, AuditVerification } from "@verdant/shared";

/**
 * Internal storage shape. Extends `ChainEntry` (which carries `seq`, `prevHash`, `hash`
 * plus the hashed fields). The API returns the presented form with `shortHash` /
 * `shortPrevHash` added — that wire shape matches the shared `AuditLogEntry`.
 */
export interface AuditLogEntry extends ChainEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
}

export interface AuditAppendInput {
  action: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  actor: Actor;
  /** Defaults to the store clock. Supply explicitly in tests for a stable chain. */
  occurredAt?: string;
}
