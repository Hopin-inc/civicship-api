/**
 * Prisma-backed repository for `UserDidAnchor`.
 *
 * Implements both `IUserDidAnchorRepository` (consumed by `UserDidService`)
 * and the narrower `UserDidAnchorStore` (consumed by `DidDocumentResolver`)
 * — `IUserDidAnchorRepository` extends `UserDidAnchorStore`, so a single
 * class can satisfy both DI keys (`UserDidAnchorRepository` and
 * `UserDidAnchorStore`).
 *
 * Persistence rules (§5.2.1):
 *   - All anchors are inserted in `PENDING` status. The weekly anchor batch
 *     (Phase 1 step 9) flips them to `SUBMITTED` / `CONFIRMED`.
 *   - `metadataLabel` defaults to 1985 in the schema; we leave it implicit.
 *   - DEACTIVATE rows persist `documentCbor = null` (§E — tombstones are
 *     reconstructed by the resolver, not pulled from CBOR).
 *
 * Transaction handling follows the project-wide pattern (CLAUDE.md
 * "Transaction Handling Pattern"): when `tx` is supplied, the write happens
 * inside that transaction; otherwise we open an issuer-scoped public
 * transaction.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (UserDidAnchor schema)
 *   docs/report/did-vc-internalization.md §5.2.1 (UserDidService flow)
 *   docs/report/did-vc-internalization.md §5.1.4 (DidDocumentResolver storage)
 */

import { container, injectable } from "tsyringe";
import { DidOperation, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import type { IUserDidAnchorRepository } from "@/application/domain/account/userDid/data/interface";
import type {
  CreateUserDidAnchorInput,
  DeactivateUserDidAnchorInput,
  UpdateUserDidAnchorInput,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";

@injectable()
export default class UserDidAnchorRepository implements IUserDidAnchorRepository {
  private getIssuer(): PrismaClientIssuer {
    return container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  }

  /**
   * Return the most recently-created anchor for `userId`, regardless of
   * status (PENDING included per §F). Returns `null` when no row exists.
   *
   * Used by both `DidDocumentResolver` (HTTP `/users/:userId/did.json`) and
   * `UserDidService` (next-version chaining decisions in future phases).
   */
  async findLatestByUserId(userId: string): Promise<UserDidAnchorRow | null> {
    const issuer = this.getIssuer();
    // The resolver invokes this without a request-scoped IContext (the
    // `did:web` route is unauthenticated per §5.4), so we build a minimal
    // public-only context. `PrismaClientIssuer.public` ignores fields it
    // does not need; the `issuer` field is the only thing it inspects.
    const ctx = { issuer } as unknown as IContext;
    return issuer.public(ctx, (tx) => {
      return tx.userDidAnchor.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  async createCreate(
    ctx: IContext,
    input: CreateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    const data = this.buildCreateData(input, DidOperation.CREATE, input.documentCbor);
    if (tx) {
      return tx.userDidAnchor.create({ data });
    }
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (innerTx) => innerTx.userDidAnchor.create({ data }));
  }

  async createUpdate(
    ctx: IContext,
    input: UpdateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    const data = this.buildCreateData(input, DidOperation.UPDATE, input.documentCbor);
    if (tx) {
      return tx.userDidAnchor.create({ data });
    }
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (innerTx) => innerTx.userDidAnchor.create({ data }));
  }

  async createDeactivate(
    ctx: IContext,
    input: DeactivateUserDidAnchorInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserDidAnchorRow> {
    // §E: DEACTIVATE rows persist `documentCbor = null` because the
    // tombstone document is fully reconstructed by the resolver from the
    // canonical did:web string.
    const data = this.buildCreateData(input, DidOperation.DEACTIVATE, null);
    if (tx) {
      return tx.userDidAnchor.create({ data });
    }
    const issuer = ctx.issuer || this.getIssuer();
    return issuer.public(ctx, (innerTx) => innerTx.userDidAnchor.create({ data }));
  }

  /**
   * Build the `Prisma.UserDidAnchorCreateInput` shared by all three
   * lifecycle entry points. Centralises the user-relation wiring and the
   * default-network fallback so create / update / deactivate cannot drift.
   */
  private buildCreateData(
    input: CreateUserDidAnchorInput | UpdateUserDidAnchorInput | DeactivateUserDidAnchorInput,
    operation: DidOperation,
    documentCbor: Uint8Array | null,
  ): Prisma.UserDidAnchorCreateInput {
    const data: Prisma.UserDidAnchorCreateInput = {
      did: input.did,
      operation,
      documentHash: input.documentHash,
      documentCbor: documentCbor ?? undefined,
      network: input.network ?? "CARDANO_MAINNET",
      user: { connect: { id: input.userId } },
    };
    return data;
  }
}
