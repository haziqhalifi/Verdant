/**
 * AI-assisted capture. With the model disabled (the test default) suggestions come from the
 * deterministic extractor, and every suggestion must survive the capture endpoint's FR-02 rule.
 */

import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "@/app";
import { config } from "@/config";
import { listAuditEntries } from "@/modules/audit/audit.service";
import { extractClaims, suggestClaims } from "@/modules/pills/claim-drafting.service";
import { capturePill, validateClaims } from "@/modules/pills/pill.service";
import { actorFor, sampleCapture, seedWorld } from "./helpers";

const TRANSCRIPT = [
  {
    speaker: "Chief Engineer",
    text: "We saw the plant staging drift after the valve actuator was replaced, so both chillers were running at part load.",
  },
  {
    speaker: "Operator",
    text: "Condenser approach was 3.2 C higher than commissioning, which points at tube fouling.",
  },
  {
    speaker: "Chief Engineer",
    text: "I'm not sure whether the fouling is on the water side or the refrigerant side.",
  },
];

describe("claim drafting", () => {
  beforeEach(() => {
    seedWorld();
  });

  it("extracts one claim per kind from the example transcript", () => {
    const claims = extractClaims(TRANSCRIPT);
    expect(claims.map((claim) => claim.kind)).toEqual([
      "measured",
      "derived",
      "measured",
      "assumed",
      "unknown",
    ]);
  });

  it("only suggests quotes that appear verbatim in the transcript", () => {
    for (const claim of extractClaims(TRANSCRIPT)) {
      expect(() => validateClaims([claim], TRANSCRIPT)).not.toThrow();
    }
  });

  it("never attaches a quote to an unknown claim", () => {
    const unknown = extractClaims(TRANSCRIPT).filter((claim) => claim.kind === "unknown");
    expect(unknown).toHaveLength(1);
    expect(unknown[0]?.sourceQuote).toBeNull();
  });

  it("is deterministic", () => {
    expect(extractClaims(TRANSCRIPT)).toEqual(extractClaims(TRANSCRIPT));
  });

  it("produces suggestions the capture endpoint accepts unchanged", async () => {
    const actor = actorFor("chief_engineer");
    const { suggestions } = await suggestClaims(TRANSCRIPT, actor);
    const detail = capturePill(
      sampleCapture({ claims: suggestions, transcript: TRANSCRIPT }),
      actor,
    );
    expect(detail.claims).toHaveLength(suggestions.length);
  });

  it("reports the deterministic path and audits the suggestion", async () => {
    const result = await suggestClaims(TRANSCRIPT, actorFor("chief_engineer"));
    expect(result.modelAssisted).toBe(false);
    expect(result.rejected).toBe(0);

    const entries = listAuditEntries({ action: "pill.claims_suggested" });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.payload).toMatchObject({ suggested: result.suggestions.length });
  });

  it("is restricted to the chief engineer over HTTP", async () => {
    const denied = await request(createApp())
      .post("/api/pills/suggest-claims")
      .set("x-verdant-role", "aom")
      .send({ transcript: TRANSCRIPT });
    expect(denied.status).toBe(403);

    const allowed = await request(createApp())
      .post("/api/pills/suggest-claims")
      .set("x-verdant-role", "chief_engineer")
      .send({ transcript: TRANSCRIPT });
    expect(allowed.status).toBe(200);
    expect(allowed.body.suggestions.length).toBeGreaterThan(0);
  });

  describe("with the model enabled", () => {
    const llm = config.llm as { enabled: boolean; apiKey: string };

    beforeEach(() => {
      llm.enabled = true;
      llm.apiKey = "test-key";
    });

    afterEach(() => {
      llm.enabled = false;
      llm.apiKey = "";
      vi.unstubAllGlobals();
    });

    function stubModel(claims: unknown): void {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          new Response(
            JSON.stringify({ choices: [{ message: { content: JSON.stringify({ claims }) } }] }),
          ),
        ),
      );
    }

    it("drops a suggestion whose quote the engineer never said", async () => {
      stubModel([
        { kind: "measured", text: "Approach rose 3.2 C.", source_quote: "Condenser approach was 3.2 C higher" },
        { kind: "derived", text: "Fouling cost S$9,000.", source_quote: "fouling cost us nine thousand dollars" },
      ]);

      const result = await suggestClaims(TRANSCRIPT, actorFor("chief_engineer"));
      expect(result.modelAssisted).toBe(true);
      expect(result.suggestions).toHaveLength(1);
      expect(result.rejected).toBe(1);
    });

    it("falls back to the extractor when the model fails", async () => {
      vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));

      const result = await suggestClaims(TRANSCRIPT, actorFor("chief_engineer"));
      expect(result.modelAssisted).toBe(false);
      expect(result.suggestions).toEqual(extractClaims(TRANSCRIPT));
    });
  });
});
