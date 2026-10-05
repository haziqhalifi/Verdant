/**
 * The model boundary — the ONLY place in this codebase that talks to an LLM provider.
 *
 * Two contracts, both deliberately tiny:
 *
 *   choosePill  — given a case and a ranked candidate list, return the ID of exactly one
 *                 candidate. The model does not compute numbers, does not write guidance, and
 *                 cannot introduce an ID that retrieval did not supply.
 *   draftClaims — given a capture transcript, propose claims that each cite a verbatim quote.
 *                 The output is a *suggestion* for the chief engineer to edit; the caller
 *                 re-validates every quote against the transcript (FR-02) and nothing is saved
 *                 until a human submits the form.
 *
 * Any hallucinated, malformed or timed-out response falls back to deterministic code, so the
 * platform is safe with the model switched on or off. With `LLM_ENABLED=false` (the demo and CI
 * default) this module never performs I/O.
 */

import { config } from "@/config";
import type { CandidateScore, ClaimKind } from "./pill.types";

export interface ModelChoice {
  pillVersionId: string | null;
  reason: string;
  modelAssisted: boolean;
}

const MODEL_TIMEOUT_MS = 10_000;

function deterministicChoice(candidates: readonly CandidateScore[]): ModelChoice {
  const top = candidates[0];
  if (top === undefined) {
    return { pillVersionId: null, reason: "No approved pill matched the case.", modelAssisted: false };
  }

  return {
    pillVersionId: top.pillVersionId,
    reason: `Highest retrieval score (${top.score.toFixed(2)}); matched ${top.matchedTriggers.length} trigger token(s).`,
    modelAssisted: false,
  };
}

interface ChatCompletion {
  choices?: { message?: { content?: string | null } }[];
}

/** One JSON-mode chat completion against any OpenAI-compatible endpoint. */
async function complete(system: string, user: string): Promise<string> {
  const baseUrl =
    config.llm.baseUrl === ""
      ? "https://api.openai.com/v1"
      : config.llm.baseUrl.replace(/\/+$/, "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.llm.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.llm.model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Model responded with HTTP ${response.status}.`);

    const body = (await response.json()) as ChatCompletion;
    return body.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

function modelAvailable(): boolean {
  return config.llm.enabled && config.llm.apiKey !== "";
}

async function callModel(caseText: string, candidates: readonly CandidateScore[]): Promise<string> {
  return complete(
    "You select exactly one Intelligence Pill version ID from the supplied candidates. " +
      "You never invent IDs, never write guidance, and never produce or change numbers. " +
      'Reply with JSON only: {"pill_version_id": "<one of the candidates>", "reason": "<short reason>"}.',
    JSON.stringify({
      case: caseText,
      candidates: candidates.map((candidate) => ({
        pill_version_id: candidate.pillVersionId,
        pill_id: candidate.pillId,
        score: candidate.score,
        matched_triggers: candidate.matchedTriggers,
      })),
    }),
  );
}

/**
 * Ask the model to choose a candidate. Falls back deterministically on any failure — a
 * disabled model, a timeout, a non-2xx response, or an ID outside the candidate set.
 */
export async function choosePill(
  caseText: string,
  candidates: readonly CandidateScore[],
): Promise<ModelChoice> {
  const fallback = deterministicChoice(candidates);
  if (!modelAvailable()) return fallback;

  try {
    const content = await callModel(caseText, candidates);
    const parsed = JSON.parse(content) as { pill_version_id?: unknown; reason?: unknown };
    const allowed = new Set(candidates.map((candidate) => candidate.pillVersionId));

    if (typeof parsed.pill_version_id !== "string" || !allowed.has(parsed.pill_version_id)) {
      return fallback;
    }

    return {
      pillVersionId: parsed.pill_version_id,
      reason:
        typeof parsed.reason === "string" && parsed.reason.trim() !== ""
          ? parsed.reason
          : "Model selected a pill from the candidate set.",
      modelAssisted: true,
    };
  } catch {
    return fallback;
  }
}

export interface DraftedClaim {
  kind: ClaimKind;
  text: string;
  sourceQuote: string | null;
}

const CLAIM_KIND_SET: ReadonlySet<string> = new Set(["measured", "derived", "assumed", "unknown"]);

/**
 * Ask the model to propose claims from a capture transcript. Returns `null` when the model is
 * disabled or fails, so the caller can fall back to the deterministic extractor. The shape is
 * checked here; the caller still re-validates every quote against the transcript.
 */
export async function draftClaims(
  transcript: readonly { speaker: string; text: string }[],
): Promise<DraftedClaim[] | null> {
  if (!modelAvailable()) return null;

  try {
    const content = await complete(
      "You help a building chief engineer turn an interview transcript into provable claims. " +
        "Each claim is one short factual statement. kind is one of: measured (a reading or " +
        "observation), derived (a conclusion drawn from evidence), assumed (a belief the speaker " +
        "has not verified), unknown (something the speaker says is not yet known). Every claim " +
        "that is not unknown MUST include source_quote copied character-for-character from a " +
        "single transcript line; never paraphrase a quote. unknown claims have source_quote null. " +
        "Never invent numbers or facts that are not in the transcript. At most 8 claims. " +
        'Reply with JSON only: {"claims": [{"kind": "...", "text": "...", "source_quote": "..." | null}]}.',
      JSON.stringify({ transcript }),
    );

    const parsed = JSON.parse(content) as { claims?: unknown };
    if (!Array.isArray(parsed.claims)) return null;

    return parsed.claims.flatMap((raw: unknown): DraftedClaim[] => {
      if (typeof raw !== "object" || raw === null) return [];
      const claim = raw as { kind?: unknown; text?: unknown; source_quote?: unknown };
      if (typeof claim.kind !== "string" || !CLAIM_KIND_SET.has(claim.kind)) return [];
      if (typeof claim.text !== "string" || claim.text.trim().length < 3) return [];
      return [
        {
          kind: claim.kind as ClaimKind,
          text: claim.text.trim().slice(0, 1000),
          sourceQuote:
            typeof claim.source_quote === "string" && claim.source_quote.trim() !== ""
              ? claim.source_quote.trim().slice(0, 1000)
              : null,
        },
      ];
    });
  } catch {
    return null;
  }
}
