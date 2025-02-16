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
import OpportunityService from "@/app/opportunity/service";
import OpportunityOutputFormat from "@/presentation/graphql/dto/opportunity/output";
import { OpportunityUtils } from "@/app/opportunity/utils";

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
      filter: { communityId: id },
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
      filter: { createdByUserId: id },
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
      filter: { placeId: id },
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
    return OpportunityOutputFormat.get(res);
  }

  static async managerCreateOpportunity(
    { input }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    const res = await OpportunityService.createOpportunity(ctx, input);
    return OpportunityOutputFormat.create(res);
  }

  static async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    const res = await OpportunityService.deleteOpportunity(ctx, id);
    return OpportunityOutputFormat.delete(res);
  }

  static async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    const res = await OpportunityService.updateOpportunityContent(ctx, id, input);
    return OpportunityOutputFormat.update(res);
  }

  static async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    const res = await OpportunityService.setOpportunityStatus(ctx, id, input.status);
    return OpportunityOutputFormat.setPublishStatus(res);
  }
}
