/**
 * Request -> actor resolution.
 *
 * The demo has no password flow. The caller identifies itself with a header:
 *   x-verdant-user: user-reviewer     (preferred -- names a seeded person)
 *   x-verdant-role: pill_reviewer     (switches hat to that role's seeded person)
 *
 * With no header the fallback is an anonymous Site Operator -- the least-privileged
 * role that can still read pills and cases. It cannot capture, review, rollback,
 * export, or manage seeds, so unauthenticated requests cannot mutate the library
 * or governance state. Access control itself is never decided here -- every
 * service calls `assertCan`, so an unrecognised role is still denied.
 */

import type { Request } from "express";
import { demoActor, toActor } from "@/modules/governance/actor";
import type { Actor } from "@/modules/governance/actor";
import { isRole } from "@/modules/governance/roles";
import { db } from "@/shared/store";

export const ROLE_HEADER = "x-verdant-role";
export const USER_HEADER = "x-verdant-user";

function header(req: Request, name: string): string | null {
  const raw = req.header(name);
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
}

export function resolveActor(req: Request): Actor {
  const userId = header(req, USER_HEADER);
  if (userId !== null) {
    const user = db().users.find((candidate) => candidate.id === userId);
    if (user !== undefined) return toActor(user);
  }

  const role = header(req, ROLE_HEADER);
  if (role !== null && isRole(role)) {
    const user = db().users.find((candidate) => candidate.role === role);
    if (user !== undefined) return toActor(user);
    return demoActor(role);
  }

  return demoActor("site_operator");
}
