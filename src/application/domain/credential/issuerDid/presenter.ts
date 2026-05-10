/**
 * `IssuerDidPresenter` — pure transform from internal types to the wire
 * shape served at `/.well-known/did.json`.
 *
 * Today the wire shape *is* the internal type (`IssuerDidDocument` is
 * already the W3C JSON-LD form built by `IssuerDidBuilder`). The presenter
 * therefore looks like an identity function — but it exists so that:
 *
 *   1. The architectural pattern (UseCase always invokes a presenter
 *      before returning) holds uniformly across domains.
 *   2. Future per-route adjustments (e.g. stripping a `@deactivated` field
 *      we add for admin GraphQL but should not appear on the public route)
 *      have a stable injection point that doesn't churn the use case.
 *   3. Tests can import the presenter alone to assert the wire contract
 *      without the service / KMS layers.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.2 (DID Document shape)
 *   CLAUDE.md "Layer Responsibilities" (Presenter — pure functions only)
 */

import type { IssuerDidDocument } from "@/infrastructure/libs/did/issuerDidBuilder";

const IssuerDidPresenter = {
  /**
   * Identity transform. Re-emits the same object reference; callers that
   * mutate the response would corrupt the cached builder output, so we
   * deliberately do NOT clone. The DID Document is logically immutable
   * once built (single-shot read), and `IssuerDidBuilder` returns a fresh
   * object on every call.
   *
   * **Immutability contract**: the value returned by this presenter MUST
   * be treated as read-only by callers. Mutating it (in-place edits to
   * `verificationMethod`, `@context`, etc.) would corrupt downstream
   * serialisation, leak request-scoped data into other callers if a
   * future Phase 2 change adds caching of the built Document, and break
   * the §5.1.2 wire-shape contract verifiers depend on. The Express
   * handler at `src/presentation/router/did.ts` only `res.json()`s the
   * value — it never mutates — and any new caller added here must follow
   * the same discipline. We do not call `Object.freeze` because (a) the
   * cost of a deep freeze on every request is wasteful when the only
   * caller today is read-only, and (b) `Object.freeze` is shallow, which
   * would give a false sense of safety against the realistic risk
   * (mutations of nested arrays like `verificationMethod`). If a future
   * Phase 2 change introduces a Document cache, prefer building a fresh
   * object per request rather than retroactively freezing.
   */
  toDocumentResponse(document: IssuerDidDocument): IssuerDidDocument {
    return document;
  },
};

export default IssuerDidPresenter;
