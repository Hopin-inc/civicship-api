/**
 * Stub repository for `IssuerDidKey` (Strategy A, Phase 1 step 8).
 *
 * The Prisma model `IssuerDidKey` (`t_issuer_did_keys`) has NOT yet been
 * added to `schema.prisma` — the schema migration scope (#1094) shipped
 * `UserDidAnchor`, `VcAnchor`, `TransactionAnchor`, and
 * `StatusListCredential`, but the Issuer DID key registry was deferred
 * pending §G (key rotation) tooling design.
 *
 * Until the schema PR adds the table, the repository implementation
 * returns:
 *
 *   - `findActiveKey()` → `null` (no row at all)
 *   - `listActiveKeys()` → `[]`  (no rows at all)
 *
 * This is intentionally identical to "freshly-deployed bootstrap state":
 * `IssuerDidService` and the `/.well-known/did.json` route both treat a
 * `null` active key as the trigger to fall back to a minimal static
 * Document, which preserves dev/staging UX (clients still get a 200 with
 * a syntactically-valid `did:web` Document body).
 *
 * Once the schema PR merges, the swap is mechanical:
 *
 *   1. Replace the bodies with `tx.issuerDidKey.findFirst({ where: { deactivatedAt: null } })`
 *      and `tx.issuerDidKey.findMany({ where: { ... }, orderBy: { activatedAt: "asc" } })`.
 *   2. Use `ctx.issuer.public(ctx, tx => ...)` for RLS — the Issuer DID
 *      table is platform-global so `public` is appropriate (no community
 *      scope).
 *   3. Delete `IssuerDidKeyRepositoryNotImplementedError` (kept for
 *      consistency with the other Phase 1 stub repositories).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §G    (key rotation overlap)
 *   src/application/domain/account/userDid/data/repository.ts (sibling stub)
 */

import { injectable } from "tsyringe";

import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";

/**
 * Marker error for future write methods (`activateKeyVersion`,
 * `deactivateKeyVersion`) that intentionally do not exist yet. Mirrors
 * `UserDidAnchorRepositoryNotImplementedError` so a single grep finds
 * every Phase 1 stub site.
 *
 * Kept exported so an admin runbook script that probes for write support
 * can `instanceof`-check the error and produce a clear "feature not yet
 * shipped" message rather than a generic 500.
 */
export class IssuerDidKeyRepositoryNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `IssuerDidKeyRepositoryStub.${method}: not implemented yet — depends on ` +
        "schema PR adding t_issuer_did_keys. Replace stub with the production " +
        "Prisma-backed repository when that table lands (Phase 1 step 8+).",
    );
    this.name = "IssuerDidKeyRepositoryNotImplementedError";
  }
}

@injectable()
export default class IssuerDidKeyRepositoryStub implements IIssuerDidKeyRepository {
  // Returning `null` is the *correct* bootstrap signal — see file-header
  // comment. `IssuerDidService.getActiveIssuerDidDocument()` propagates
  // null upward and the router maps it to the minimal static Document.
  async findActiveKey(): Promise<IssuerDidKeyRow | null> {
    return null;
  }

  // Returning `[]` matches the empty-table state. Callers building a
  // DID Document `verificationMethod[]` array will see no keys and fall
  // back to the minimal static Document via the same null-check path.
  async listActiveKeys(): Promise<IssuerDidKeyRow[]> {
    return [];
  }
}
