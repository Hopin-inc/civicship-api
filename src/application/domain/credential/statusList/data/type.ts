/**
 * Local type declarations for the `credential/statusList` application
 * domain (§D — W3C Bitstring Status List 2021).
 *
 * The `StatusListCredential` Prisma model lands in schema PR #1094 (already
 * merged into the parent `claude/did-vc-internalization-review-eptzS`).
 * The repository wraps that model directly — these types intentionally
 * mirror the column set so unit tests don't need to import Prisma's
 * generated `StatusListCredential` for shape assertions.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §4.1   (StatusListCredential schema)
 *   docs/report/did-vc-internalization.md §5.2.4 (Application service shape)
 *   docs/report/did-vc-internalization.md §7     (Revocation lifecycle)
 *   docs/report/did-vc-internalization.md §D     (BitstringStatusList spec)
 */

/**
 * Row shape mirroring `StatusListCredential` from the generated Prisma
 * client. Kept local so the service / tests do not transitively pull in the
 * full Prisma surface.
 *
 * Field naming matches the Prisma model 1-to-1 — the repository relies on
 * Prisma's camelCase ↔ snake_case mapping (`@map` annotations in the
 * schema) and produces these objects unchanged.
 */
export interface StatusListCredentialRow {
  id: string;
  /** Public-facing identifier used in the HTTPS path. Examples: "1", "2". */
  listKey: string;
  /** GZIP-compressed raw bitstring. Decompress to obtain the bit array. */
  encodedList: Uint8Array;
  /** This list's own VC, signed by the issuer. Re-signed on every revoke. */
  vcJwt: string;
  /** Next free bit index. Equal to the count of issued slots. */
  nextIndex: number;
  /** Maximum number of bits this list holds. Default per schema: 131072. */
  capacity: number;
  /**
   * Once true, no further slots are allocated from this list, but
   * revocation bits still flip and the JWT still re-signs (§7.3 — past VC
   * verifiers must keep resolving the URL forever).
   */
  frozen: boolean;
  updatedVersion: number;
  lastIssuedAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Result of `StatusListService.allocateNextSlot`. Mirrors the design's
 * `statusEntry` literal in §5.2.2 (with field names normalized for TS).
 *
 * `statusListCredentialUrl` is the absolute URL the verifier resolves to
 * fetch the bitstring — embedded into the issued VC's `credentialStatus`
 * (§D / §7.2).
 */
export interface AllocatedSlot {
  /** Primary key (cuid) of the `StatusListCredential` row. */
  statusListId: string;
  /** Public listKey of the row (used in the URL path). */
  listKey: string;
  /** 0-indexed bit position within the bitstring. */
  statusListIndex: number;
  /** Absolute, public-facing URL that verifiers fetch. */
  statusListCredentialUrl: string;
}

/** Inputs to `StatusListUseCase.revokeVc`. */
export interface RevokeVcInput {
  vcRequestId: string;
  /** Optional human-readable reason persisted on the VC row. */
  reason?: string;
}
