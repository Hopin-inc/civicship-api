/**
 * `IssuerDidUseCase` — orchestration entry point for the Issuer DID flows.
 *
 * Phase 1 step 8 shipped exactly one flow: serving the
 * `/.well-known/did.json` body via `getActiveIssuerDidDocument()`
 * (single-key Multikey shape). The route handler
 * (`presentation/router/did.ts`) historically reached straight into
 * `IssuerDidService`, which works but places presentation-layer code one
 * architectural step too close to the service. The use case wraps the
 * service so that:
 *
 *   - future GraphQL admin queries (e.g. `issuerDidDocument` in the admin
 *     panel) can reuse exactly the same orchestration layer;
 *   - the presenter (below) is invoked uniformly regardless of caller.
 *
 * Phase 2 (PR #1124) adds `buildDidDocument()` — the §G overlap multi-key
 * shape per spec §5.4.3 line 1131-1142. The router now consumes this
 * method; the legacy `getActiveIssuerDidDocument()` is preserved for
 * backward compatibility (admin GraphQL Phase 1 contract, ad-hoc tooling).
 *
 * The use case does NOT manage transactions — `findActiveKey()` /
 * `listActiveKeys()` are single reads with no community scope, so opening
 * a transaction would add latency without correctness benefit.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.1 (router contract)
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §9.1.2 (24h overlap rotation)
 *   CLAUDE.md "Layer Responsibilities" (UseCase ↔ Service ↔ Repository)
 */

import { inject, injectable } from "tsyringe";

import IssuerDidService from "@/application/domain/credential/issuerDid/service";
import IssuerDidPresenter from "@/application/domain/credential/issuerDid/presenter";
import type {
  IssuerDidDocument,
  IssuerMultiKeyDidDocument,
} from "@/infrastructure/libs/did/issuerDidBuilder";

@injectable()
export default class IssuerDidUseCase {
  constructor(
    @inject("IssuerDidService")
    private readonly service: IssuerDidService,
  ) {}

  /**
   * Resolve the **single-key** JSON body for `/.well-known/did.json`
   * (Phase 1 Multikey shape).
   *
   * Returns `null` (not a payload) when no active key is registered, to
   * preserve the router's "fall back to minimal static stub" path. The
   * presenter is invoked only on the happy path so callers cannot
   * accidentally bypass it.
   *
   * **Backward compatibility**: kept after Phase 2's router migration to
   * `buildDidDocument()` so admin GraphQL / ad-hoc tooling that depends
   * on the single-key shape keeps compiling. Do NOT call this from new
   * router code — use `buildDidDocument()` for the §G overlap shape.
   */
  async getActiveIssuerDidDocument(): Promise<IssuerDidDocument | null> {
    const document = await this.service.getActiveIssuerDidDocument();
    if (document === null) {
      return null;
    }
    return IssuerDidPresenter.toDocumentResponse(document);
  }

  /**
   * Resolve the §G overlap **multi-key** JSON body for
   * `/.well-known/did.json` (Phase 2 / spec §5.4.3 line 1131-1142).
   *
   * Returns `null` when no keys are registered; the router falls back to
   * the same minimal static Document as the single-key path so dev /
   * staging UX is preserved during bootstrap.
   *
   * Wire shape: `JsonWebKey2020` + `publicKeyJwk` for every key in the
   * §G overlap window (ENABLED + DISABLED). `assertionMethod` /
   * `authentication` reference ENABLED keys only — DISABLED rows are
   * verification-only tails kept for past-VC verification (§9.1.3).
   */
  async buildDidDocument(): Promise<IssuerMultiKeyDidDocument | null> {
    const document = await this.service.buildDidDocument();
    if (document === null) {
      return null;
    }
    return IssuerDidPresenter.toMultiKeyDocumentResponse(document);
  }
}
