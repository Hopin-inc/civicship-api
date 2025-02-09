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
} from "@/types/graphql";
import UtilityService from "@/domains/utility/service";
import UtilityOutputFormat from "@/domains/utility/presenter/output";
import { IContext } from "@/types/server";

export default class UtilityUseCase {
  static async visitorBrowseUtilities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUtilitiesArgs,
  ): Promise<GqlUtilitiesConnection> {
    const take = first ?? 10;
    const data = await UtilityService.fetchUtilities(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const utilities: GqlUtility[] = data.slice(0, take).map((record) => {
      return UtilityOutputFormat.get(record);
    });
    return UtilityOutputFormat.query(utilities, hasNextPage);
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
