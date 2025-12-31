import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunityFilterInput,
  GqlOpportunitySetPublishStatusPayload,
  GqlOpportunityUpdateContentPayload,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import { PublishStatus } from "@prisma/client";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import logger from "@/infrastructure/logging";
import { PrismaOpportunityDetail } from "@/application/domain/experience/opportunity/data/type";

@injectable()
export default class OpportunityUseCase {
  constructor(@inject("OpportunityService") private readonly service: OpportunityService) {}

  async anyoneBrowseOpportunities(
    { filter, sort, cursor, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.currentUser?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedStatuses = getAllowedPublishStatuses(communityIds, isManager, isMember);

    await this.service.validatePublishStatus(allowedStatuses, filter);

    const accessFilter = enforceAccessFilter(currentUserId, communityIds);
    const finalFilter = accessFilter ? { and: [accessFilter, filter ?? {}] } : (filter ?? {});

    const records = await this.service.fetchOpportunities(
      ctx,
      {
        cursor,
        sort,
        filter: finalFilter,
      },
      take,
    );

    const hasNextPage = records.length > take;
    let data = records.slice(0, take).map((record) => OpportunityPresenter.get(record));

    if (filter?.isReservableWithTicket !== undefined && currentUserId) {
      data = await this.filterOpportunitiesByReservableWithTicket(
        ctx,
        records.slice(0, take),
        data,
        currentUserId,
        filter.isReservableWithTicket,
      );
    }

    return OpportunityPresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewOpportunity(
    { id }: GqlQueryOpportunityArgs,
    ctx: IContext,
  ): Promise<GqlOpportunity | null> {
    const record = await this.service.findOpportunity(ctx, id);
    if (!record || !record.communityId) {
      return null;
    }

    logger.debug("[visitorViewOpportunity] record:", record, ctx);

    // // Check if user can view based on publishStatus and role
    // if (
    //   !canViewByPublishStatus(
    //     ctx,
    //     record.publishStatus,
    //     record.communityId,
    //     record.createdBy ?? undefined,
    //   )
    // ) {
    //   return null;
    // }

    return OpportunityPresenter.get(record);
  }

  async managerCreateOpportunity(
    { input, permission }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.createOpportunity(ctx, input, permission.communityId, tx);
      return OpportunityPresenter.create(record);
    });
  }

  async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.deleteOpportunity(ctx, id, tx);
      return OpportunityPresenter.delete(record);
    });
  }

  async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.updateOpportunityContent(ctx, id, input, tx);
      return OpportunityPresenter.update(record);
    });
  }

  async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.setOpportunityPublishStatus(
        ctx,
        id,
        input.publishStatus,
        tx,
      );
      return OpportunityPresenter.setPublishStatus(record);
    });
  }

  private async filterOpportunitiesByReservableWithTicket(
    ctx: IContext,
    records: PrismaOpportunityDetail[],
    gqls: GqlOpportunity[],
    userId: string,
    expected: boolean,
  ): Promise<GqlOpportunity[]> {
    const pairs = records
      .map((record, i) => {
        const communityId = record.communityId;
        if (!communityId) {
          logger.log(
            "[isReservableWithTicket filter] Skipping opportunity without communityId:",
            gqls[i]?.id,
          );
          return null;
        }
        return {
          key: {
            userId,
            communityId,
            opportunityId: record.id,
          },
          opportunity: gqls[i],
        };
      })
      .filter(
        (
          pair,
        ): pair is {
          key: { userId: string; communityId: string; opportunityId: string };
          opportunity: GqlOpportunity;
        } => pair !== null,
      );

    const results = await Promise.all(
      pairs.map((pair) => ctx.loaders.isReservableWithTicket.load(pair.key)),
    );

    return pairs
      .map((pair, i) => (results[i] === expected ? pair.opportunity : null))
      .filter((op): op is GqlOpportunity => op !== null);
  }
}

function getAllowedPublishStatuses(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
): PublishStatus[] {
  if (communityIds.some((id) => isManager[id])) {
    return Object.values(PublishStatus);
  }
  if (communityIds.some((id) => isMember[id])) {
    return [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
  }
  return [PublishStatus.PUBLIC];
}

function enforceAccessFilter(
  currentUserId: string | undefined,
  communityIds: string[],
): GqlOpportunityFilterInput | undefined {
  if (communityIds.length === 0) return undefined;

  return {
    or: communityIds.map((communityId) => ({
      communityIds: [communityId],
    })),
  };
}
