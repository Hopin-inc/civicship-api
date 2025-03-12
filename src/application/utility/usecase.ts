import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlUtility,
  GqlUtilitiesConnection,
  GqlCommunity,
  GqlCommunityUtilitiesArgs,
  GqlMutationUtilityCreateArgs,
  GqlUtilityCreatePayload,
  GqlMutationUtilityDeleteArgs,
  GqlUtilityDeletePayload,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityUpdateInfoPayload,
} from "@/types/graphql";
import UtilityService from "@/application/utility/service";
import UtilityPresenter from "@/application/utility/presenter";
import { IContext } from "@/types/server";
import { UtilityUtils } from "@/application/utility/utils";

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
    return UtilityPresenter.get(utility);
  }

  static async managerCreateUtility(
    ctx: IContext,
    { input }: GqlMutationUtilityCreateArgs,
  ): Promise<GqlUtilityCreatePayload> {
    const res = await UtilityService.createUtility(ctx, input);
    return UtilityPresenter.create(res);
  }

  static async managerDeleteUtility(
    ctx: IContext,
    { id }: GqlMutationUtilityDeleteArgs,
  ): Promise<GqlUtilityDeletePayload> {
    const res = await UtilityService.deleteUtility(ctx, id);
    return UtilityPresenter.delete(res);
  }

  static async managerUpdateUtilityInfo(
    ctx: IContext,
    { id, input }: GqlMutationUtilityUpdateInfoArgs,
  ): Promise<GqlUtilityUpdateInfoPayload> {
    const res = await UtilityService.updateUtilityInfo(ctx, { id, input });
    return UtilityPresenter.updateInfo(res);
  }
}
