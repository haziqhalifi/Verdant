/**
 * Roles and permissions — shared wire types.
 *
 * The wire contract is the `Role` string union and the `RoleInfo` shape that
 * `GET /api/roles` returns. Permission enforcement lives in the backend only;
 * the frontend uses the permission list to hide what a role cannot do.
 */

export const ROLES = [
  "aom",
  "chief_engineer",
  "pill_reviewer",
  "site_operator",
  "governance_admin",
] as const;
export type Role = (typeof ROLES)[number];

export interface RoleInfo {
  role: Role;
  label: string;
  description: { can: string; cannot: string };
  permissions: string[];
}
