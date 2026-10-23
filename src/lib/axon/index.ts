/**
 * Axon — Fase 1 slice: ID generator, question schema, deep-link helper.
 *
 * The Axon is the Noos ecosystem's shared TypeScript package (semver'd library
 * linked at build time — never a service). This in-repo module is the minimal
 * F1 adoption, structured so it can be extracted verbatim into the shared
 * package when it exists. No runtime dependency on the hub — ever.
 */

export const AXON_PACKAGE = "axon";
export const AXON_VERSION = "0.1.0"; // semver — Fase 1 slice

export * from "./ids";
export * from "./deep-links";
export * from "./schema";
