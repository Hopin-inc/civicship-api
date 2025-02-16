import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlUtility,
  GqlUtilitiesConnection,
  GqlCommunity,
  GqlCommunityUtilitiesArgs,
} from "@/types/graphql";
import UtilityService from "@/app/utility/service";
import UtilityOutputFormat from "@/presentation/graphql/dto/utility/output";
import { IContext } from "@/types/server";
import { UtilityUtils } from "@/app/utility/utils";

export default class UtilityReadUseCase {
  static async visitorBrowseUtilities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUtilitiesArgs,
  ): Promise<GqlUtilitiesConnection> {
    return UtilityUtils.fetchUtilitiesCommon(ctx, {
      cursor,
      filter,
      sort,
      first,
    });
  }

  static async visitorBrowseUtilitiesByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityUtilitiesArgs,
    ctx: IContext,
  ): Promise<GqlUtilitiesConnection> {
    return UtilityUtils.fetchUtilitiesCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorViewUtility(
    ctx: IContext,
    { id }: GqlQueryUtilityArgs,
  ): Promise<GqlUtility | null> {
    const utility = await UtilityService.findUtility(ctx, id);
    if (!utility) {
      return null;
    }
    return UtilityOutputFormat.get(utility);
  }
}
