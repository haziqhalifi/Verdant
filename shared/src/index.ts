/**
 * @verdant/shared — the single source of truth for wire types.
 *
 * Both the backend and frontend import from here. If a type or constant is
 * needed on both sides of the HTTP boundary, it lives in this package.
 * Backend-only types (Actor, User, PipelineState, etc.) stay in the backend.
 */

export * from "./governance";
export * from "./assets";
export * from "./analytics";
export * from "./pills";
export * from "./cases";
export * from "./audit";
export * from "./system";
