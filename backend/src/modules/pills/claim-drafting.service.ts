/**
 * AI-assisted capture — turns an interview transcript into *suggested* claims.
 *
 * This is the second place the model is allowed to help, and it is bounded the same way as
 * pill selection:
 *
 *   - It only suggests. Nothing is persisted; the chief engineer edits the suggestions and
 *     submits the form, and `capturePill` re-runs FR-02 on whatever they submit.
 *   - Every suggestion is re-validated against the transcript with the same `validateClaims`
 *     rule the capture endpoint uses. A model that paraphrases or invents a quote has that
 *     suggestion dropped, and the drop is counted and audited rather than hidden.
 *   - With the model off (the demo and CI default) a deterministic extractor produces the
 *     suggestions, so the feature works with no API key.
 */

import { appendAudit } from "@/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/modules/audit/audit.types";
import type { Actor } from "@/modules/governance/actor";
import { assertCan } from "@/modules/governance/roles";
import { draftClaims } from "./model";
import type { DraftedClaim } from "./model";
import { validateClaims } from "./pill.service";

const MAX_SUGGESTIONS = 8;

export interface ClaimSuggestions {
  suggestions: DraftedClaim[];
  /** Model suggestions dropped because their quote is not verbatim in the transcript. */
  rejected: number;
  modelAssisted: boolean;
  source: string;
}

type TranscriptLine = { speaker: string; text: string };

const UNKNOWN = /\b(not sure|don't know|do not know|unclear|no idea|never confirmed|can't tell|cannot tell|whether)\b/i;
const ASSUMED = /\b(i think|probably|likely|i suspect|i assume|might|may be|guess|points at|points to|suggests)\b/i;
const MEASURED_NUMBER = /\d/;
const MEASURED_UNIT = /(°|\b(c|f|kw|rt|kwh|kw\/rt|hours?|minutes?|days?|weeks?|degrees?|psi|bar|sgd|percent)\b|%|\$)/i;
const OBSERVED = /\b(we saw|we noticed|we observed|we found|we measured|logged|recorded)\b/i;
const DERIVED = /^(so|because|therefore|which means)\b|\b(led to|leads to|results? in|caused?)\b/i;
const CONNECTIVE = /^(so|which|because|but|and)\s+/i;

/** Split a transcript line into clauses, each a verbatim substring of the line. */
function clauses(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => sentence.split(/,\s+(?=(?:so|which|because|but)\b)/i))
    .map((clause) => clause.trim().replace(/[.!?,;:]+$/, ""))
    .filter((clause) => clause.split(/\s+/).length >= 4);
}

function classify(clause: string): DraftedClaim["kind"] | null {
  if (UNKNOWN.test(clause)) return "unknown";
  if ((MEASURED_NUMBER.test(clause) && MEASURED_UNIT.test(clause)) || OBSERVED.test(clause)) {
    return "measured";
  }
  if (ASSUMED.test(clause)) return "assumed";
  if (DERIVED.test(clause)) return "derived";
  return null;
}

function asStatement(clause: string): string {
  const stripped = clause.replace(CONNECTIVE, "");
  return `${stripped.charAt(0).toUpperCase()}${stripped.slice(1)}.`;
}

/** Deterministic fallback: no I/O, same input always yields the same suggestions. */
export function extractClaims(transcript: readonly TranscriptLine[]): DraftedClaim[] {
  const seen = new Set<string>();
  const out: DraftedClaim[] = [];

  for (const line of transcript) {
    for (const clause of clauses(line.text)) {
      const kind = classify(clause);
      const key = clause.toLowerCase();
      if (kind === null || seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind,
        text: asStatement(clause),
        sourceQuote: kind === "unknown" ? null : clause,
      });
    }
  }

  return out.slice(0, MAX_SUGGESTIONS);
}

/** Keep only suggestions that would pass the capture endpoint's FR-02 check. */
function provable(
  claims: readonly DraftedClaim[],
  transcript: readonly TranscriptLine[],
): { kept: DraftedClaim[]; rejected: number } {
  const kept: DraftedClaim[] = [];
  let rejected = 0;

  for (const claim of claims) {
    const candidate = claim.kind === "unknown" ? { ...claim, sourceQuote: null } : claim;
    try {
      validateClaims([candidate], transcript);
      kept.push(candidate);
    } catch {
      rejected += 1;
    }
  }

  return { kept: kept.slice(0, MAX_SUGGESTIONS), rejected };
}

export async function suggestClaims(
  transcript: readonly TranscriptLine[],
  actor: Actor,
): Promise<ClaimSuggestions> {
  assertCan(actor.role, "pill:capture");

  const drafted = await draftClaims(transcript);
  const modelAssisted = drafted !== null;
  const { kept, rejected } = provable(drafted ?? extractClaims(transcript), transcript);

  const result: ClaimSuggestions = {
    suggestions: kept,
    rejected,
    modelAssisted,
    source: modelAssisted
      ? "Model draft, re-checked against the transcript (FR-02)."
      : "Deterministic extractor (model disabled).",
  };

  appendAudit({
    action: AUDIT_ACTIONS.PILL_CLAIMS_SUGGESTED,
    entityType: "pill_draft",
    entityId: `draft:${actor.id}`,
    payload: {
      modelAssisted,
      transcriptLines: transcript.length,
      suggested: kept.length,
      rejected,
    },
    actor,
  });

  return result;
}
