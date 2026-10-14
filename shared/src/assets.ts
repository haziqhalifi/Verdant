/**
 * Physical and commercial entities — shared wire types.
 *
 * `chillerPlant`, `assetType` and `tariffSgdPerKwh` are exactly the three fields
 * the FR-09 context check compares before a pill may transfer between sites.
 */

export const ASSET_TYPES = [
  "chiller_plant",
  "ahu",
  "cooling_tower",
  "vav_box",
  "tenant_zone",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export interface Site {
  id: string;
  name: string;
  city: string;
  tariffSgdPerKwh: number;
  gfaSqm: number;
}

export interface Asset {
  id: string;
  siteId: string;
  name: string;
  assetType: AssetType;
  chillerPlant: string | null;
  floor: number | null;
  zone: string | null;
  ratedKw: number | null;
}

export interface Tenant {
  id: string;
  siteId: string;
  name: string;
  floor: number;
  leaseComfortMinC: number;
  leaseComfortMaxC: number;
  leaseHours: string;
}
