/**
 * Axon — the Noos ecosystem contract, consumed from the npm package.
 *
 * Slice status (docs/sdd/fatias-dossie.md is the live state pointer):
 *  - fatia 1 (link): exact-pinned @ironidesflj/axon@0.2.1, lockfile committed.
 *  - fatia 2 (IDs na escrita): scripts generate/validate IDs through the
 *    package's generateId/validateId — rejections are logged with reason.
 *  - fatia 3 (checksum canônico): computeChecksum from the package — the
 *    LOCKED algorithm over [statement, options, answer, reference].
 *  - fatia 4 (manifesto no CI): parseManifest + verifyChecksum on every
 *    bank change, zero rejections tolerated for the publisher.
 *  - fatia 5 (badge + deep-link): URL format adopted (footer ID + community
 *    button + "by Noos" badge); canonical-domain flip pending env.
 *
 * The package is NEVER a service — always linked at build. Zero hub fetches
 * at runtime.
 */
export * from "@ironidesflj/axon";
export { APP_ID_PREFIX } from "./ids";
export * from "./deep-links";
