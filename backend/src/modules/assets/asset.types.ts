/**
 * Physical and commercial entities: sites, assets, tenants.
 *
 * Wire types (`Site`, `Asset`, `Tenant`, `AssetType`, `ASSET_TYPES`) are shared
 * from `@verdant/shared`. The `isAssetType` type guard is backend-only.
 */

import { ASSET_TYPES } from "@verdant/shared";
import type { AssetType } from "@verdant/shared";

export { ASSET_TYPES } from "@verdant/shared";
export type { AssetType, Site, Asset, Tenant } from "@verdant/shared";

export function isAssetType(value: unknown): value is AssetType {
  return typeof value === "string" && (ASSET_TYPES as readonly string[]).includes(value);
}
