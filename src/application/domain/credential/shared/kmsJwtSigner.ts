/**
 * `KmsJwtSigner` — Phase 2 KMS-backed `JwtSigner` implementation.
 *
 * Replaces the Phase 1 `StubJwtSigner` (deterministic `STUB_SIGNATURE`
 * marker) with a real EdDSA / Ed25519 signature produced via Cloud KMS
 * `asymmetricSign`. Plugged into `VcJwtSigner` and `StatusListJwtSigner`
 * DI tokens in `provider.ts`.
 *
 * Active key resolution
 * ---------------------
 * The class snapshots `{kid, kmsKeyResourceName}` from the `t_issuer_did_keys`
 * row whose `deactivatedAt IS NULL` (the §G "currently signing" key) and
 * refreshes the snapshot lazily on a TTL. The snapshot powers:
 *
 *   - synchronous `kid` reads at JWT-build time (services read
 *     `signer.alg` / `signer.kid` BEFORE awaiting `signer.sign()`).
 *   - the `sign()` body's KMS resource argument so we never sign with
 *     a stale key after a rotation.
 *
 * The TTL is short (5 min) so an operator-initiated `t_issuer_did_keys`
 * rotation is picked up by the next signing operation. Live rotation
 * is rare; spending a few minutes on the previous key is acceptable per
 * §G overlap (previous key remains a valid `verificationMethod`).
 *
 * Why not bypass the DB and read the active key from env / runtime config?
 *   - `t_issuer_did_keys` is the single source of truth (§5.4.3). Reading
 *     env risks divergence with the DID Document the same row publishes.
 *
 * Boundary discipline
 * -------------------
 *   - No JWT encoding / canonicalisation — the consumer service already
 *     produces the `header.payload` signing input.
 *   - No DID Document building — that lives in `IssuerDidService` and
 *     `issuerDidBuilder`. We only borrow `kmsResourceNameToKid` for the
 *     kid suffix.
 *   - No retry policy on top of `KmsSigner.signEd25519` — the underlying
 *     `KmsSigner` already does exponential backoff for transient KMS
 *     failures (gRPC UNAVAILABLE etc.).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §16    (Phase 2 carryover)
 *   docs/report/did-vc-internalization.md §5.1.1 (KMS resource naming)
 *   docs/report/did-vc-internalization.md §5.2.2 (VC issuance)
 *   docs/report/did-vc-internalization.md §5.2.4 (StatusList service)
 *   docs/report/did-vc-internalization.md §5.4.3 (Issuer DID + KMS signing)
 *   docs/report/did-vc-internalization.md §G     (key rotation overlap)
 */

import { inject, injectable } from "tsyringe";

import type { JwtSigner } from "@/application/domain/credential/shared/jwtSigner";
import { CIVICSHIP_ISSUER_DID } from "@/application/domain/credential/shared/constants";
import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import { kmsResourceNameToKid } from "@/infrastructure/libs/did/issuerDidBuilder";
import { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";
import logger from "@/infrastructure/logging";

interface ActiveKeySnapshot {
  /** `${CIVICSHIP_ISSUER_DID}#key-N` */
  kid: string;
  /** Full KMS resource path (including `cryptoKeyVersions/N`). */
  kmsKeyResourceName: string;
  /** `Date.now()` when this snapshot was taken. */
  refreshedAt: number;
}

/**
 * Returned by `Date.now`-equivalent providers. Lets tests inject a fixed
 * clock so TTL boundaries can be exercised without `jest.useFakeTimers()`.
 */
export type ClockFn = () => number;

@injectable()
export class KmsJwtSigner implements JwtSigner {
  /**
   * The KMS key is Ed25519 (§5.1.1), and the JWS algorithm for raw
   * Ed25519 signatures is `EdDSA` per RFC 8037. Hardcoded rather than
   * read from KMS metadata because civicship has exactly one signing
   * algorithm — a future ES256K migration would be a deliberate
   * design-change PR, not a runtime config swap.
   */
  readonly alg = "EdDSA";

  /** Snapshot TTL — short enough that key rotation propagates within minutes. */
  static readonly SNAPSHOT_TTL_MS = 5 * 60 * 1000;

  private snapshot: ActiveKeySnapshot | null = null;

  constructor(
    @inject("IssuerDidKeyRepository")
    private readonly repository: IIssuerDidKeyRepository,
    @inject("KmsSigner")
    private readonly kms: KmsSigner,
    @inject("IssuerDidClock")
    private readonly now: ClockFn,
  ) {}

  /**
   * `kid` is a sync property by the `JwtSigner` contract. We require
   * `prepare()` to have been awaited at least once before the consumer
   * reads this — accessing it eagerly fails loudly rather than stamping
   * a JWT with `undefined`.
   */
  get kid(): string {
    if (this.snapshot === null) {
      throw new Error(
        "KmsJwtSigner.kid: prepare() must be awaited before reading. " +
          "Consumers in vcIssuance / statusList already do this; if you see " +
          "this error from a new call site, add `await signer.prepare()` " +
          "before building the JWT header.",
      );
    }
    return this.snapshot.kid;
  }

  /**
   * Refresh the active-key snapshot if it is missing or older than the
   * TTL. Cheap when the snapshot is fresh — does NOT round-trip the DB
   * or KMS within the TTL window.
   *
   * Throws when `t_issuer_did_keys` has no active row. There is no safe
   * fallback for signing without an active key (an unsigned VC is a
   * security incident, and a stub-signed VC misleads downstream
   * verifiers about what we have authorised). Operators must register
   * an active key before enabling the KMS signer path — see
   * `docs/runbooks/issuer-did-key-rotation.md` (ships separately) /
   * design §5.4.3 / §G.
   */
  async prepare(): Promise<void> {
    if (this.snapshot !== null && this.now() - this.snapshot.refreshedAt < KmsJwtSigner.SNAPSHOT_TTL_MS) {
      return;
    }
    const activeKey = await this.repository.findActiveKey();
    if (activeKey === null) {
      throw new Error(
        "KmsJwtSigner.prepare: no active issuer key registered in " +
          "`t_issuer_did_keys`. Provision the first key version before " +
          "wiring the KMS signer path. See design §5.4.3 / §G.",
      );
    }
    const next: ActiveKeySnapshot = {
      kid: `${CIVICSHIP_ISSUER_DID}#${kmsResourceNameToKid(activeKey.kmsKeyResourceName)}`,
      kmsKeyResourceName: activeKey.kmsKeyResourceName,
      refreshedAt: this.now(),
    };
    if (this.snapshot === null || this.snapshot.kmsKeyResourceName !== next.kmsKeyResourceName) {
      logger.info("[KmsJwtSigner] active key snapshot refreshed", {
        kid: next.kid,
        previousKid: this.snapshot?.kid,
      });
    }
    this.snapshot = next;
  }

  /**
   * Sign `signingInput` with the snapshot's KMS key and return the
   * base64url-encoded 64-byte Ed25519 signature.
   *
   * `await prepare()` is called at the head to guarantee a fresh
   * snapshot — callers that build the JWT header from `kid` / `alg`
   * already invoked `prepare()` once before encoding the header; the
   * second call here is a TTL no-op so it costs nothing on the
   * happy path while protecting any direct `sign()`-only callers.
   */
  async sign(signingInput: string): Promise<string> {
    await this.prepare();
    if (this.snapshot === null) {
      // Should be unreachable — prepare() either set the snapshot or threw.
      throw new Error("KmsJwtSigner.sign: snapshot missing after prepare(); invariant violated.");
    }
    const payload = new TextEncoder().encode(signingInput);
    const sigBytes = await this.kms.signEd25519(this.snapshot.kmsKeyResourceName, payload);
    return Buffer.from(sigBytes).toString("base64url");
  }
}
