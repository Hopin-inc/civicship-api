import {
  GqlCommunity,
  GqlCommunityParticipationsArgs,
  GqlOpportunity,
  GqlOpportunityParticipationsArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlParticipation,
  GqlParticipationsConnection,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
  GqlUser,
  GqlUserParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/app/opportunity/participation/service";
import ParticipationOutputFormat from "@/presen/graphql/dto/opportunity/participation/output";
import ParticipationUtils from "@/app/opportunity/participation/utils";

export default class ParticipationReadUseCase {
  static async visitorBrowseParticipations(
    { cursor, filter, sort, first }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseParticipationsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserParticipationsArgs,
    ctx: IContext,
  ) {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByOpportunity(
    { id }: GqlOpportunity,
    { first, cursor }: GqlOpportunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { opportunityId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByOpportunitySlot(
    { id }: GqlOpportunitySlot,
    { first, cursor }: GqlOpportunitySlotParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { opportunitySlotId: id },
      first,
    });
  }

  static async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await ParticipationService.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationOutputFormat.get(res);
  }
}
