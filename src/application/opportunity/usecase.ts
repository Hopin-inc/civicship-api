import {
  GqlCommunity,
  GqlCommunityOpportunitiesArgs,
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunitySetPublishStatusPayload,
  GqlOpportunityUpdateContentPayload,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlQueryOpportunitiesAllArgs,
  GqlQueryOpportunitiesCommunityInternalArgs,
  GqlQueryOpportunitiesPublicArgs,
  GqlQueryOpportunityArgs,
  GqlUser,
  GqlUserOpportunitiesCreatedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityPresenter from "@/application/opportunity/presenter";
import { PublishStatus } from "@prisma/client";
import OpportunityService from "@/application/opportunity/service";

export default class OpportunityUseCase {
  static async visitorBrowsePublicOpportunities(
    args: GqlQueryOpportunitiesPublicArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    await OpportunityService.validatePublishStatus([PublishStatus.PUBLIC], args.filter);

    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor: args.cursor,
      sort: args.sort,
      filter: {
        ...args.filter,
        publishStatus: [PublishStatus.PUBLIC],
      },
      first: args.first,
    });
  }

  static async memberBrowseCommunityInternalOpportunities(
    args: GqlQueryOpportunitiesCommunityInternalArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    await OpportunityService.validatePublishStatus(
      [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      args.filter,
    );

    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor: args.cursor,
      sort: args.sort,
      filter: {
        ...args.filter,
        publishStatus: [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      },
      first: args.first,
    });
  }

  static async managerBrowseAllOpportunities(
    args: GqlQueryOpportunitiesAllArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor: args.cursor,
      sort: args.sort,
      filter: args.filter,
      first: args.first,
    });
  }

  static async visitorBrowseOpportunitiesByCommunity(
    { id }: GqlCommunity,
    { first, cursor, filter }: GqlCommunityOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, communityIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesCreatedByUser(
    { id }: GqlUser,
    { first, cursor, filter }: GqlUserOpportunitiesCreatedByMeArgs,
    ctx: IContext,
  ) {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, createdByUserIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesByPlace(
    { id }: GqlPlace,
    { first, cursor, filter }: GqlPlaceOpportunitiesArgs,
    ctx: IContext,
  ) {
    return OpportunityService.fetchOpportunitiesConnection(ctx, {
      cursor,
      filter: { ...filter, placeIds: [id] },
      first,
    });
  }

  static async visitorViewOpportunity(
    { id }: GqlQueryOpportunityArgs,
    ctx: IContext,
  ): Promise<GqlOpportunity | null> {
    const res = await OpportunityService.findOpportunity(ctx, id);
    if (!res) {
      return null;
    }
    return OpportunityPresenter.get(res);
  }

  static async managerCreateOpportunity(
    { input }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    const res = await OpportunityService.createOpportunity(ctx, input);
    return OpportunityPresenter.create(res);
  }

  static async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    const res = await OpportunityService.deleteOpportunity(ctx, id);
    return OpportunityPresenter.delete(res);
  }

  static async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    const res = await OpportunityService.updateOpportunityContent(ctx, id, input);
    return OpportunityPresenter.update(res);
  }

  static async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    const res = await OpportunityService.setOpportunityStatus(ctx, id, input.status);
    return OpportunityPresenter.setPublishStatus(res);
  }
}
