/**
 * Axon — stable public question IDs (fatia 2 adotada).
 *
 * The law comes from the shared package @ironidesflj/axon (exact pin in
 * package.json + lockfile): RAN- is the canonical prefix; GLI- is an eternal
 * alias (valid in the `aliases` field, rejected in `id`); sequences are
 * per-exam and never recycled. This module declares the app's namespace and
 * points to the package API — scripts write IDs THROUGH the package
 * (generateId/validateId), never through local re-implementations.
 *
 * generateId is pure: the lastIssued counter belongs to the app — the
 * durable state is the id-registry (src/data/questions/id-registry.ts).
 * The package never emits IDs and never stores state.
 */
export { generateId, validateId, validateAliasId, aliasOf } from "@ironidesflj/axon";

/** Ranvier's public namespace prefix (hub registry: SYN, RAN, MYE, THA, ENG). */
export const APP_ID_PREFIX = "RAN" as const;
