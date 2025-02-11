import {
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlMutationUtilityUseArgs,
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlUtility,
  GqlUtilitiesConnection,
  GqlUtilityCreatePayload,
  GqlUtilityDeletePayload,
  GqlUtilityUpdateInfoPayload,
  GqlUtilityUsePayload,
  GqlCommunity,
  GqlCommunityUtilitiesArgs,
} from "@/types/graphql";
import UtilityService from "@/domains/utility/service";
import UtilityOutputFormat from "@/domains/utility/presenter/output";
import { IContext } from "@/types/server";
import { UtilityUtils } from "@/domains/utility/utils";

export default class UtilityUseCase {
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

  static async managerCreateUtility(
    ctx: IContext,
    { input }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    const res = await UtilityService.createUtility(ctx, input);
    return UtilityOutputFormat.create(res);
  }

  static async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    const res = await UtilityService.deleteUtility(ctx, id);
    return UtilityOutputFormat.delete(res);
  }

  static async managerUpdateUtilityInfo(
    ctx: IContext,
    { id, input }: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    const res = await UtilityService.updateUtilityInfo(ctx, { id, input });
    return UtilityOutputFormat.updateInfo(res);
  }

  static async memberUseUtility(
    ctx: IContext,
    { id, input }: GqlMutationUtilityUseArgs,
  ): Promise<GqlUtilityUsePayload> {
    const res = await UtilityService.useUtility(ctx, { id, input });
    return UtilityOutputFormat.useUtility(res);
  }
}
