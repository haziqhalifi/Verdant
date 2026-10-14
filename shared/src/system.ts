/**
 * System health and seed status — shared wire types.
 */

export interface Health {
  status: string;
  env: string;
  seed: number;
  llmEnabled: boolean;
}

export interface SeedStatus {
  seeded: boolean;
  seed: number;
  llmEnabled: boolean;
  counts: {
    sites: number;
    assets: number;
    tenants: number;
    users: number;
    readings: number;
    pills: number;
    cases: number;
    outcomes: number;
    auditEntries: number;
  };
}
