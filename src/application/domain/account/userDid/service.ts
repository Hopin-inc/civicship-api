/**
 * `UserDidService` — application-layer entry point for civicship's
 * internal User DID lifecycle (create / update / deactivate).
 *
 * Per design §5.2.1, each lifecycle event:
 *
 *   1. Computes the canonical did:web string for the user.
 *   2. Builds the minimal DID Document (or tombstone for DEACTIVATE).
 *   3. CBOR-encodes the Document.
 *   4. Hashes the CBOR bytes with Blake2b-256 → `documentHash` (32 B / 64 hex).
 *   5. Persists a `UserDidAnchor` row in PENDING status.
 *
 * Step 5's row is picked up later by the weekly anchor batch (§5.3.1),
 * which is the responsibility of a different service (Phase 1 step 9). This
 * service intentionally does NOT touch Cardano — by keeping anchoring out
 * of the request path, DID create / update / deactivate stays fast and
 * independent of chain availability.
 *
 * §B compliance: User DIDs do not carry verification material. The service
 * never generates user keypairs.
 *
 * §F compliance: anchors are persisted as PENDING and the resolver serves
 * them immediately — confirmation on chain happens out-of-band.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The repository is a stub (see `data/repository.ts`) until schema PR
 * #1094 lands. The service is fully functional today: callers exercising
 * `createDidForUser` will get back a valid `did` / `documentHash` /
 * `documentCbor` triple — only the persistence call throws. Tests inject a
 * `useValue` mock to verify the upstream pipeline.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §3.3   (CBOR-encoded DID Document)
 *   docs/report/did-vc-internalization.md §5.2.1 (this service)
 *   docs/report/did-vc-internalization.md §B / §E / §F
 */

import { blake2b } from "@noble/hashes/blake2b";
import { encode as cborEncode } from "cbor-x";
import { bytesToHex } from "@noble/hashes/utils";
import { inject, injectable } from "tsyringe";
import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import type { IUserDidAnchorRepository } from "@/application/domain/account/userDid/data/interface";
import type {
  AnchorNetworkValue,
  UserDidAnchorRow,
} from "@/application/domain/account/userDid/data/type";
import {
  buildDeactivatedDidDocument,
  buildMinimalDidDocument,
  buildUserDid,
  type DidDocument,
  type TombstoneDocument,
} from "@/infrastructure/libs/did/userDidBuilder";

/** Output length of `documentHash`, in bytes (Blake2b-256 → 32 B). */
const DOCUMENT_HASH_BYTES = 32;

/**
 * Default chain network for new anchors. The design only ships
 * `CARDANO_MAINNET` and `CARDANO_PREPROD` (§4.1 ChainNetwork) — production
 * defaults to mainnet, callers in dev / preview environments must pass
 * `CARDANO_PREPROD` explicitly.
 */
const DEFAULT_NETWORK: AnchorNetworkValue = "CARDANO_MAINNET";

/**
 * CBOR-encode a DID Document and return both the bytes and the
 * Blake2b-256 hex digest. Pulled out as a helper so create / update share
 * one canonical encode path — drift between the two would silently break
 * verifiers.
 */
function encodeAndHash(document: DidDocument | TombstoneDocument): {
  cbor: Uint8Array;
  hashHex: string;
} {
  const cbor = cborEncode(document);
  // `cborEncode` returns a Buffer in Node; normalize to Uint8Array so the
  // shape matches what the resolver and chain layer consume (§3.3).
  const cborBytes = cbor instanceof Uint8Array ? cbor : new Uint8Array(cbor);
  const digest = blake2b(cborBytes, { dkLen: DOCUMENT_HASH_BYTES });
  return { cbor: cborBytes, hashHex: bytesToHex(digest) };
}

@injectable()
export default class UserDidService {
  constructor(
    @inject("UserDidAnchorRepository")
    private readonly repository: IUserDidAnchorRepository,
  ) {}

  /**
   * §5.2.1: enqueue a CREATE-op `UserDidAnchor` for `userId`.
   *
   * Returns the persisted row so the caller (UseCase) can pass it through
   * its presenter. The row is PENDING — it becomes SUBMITTED / CONFIRMED
   * later via the weekly anchor batch.
   *
   * `tx` follows the project-wide branching pattern: when supplied, the
   * write happens inside the caller's transaction; when omitted, the
   * repository establishes its own issuer-scoped transaction.
   */
  async createDidForUser(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
    network: AnchorNetworkValue = DEFAULT_NETWORK,
  ): Promise<UserDidAnchorRow> {
    const did = buildUserDid(userId);
    const document = buildMinimalDidDocument(userId);
    const { cbor, hashHex } = encodeAndHash(document);

    logger.debug("[UserDidService] createDidForUser", {
      userId,
      did,
      documentHash: hashHex,
      network,
    });

    return this.repository.createCreate(
      ctx,
      {
        userId,
        did,
        documentHash: hashHex,
        documentCbor: cbor,
        network,
      },
      tx,
    );
  }

  /**
   * §5.2.1: enqueue an UPDATE-op `UserDidAnchor` for `userId`.
   *
   * Phase 1 only re-anchors the minimal document shape (§B — User DIDs
   * have no verification material). When VPs from users land in a future
   * phase (§10.1.3), this method grows a `nextDocument` argument so callers
   * can pass an extended Document.
   */
  async updateDid(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
    network: AnchorNetworkValue = DEFAULT_NETWORK,
  ): Promise<UserDidAnchorRow> {
    const did = buildUserDid(userId);
    const document = buildMinimalDidDocument(userId);
    const { cbor, hashHex } = encodeAndHash(document);

    logger.debug("[UserDidService] updateDid", {
      userId,
      did,
      documentHash: hashHex,
      network,
    });

    return this.repository.createUpdate(
      ctx,
      {
        userId,
        did,
        documentHash: hashHex,
        documentCbor: cbor,
        network,
      },
      tx,
    );
  }

  /**
   * §5.2.1 + §E: enqueue a DEACTIVATE-op `UserDidAnchor` for `userId`.
   *
   * The on-chain row's `documentCbor` is intentionally null (the resolver
   * reconstructs the tombstone via `buildDeactivatedDidDocument` rather
   * than pulling from CBOR — see `didDocumentResolver.ts`), but the
   * `documentHash` still references the canonical tombstone Document so
   * verifiers can reproduce it.
   */
  async deactivateDid(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
    network: AnchorNetworkValue = DEFAULT_NETWORK,
  ): Promise<UserDidAnchorRow> {
    const did = buildUserDid(userId);
    const tombstone = buildDeactivatedDidDocument(userId);
    const { hashHex } = encodeAndHash(tombstone);

    logger.debug("[UserDidService] deactivateDid", {
      userId,
      did,
      documentHash: hashHex,
      network,
    });

    return this.repository.createDeactivate(
      ctx,
      {
        userId,
        did,
        documentHash: hashHex,
        network,
      },
      tx,
    );
  }
}
