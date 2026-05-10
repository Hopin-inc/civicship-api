/**
 * `IssuerDidUseCase` — orchestration entry point for the Issuer DID flows.
 *
 * Phase 1 step 8 ships exactly one flow: serving the
 * `/.well-known/did.json` body. The route handler (`presentation/router/did.ts`)
 * historically reached straight into `IssuerDidService`, which works but
 * places presentation-layer code one architectural step too close to the
 * service. The use case wraps the service so that:
 *
 *   - future GraphQL admin queries (e.g. `issuerDidDocument` in the admin
 *     panel) can reuse exactly the same orchestration layer;
 *   - the presenter (below) is invoked uniformly regardless of caller.
 *
 * The use case does NOT manage transactions — `findActiveKey()` is a
 * single read with no community scope, so opening a transaction would add
 * latency without correctness benefit.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   CLAUDE.md "Layer Responsibilities" (UseCase ↔ Service ↔ Repository)
 */

import { inject, injectable } from "tsyringe";

import IssuerDidService from "@/application/domain/credential/issuerDid/service";
import IssuerDidPresenter from "@/application/domain/credential/issuerDid/presenter";
import type { IssuerDidDocument } from "@/infrastructure/libs/did/issuerDidBuilder";

@injectable()
export default class IssuerDidUseCase {
  constructor(
    @inject("IssuerDidService")
    private readonly service: IssuerDidService,
  ) {}

  /**
   * Resolve the JSON body for `/.well-known/did.json`.
   *
   * Returns `null` (not a payload) when no active key is registered, to
   * preserve the router's "fall back to minimal static stub" path. The
   * presenter is invoked only on the happy path so callers cannot
   * accidentally bypass it.
   */
  async getActiveIssuerDidDocument(): Promise<IssuerDidDocument | null> {
    const document = await this.service.getActiveIssuerDidDocument();
    if (document === null) {
      return null;
    }
    return IssuerDidPresenter.toDocumentResponse(document);
  }
}
