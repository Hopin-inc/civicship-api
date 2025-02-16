import {
  GqlCommunity,
  GqlCommunityOpportunitiesArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
  GqlUser,
  GqlUserOpportunitiesCreatedByMeArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityService from "@/application/opportunity/service";
import OpportunityOutputFormat from "@/presentation/graphql/dto/opportunity/output";
import { OpportunityUtils } from "@/application/opportunity/utils";

export default class OpportunityReadUseCase {
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
}
