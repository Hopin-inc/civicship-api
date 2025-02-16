import {
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlMutationUtilityUseArgs,
  GqlUtilityCreatePayload,
  GqlUtilityDeletePayload,
  GqlUtilityUpdateInfoPayload,
  GqlUtilityUsePayload,
} from "@/types/graphql";
import UtilityService from "@/app/utility/service";
import UtilityOutputFormat from "@/presentation/graphql/dto/utility/output";
import { IContext } from "@/types/server";

export default class UtilityWriteUseCase {
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
