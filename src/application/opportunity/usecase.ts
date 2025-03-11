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
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
  GqlUser,
  GqlUserOpportunitiesCreatedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityService from "@/application/opportunity/service";
import OpportunityPresenter from "@/application/opportunity/presenter";
import OpportunityUtils from "@/application/opportunity/utils";

export default class OpportunityUseCase {
  static async visitorBrowsePublicOpportunities(
    { cursor, filter, sort, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityUtils.fetchOpportunitiesCommon(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorBrowseOpportunitiesByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    return OpportunityUtils.fetchOpportunitiesCommon(ctx, {
      cursor,
      filter: { communityIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesCreatedByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserOpportunitiesCreatedByMeArgs,
    ctx: IContext,
  ) {
    return OpportunityUtils.fetchOpportunitiesCommon(ctx, {
      cursor,
      filter: { createdByUserIds: [id] },
      first,
    });
  }

  static async visitorBrowseOpportunitiesByPlace(
    { id }: GqlPlace,
    { first, cursor }: GqlPlaceOpportunitiesArgs,
    ctx: IContext,
  ) {
    return OpportunityUtils.fetchOpportunitiesCommon(ctx, {
      cursor,
      filter: { placeIds: [id] },
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
