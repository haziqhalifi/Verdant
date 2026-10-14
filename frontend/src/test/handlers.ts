import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

import type { RoleInfo } from "@/types/verdant";
import { ROLES } from "@/types/verdant";

/**
 * The permission sets per role. These mirror the backend's `PERMISSIONS` table
 * so tests can switch roles and see the right UI.
 */
const PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  aom: ["case:read", "case:run", "pill:read"],
  chief_engineer: ["case:read", "case:run", "pill:read", "pill:capture"],
  pill_reviewer: ["case:read", "pill:read", "pill:review", "pill:rollback", "audit:read"],
  site_operator: ["case:read", "case:run", "pill:read"],
  governance_admin: ["case:read", "pill:read", "pill:export", "seed:run", "audit:read"],
};

export const ROLE_INFOS: RoleInfo[] = ROLES.map((role) => ({
  role,
  label: role,
  description: { can: "read", cannot: "write" },
  permissions: PERMISSIONS_BY_ROLE[role] ?? [],
}));

const PILL_SUMMARIES = [
  {
    pill: {
      id: "pill-chiller-staging",
      slug: "chiller-staging",
      title: "Chiller Staging Optimisation",
      domain: "hvac",
      ownerId: "user-engineer",
      originSiteId: "site-tower-k",
      currentVersionId: "pv-001",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    version: {
      id: "pv-001",
      pillId: "pill-chiller-staging",
      version: 1,
      status: "approved" as const,
      summary: "Stage chillers based on load.",
      triggers: ["high load", "staging"],
      steps: [{ id: "step-1", order: 1, instruction: "Check load." }],
      contextRequirements: {
        assetTypes: ["chiller"],
        chillerPlant: null,
        tariffSgdPerKwh: null,
        minGfaSqm: null,
      },
      actionTier: "recommend" as const,
      authorId: "user-engineer",
      reviewerId: "user-reviewer",
      reviewNote: "Approved.",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
    claimCount: 1,
    optionCount: 1,
  },
];

const PILL_DETAIL = {
  pill: PILL_SUMMARIES[0]!.pill,
  version: PILL_SUMMARIES[0]!.version,
  claims: [
    {
      id: "claim-1",
      versionId: "pv-001",
      kind: "quantitative" as const,
      text: "Staging reduces energy by 12%.",
      sourceExcerptId: "excerpt-1",
      confidence: 0.9,
    },
  ],
  excerpts: [
    {
      id: "excerpt-1",
      transcriptId: "transcript-1",
      speaker: "Engineer",
      text: "We saw 12% savings.",
      order: 1,
    },
  ],
  options: [
    {
      id: "opt-1",
      versionId: "pv-001",
      label: "Stage 2 chillers",
      detail: "Enable second chiller.",
      policyRank: 1,
      actionTier: "recommend" as const,
      sgdDelta: -1200,
    },
  ],
  history: [PILL_SUMMARIES[0]!.version],
};

const METRICS = {
  siteId: "site-tower-k",
  siteName: "Tower K",
  kpi: {
    energyUseKwh: 12000,
    energyIntensityKwhPerSqm: 38,
    costSgd: 2400,
    comfortHoursPct: 0.92,
    carbonKg: 6000,
    deltaFromBaselinePct: -8,
  },
  sparkline: [100, 95, 98, 92],
  topSites: [],
};

const CASES = {
  cases: [
    {
      id: "case-001",
      siteId: "site-tower-k",
      siteName: "Tower K",
      status: "resolved" as const,
      pillId: "pill-chiller-staging",
      pillTitle: "Chiller Staging",
      createdAt: "2026-01-01T00:00:00.000Z",
      resolvedAt: "2026-01-02T00:00:00.000Z",
      summary: "High load on chiller plant.",
    },
  ],
};

const SITES = {
  sites: [
    {
      id: "site-tower-k",
      name: "Tower K",
      address: "1 Keppel Road",
      gfaSqm: 35000,
      climateZone: "tropical",
      gridTariffSgdPerKwh: 0.25,
    },
  ],
};

const SEED_STATUS = {
  seed: 20261002,
  llmEnabled: false,
  counts: { pills: 6, cases: 10, auditEntries: 20 },
};

const AUDIT = {
  verification: { valid: true, entries: 20, brokenAtSeq: null },
  entries: [
    {
      id: "audit-1",
      seq: 1,
      timestamp: "2026-01-01T00:00:00.000Z",
      actorId: "user-engineer",
      actorName: "Engineer",
      actorRole: "chief_engineer",
      action: "PILL_CAPTURED",
      entityType: "pill",
      entityId: "pill-chiller-staging",
      details: {},
      shortHash: "abc12345",
      shortPrevHash: "00000000",
    },
  ],
};

const baseHandlers = [
  http.get("http://localhost:8000/api/roles", () =>
    HttpResponse.json({ roles: ROLE_INFOS }),
  ),
  http.get("http://localhost:8000/api/seed/status", () =>
    HttpResponse.json(SEED_STATUS),
  ),
  http.get("http://localhost:8000/api/pills", () =>
    HttpResponse.json({ pills: PILL_SUMMARIES }),
  ),
  http.get("http://localhost:8000/api/pills/:id", () =>
    HttpResponse.json(PILL_DETAIL),
  ),
  http.get("http://localhost:8000/api/pills/eval", () =>
    HttpResponse.json({
      total: 10,
      hits: 9,
      precision: 0.9,
      recall: 0.9,
      results: [],
    }),
  ),
  http.get("http://localhost:8000/api/analytics/metrics", () =>
    HttpResponse.json(METRICS),
  ),
  http.get("http://localhost:8000/api/analytics/readings", () =>
    HttpResponse.json({ count: 0, total: 0, readings: [] }),
  ),
  http.get("http://localhost:8000/api/sites", () => HttpResponse.json(SITES)),
  http.get("http://localhost:8000/api/assets", () =>
    HttpResponse.json({ assets: [] }),
  ),
  http.get("http://localhost:8000/api/tenants", () =>
    HttpResponse.json({ tenants: [] }),
  ),
  http.get("http://localhost:8000/api/cases", () => HttpResponse.json(CASES)),
  http.get("http://localhost:8000/api/cases/:id", () =>
    HttpResponse.json({
      case: CASES.cases[0],
      gate: { triggered: false, ruleId: "", severity: null, message: "clear", escalateTo: "", matchedText: null },
      selection: { pillId: "pill-chiller-staging", pillTitle: "Chiller Staging", reason: "best match", confidence: 0.9 },
      metrics: METRICS,
      summary: "Stage chillers.",
      options: [],
      route: "recommend",
      hops: [],
      policyNote: "",
      auditVerified: true,
    }),
  ),
  http.get("http://localhost:8000/api/cases/:id/detail", () =>
    HttpResponse.json({ case: CASES.cases[0], pill: PILL_DETAIL.pill, version: PILL_DETAIL.version, claims: PILL_DETAIL.claims, options: PILL_DETAIL.options, metrics: METRICS, outcomes: [] }),
  ),
  http.get("http://localhost:8000/api/audit", () => HttpResponse.json(AUDIT)),
  http.get("http://localhost:8000/api/audit/verify", () =>
    HttpResponse.json({ valid: true, entries: 20, brokenAtSeq: null }),
  ),
  http.get("http://localhost:8000/api/health", () =>
    HttpResponse.json({ status: "ok", seed: 20261002, llmEnabled: false }),
  ),
];

export const server = setupServer(...baseHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
