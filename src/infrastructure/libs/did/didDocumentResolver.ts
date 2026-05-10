/**
 * DID Document resolver — builds the user-facing DID Document served by
 * `/users/:userId/did.json` (§5.4) from the latest `UserDidAnchor` row in
 * the database.
 *
 * Key design points (§5.1.4 / §5.4.4):
 *   - §F: PENDING / SUBMITTED anchors return a Document immediately. The
 *     `proof.anchorStatus` field communicates trust level to the verifier;
 *     the resolver does NOT wait for chain confirmation before serving.
 *   - §E: A DEACTIVATE op as the latest record returns a Tombstone
 *     Document (`{ id, deactivated: true }`) with HTTP 200 — NOT 404.
 *     This lets verifiers distinguish "user existed and is gone" from
 *     "user never existed".
 *   - §C: DID operations live on chain directly (no Merkle wrapper) so
 *     `proof` references the op by `(anchorTxHash, opIndexInTx, docHash)`
 *     rather than a Merkle path.
 *   - §B: User DIDs do not carry verification material — the minimal
 *     Document is `{ "@context", id }` and `documentCbor` (when present)
 *     restores any extra metadata anchored to chain.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.4 (this resolver)
 *   docs/report/did-vc-internalization.md §5.4.4 (UserDidDocumentService)
 *   docs/report/did-vc-internalization.md §B / §C / §E / §F
 *   docs/report/did-vc-internalization.md §3.3   (CBOR-encoded DID Document)
 */

import { decode as cborDecode } from "cbor-x";
import { inject, injectable } from "tsyringe";
import type { AnchorStatus, ChainNetwork, DidOperation, UserDidAnchor } from "@prisma/client";
import logger from "@/infrastructure/logging";
import {
  buildDeactivatedDidDocument,
  buildMinimalDidDocument,
  buildUserDid,
  type DidDocument,
  type TombstoneDocument,
} from "@/infrastructure/libs/did/userDidBuilder";

// ---------------------------------------------------------------------------
// Prisma-backed type aliases
// ---------------------------------------------------------------------------

/**
 * Status values that can appear on a `UserDidAnchor` (`AnchorStatus` Prisma
 * enum: PENDING / SUBMITTED / CONFIRMED / FAILED).
 */
export type AnchorStatusValue = AnchorStatus;

/**
 * Operation values that can appear on a `UserDidAnchor` (`DidOperation`
 * Prisma enum: CREATE / UPDATE / DEACTIVATE).
 */
export type DidOperationValue = DidOperation;

/**
 * Network values supported by civicship anchoring (`ChainNetwork` Prisma
 * enum: CARDANO_MAINNET / CARDANO_PREPROD). The resolver picks the
 * explorer URL accordingly.
 */
export type AnchorNetworkValue = ChainNetwork;

/**
 * Row shape consumed by the resolver — alias of the `UserDidAnchor` Prisma
 * model so the production repository (`UserDidAnchorRepository`) can pass
 * raw `findFirst` results in without an adapter.
 */
export type UserDidAnchorRow = UserDidAnchor;

/**
 * Storage interface the resolver depends on. Kept narrow (one method) so
 * tests can supply a hand-rolled fake without touching Prisma. The real
 * implementation will land in the domain service PR alongside the DI
 * registration.
 */
export interface UserDidAnchorStore {
  /**
   * Return the most recently-created anchor for `userId`, regardless of
   * status (§F: PENDING is served too). Returns `null` when no anchor
   * exists for the user — the caller (HTTP layer) maps that to 404.
   */
  findLatestByUserId(userId: string): Promise<UserDidAnchorRow | null>;
}

// ---------------------------------------------------------------------------
// DID Document with proof (§5.4.4 return type)
// ---------------------------------------------------------------------------

/**
 * `proof` block attached to every Document returned by
 * `buildDidDocument`. The shape matches §5.4.4 `buildProof`.
 */
export interface DidDocumentProof {
  type: "DataIntegrityProof";
  cryptosuite: "civicship-merkle-anchor-2026";
  anchorChain: "cardano:mainnet" | "cardano:preprod";
  /** Chain tx hash, or `null` while the anchor is still PENDING (§F). */
  anchorTxHash: string | null;
  /** Index of the op inside the metadata ops array. `null` until anchored. */
  opIndexInTx: number | null;
  /** 32-byte doc hash as 64 hex chars. */
  docHash: string;
  anchorStatus: "pending" | "submitted" | "confirmed" | "failed";
  /** ISO-8601 confirmation timestamp; `null` until CONFIRMED. */
  anchoredAt: string | null;
  /** Cardano explorer URL for the tx, or `null` while PENDING. */
  verificationUrl: string | null;
}

export type DidDocumentWithProof =
  | (DidDocument & { proof: DidDocumentProof })
  | (TombstoneDocument & { proof: DidDocumentProof });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map Prisma `AnchorStatus` enum to the lowercase string used in `proof`. */
function toProofStatus(status: AnchorStatusValue): DidDocumentProof["anchorStatus"] {
  return status.toLowerCase() as DidDocumentProof["anchorStatus"];
}

/** Map `ChainNetwork` enum to the `did:cardano` scheme suffix used in `proof.anchorChain`. */
function toAnchorChain(network: AnchorNetworkValue): DidDocumentProof["anchorChain"] {
  return network === "CARDANO_MAINNET" ? "cardano:mainnet" : "cardano:preprod";
}

/**
 * Build a Cardano explorer URL for a given tx hash. Returns `null` when
 * `chainTxHash` is missing (PENDING). Uses cardanoscan.io for mainnet and
 * preprod.cardanoscan.io for preprod (see §5.4.4).
 */
function buildVerificationUrl(
  network: AnchorNetworkValue,
  chainTxHash: string | null,
): string | null {
  if (!chainTxHash) return null;
  const host = network === "CARDANO_MAINNET" ? "cardanoscan.io" : "preprod.cardanoscan.io";
  return `https://${host}/transaction/${chainTxHash}`;
}

/**
 * Decode the CBOR-encoded DID Document blob. Returns `null` when the blob
 * is missing (DEACTIVATE / Backfill) or unparseable — the caller falls
 * back to the minimal `{ @context, id }` document in those cases (§U).
 */
function decodeDocumentCbor(blob: Buffer | Uint8Array | null): Record<string, unknown> | null {
  if (!blob) return null;
  try {
    const decoded = cborDecode(toUint8Array(blob));
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      return decoded as Record<string, unknown>;
    }
    return null;
  } catch (err) {
    logger.warn("[DidDocumentResolver] failed to decode documentCbor", {
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function toUint8Array(buf: Buffer | Uint8Array): Uint8Array {
  if (buf instanceof Uint8Array) return buf;
  return new Uint8Array(buf);
}

/**
 * `@context` is the minimum signal that the decoded blob is a DID Document
 * (§B). Without it we can't safely treat the blob as a Document, so the
 * caller falls back to `buildMinimalDidDocument`.
 */
function isDidDocumentLike(decoded: Record<string, unknown> | null): boolean {
  return decoded !== null && "@context" in decoded;
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

/**
 * Builds a DID Document with anchor proof from the latest `UserDidAnchor`
 * row. See file header for the §F / §E / §C semantics.
 *
 * Note: this class is `@injectable()` but intentionally NOT registered in
 * `provider.ts` yet — that lands with the domain service PR (per the
 * Phase 1 step-4 task scope).
 */
@injectable()
export class DidDocumentResolver {
  constructor(@inject("UserDidAnchorStore") private readonly store: UserDidAnchorStore) {}

  /**
   * Build the DID Document for `userId`, or `null` if the user has no
   * anchor record at all. The HTTP layer maps `null` to 404 and any
   * returned document to 200 — including the §E Tombstone case.
   */
  async buildDidDocument(userId: string): Promise<DidDocumentWithProof | null> {
    const anchor = await this.store.findLatestByUserId(userId);
    if (!anchor) return null;

    // §E: DEACTIVATE → Tombstone Document
    if (anchor.operation === "DEACTIVATE") {
      const tombstone = buildDeactivatedDidDocument(userId);
      return { ...tombstone, proof: this.buildProof(anchor) };
    }

    // §B / §3.3: minimal Document, optionally rehydrated from the on-chain CBOR.
    // Require the decoded blob to carry `@context` — otherwise it is not a
    // DID-spec-conformant Document and we fall back to the minimal form so
    // that resolvers downstream never see a partially-formed Document.
    const decoded = decodeDocumentCbor(anchor.documentCbor);
    const baseDocument: DidDocument = isDidDocumentLike(decoded)
      ? (decoded as unknown as DidDocument)
      : buildMinimalDidDocument(userId);
    // Defensive: ensure the `id` matches the canonical did:web string for
    // this user even if the stored CBOR is corrupted or stale.
    const canonicalId = buildUserDid(userId);
    return {
      ...baseDocument,
      id: canonicalId,
      proof: this.buildProof(anchor),
    };
  }

  /**
   * §C / §5.4.4: Build the `proof` block referencing the on-chain op
   * directly (no Merkle path needed for DID operations).
   */
  private buildProof(anchor: UserDidAnchorRow): DidDocumentProof {
    return {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-merkle-anchor-2026",
      anchorChain: toAnchorChain(anchor.network),
      anchorTxHash: anchor.chainTxHash,
      opIndexInTx: anchor.chainOpIndex,
      docHash: anchor.documentHash,
      anchorStatus: toProofStatus(anchor.status),
      anchoredAt: anchor.confirmedAt ? anchor.confirmedAt.toISOString() : null,
      verificationUrl: buildVerificationUrl(anchor.network, anchor.chainTxHash),
    };
  }
}
