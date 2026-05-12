/**
 * Prisma-backed repository for `IssuerDidKey` (§5.4.3 / §G).
 *
 * Replaces the Phase 1.5 Strategy A stub: the schema migration
 * `20260512060000_add_issuer_did_keys` shipped the `t_issuer_did_keys`
 * table, so `findActiveKey()` / `listActiveKeys()` can now resolve real
 * rows. Empty-table behaviour is unchanged from the stub — both methods
 * still degrade gracefully (null / []) so the router's "minimal static
 * Document" bootstrap fallback continues to work on a freshly-deployed
 * environment where no key has been registered yet.
 *
 * RLS / transaction discipline:
 *
 *   The `IssuerDidKey` table is **platform-global** — there is exactly one
 *   Issuer DID for civicship and the keys belong to the API host, not to
 *   any community or user. There is no per-row scope to enforce via
 *   `ctx.issuer.public(...)`. Reads therefore go through `prismaClient`
 *   directly. This mirrors how `IIssuerDidKeyRepository` declares its
 *   methods without `ctx` / `tx` parameters — the surface area
 *   intentionally hides RLS plumbing the table doesn't need.
 *
 *   Write methods (`activateKeyVersion`, `deactivateKeyVersion`) are NOT
 *   shipped in this PR; they belong to the §G rotation runbook tooling
 *   and will be added when the admin-side rotation flow lands. Operators
 *   bootstrap the first row directly via SQL / Prisma Studio for now —
 *   the same as how `StatusListCredential` was bootstrapped pre-runbook.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §G    (key rotation overlap)
 *   docs/report/did-vc-internalization.md §9.1.2 (24h overlap)
 *   docs/report/did-vc-internalization.md §9.1.3 (DISABLED 永続保持)
 */

import { injectable } from "tsyringe";

import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";
import { prismaClient } from "@/infrastructure/prisma/client";
import type { IssuerDidKey as PrismaIssuerDidKey } from "@prisma/client";

/**
 * Map the Prisma row shape to the domain `IssuerDidKeyRow`. The fields
 * are 1:1 today — kept as a centralised converter so future schema
 * additions (e.g. `purpose`, `algorithm`) can be filtered out here
 * without leaking into the application layer.
 */
function toRow(record: PrismaIssuerDidKey): IssuerDidKeyRow {
  return {
    id: record.id,
    kmsKeyResourceName: record.kmsKeyResourceName,
    activatedAt: record.activatedAt,
    deactivatedAt: record.deactivatedAt,
  };
}

@injectable()
export default class IssuerDidKeyRepository implements IIssuerDidKeyRepository {
  /**
   * Return the row representing the **single currently-active** key.
   *
   *   WHERE deactivated_at IS NULL
   *   ORDER BY activated_at DESC
   *   LIMIT 1
   *
   * If the table is empty OR every row is DISABLED (no ENABLED key at
   * the moment, e.g. mid-rotation gap), returns `null`. The service
   * layer propagates null upward and `signWithActiveKey` throws —
   * which is the right behaviour: signing without an active key would
   * silently emit unverifiable VCs.
   *
   * Ordering by `activated_at DESC` (not `created_at`) so a backfilled
   * row whose activation time predates an existing key still gets the
   * "most recently activated" semantics right.
   */
  async findActiveKey(): Promise<IssuerDidKeyRow | null> {
    const record = await prismaClient.issuerDidKey.findFirst({
      where: { deactivatedAt: null },
      orderBy: { activatedAt: "desc" },
    });
    return record ? toRow(record) : null;
  }

  /**
   * Return every row, ordered by `activated_at ASC`.
   *
   * §G overlap window = ENABLED rows + every DISABLED row (§9.1.3 —
   * DISABLED is retained forever for past-VC verification). Pruning a
   * DISABLED row would invalidate VCs signed against it, so the
   * "overlap window" is effectively "all history". This keeps the
   * verificationMethod array stable: row ordering is pinned to
   * activation time, which matches the spec's §5.4.3 line 1131-1142
   * sample (older key first, newest last).
   *
   * Returns `[]` (not null) on empty table so callers building a DID
   * Document `verificationMethod[]` array see the same bootstrap signal
   * as `findActiveKey() === null` and fall back to the minimal static
   * Document via the router.
   */
  async listActiveKeys(): Promise<IssuerDidKeyRow[]> {
    const records = await prismaClient.issuerDidKey.findMany({
      orderBy: { activatedAt: "asc" },
    });
    return records.map(toRow);
  }
}
