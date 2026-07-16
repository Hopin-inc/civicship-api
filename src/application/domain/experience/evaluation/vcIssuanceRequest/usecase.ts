import {
  GqlVcIssuanceRequestsConnection,
  GqlVcIssuanceRequest,
  GqlQueryVcIssuanceRequestArgs,
  GqlQueryVcIssuanceRequestsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import { clampFirst } from "@/application/domain/utils";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import VCIssuanceRequestPresenter from "@/application/domain/experience/evaluation/vcIssuanceRequest/presenter";
import { AuthenticationError } from "@/errors/graphql";

/**
 * True when the caller is the target user, or when the caller is an admin.
 * Mirrors the ownership predicate in the sibling `credential/vcIssuance`
 * usecase — both VC-surface read paths must apply the same "self-or-admin"
 * gate. Kept local (a 3-line predicate isn't worth a shared module).
 *
 * `userId` is nullable so callers can pass a row's FK directly: an admin
 * still gets access even for a `userId`-less row, while a non-admin (or an
 * anonymous caller) is denied — the `!!userId` guard makes a missing owner
 * never match. Defence-in-depth behind the schema's `IsUser` rule.
 */
function isSelfOrAdmin(ctx: IContext, userId: string | null | undefined): boolean {
  if (ctx.isAdmin) return true;
  return !!userId && ctx.currentUser?.id === userId;
}

@injectable()
export default class VCIssuanceRequestUseCase {
  constructor(
    @inject("VCIssuanceRequestService")
    private readonly service: VCIssuanceRequestService,
  ) {}

  /**
   * `Query.vcIssuanceRequests`. The schema gates on `IsUser` (authenticated
   * OR admin), but that rule does not bind the `filter.userIds` argument to
   * the caller: without the guard below any logged-in user could enumerate
   * every user's VC issuance requests by passing arbitrary `userIds`
   * (and, before the `@authz` directive was added, so could an anonymous
   * caller).
   *
   * We therefore scope non-admin callers to their own rows — the effective
   * `userIds` filter is forced to `[currentUser.id]` regardless of what the
   * client sent. Admins keep the unrestricted cross-user view the
   * management surface needs. This mirrors the ownership enforcement in
   * `credential/vcIssuance` (`viewVcIssuancesByUser`).
   */
  async visitorBrowseVcIssuanceRequests(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryVcIssuanceRequestsArgs,
  ): Promise<GqlVcIssuanceRequestsConnection> {
    const scopedFilter = this.scopeFilterToCaller(ctx, filter);

    const take = clampFirst(first);
    const requests = await this.service.fetchVcIssuanceRequests(
      ctx,
      { cursor, filter: scopedFilter, sort },
      take,
    );

    const hasNextPage = requests.length > take;
    const data = requests.slice(0, take).map(VCIssuanceRequestPresenter.get);
    return VCIssuanceRequestPresenter.query(data, hasNextPage);
  }

  /**
   * `Query.vcIssuanceRequest(id)`. Loads the row, then returns `null` unless
   * the caller owns it or is an admin — matching the "no such id" path so we
   * do not leak the existence of another user's request. Same pattern as
   * `credential/vcIssuance` `viewVcIssuance`.
   */
  async visitorViewVcIssuanceRequest(
    ctx: IContext,
    { id }: GqlQueryVcIssuanceRequestArgs,
  ): Promise<GqlVcIssuanceRequest | null> {
    const request = await this.service.findVcIssuanceRequest(ctx, id);
    if (!request) return null;
    if (!isSelfOrAdmin(ctx, request.userId)) return null;
    return VCIssuanceRequestPresenter.get(request);
  }

  /**
   * Restrict a non-admin caller's list filter to their own `userId`,
   * ignoring any `userIds` they supplied. Admins pass through untouched.
   * Throws for anonymous callers as defence-in-depth — the schema's
   * `IsUser` rule should already have rejected them.
   */
  private scopeFilterToCaller(
    ctx: IContext,
    filter: GqlQueryVcIssuanceRequestsArgs["filter"],
  ): GqlQueryVcIssuanceRequestsArgs["filter"] {
    if (ctx.isAdmin) return filter;

    const callerId = ctx.currentUser?.id;
    if (!callerId) {
      throw new AuthenticationError("User must be logged in");
    }
    return { ...(filter ?? {}), userIds: [callerId] };
  }
}
