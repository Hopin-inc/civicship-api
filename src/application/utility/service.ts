import {
  GqlQueryUtilitiesArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtility,
} from "@/types/graphql";
import UtilityRepository from "@/application/utility/infrastructure/repository";
import { IContext } from "@/types/server";
import UtilityInputFormat from "@/application/utility/infrastructure/converter";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/graphql";

export default class UtilityService {
  static async fetchUtilities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilitiesArgs,
    take: number,
  ) {
    const where = UtilityInputFormat.filter(filter ?? {});
    const orderBy = UtilityInputFormat.sort(sort ?? {});
    return UtilityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUtility(ctx: IContext, id: string) {
    return await UtilityRepository.find(ctx, id);
  }

  static async findUtilityOrThrow(ctx: IContext, id: string): Promise<GqlUtility> {
    const utility = await UtilityRepository.find(ctx, id);
    if (!utility) {
      throw new NotFoundError("Utility", { id });
    }
    return utility;
  }

  static async createUtility(ctx: IContext, input: GqlUtilityCreateInput) {
    const data: Prisma.UtilityCreateInput = UtilityInputFormat.create(input);
    return UtilityRepository.create(ctx, data);
  }

  static async deleteUtility(ctx: IContext, id: string) {
    return UtilityRepository.delete(ctx, id);
  }

  static async updateUtilityInfo(ctx: IContext, { id, input }: GqlMutationUtilityUpdateInfoArgs) {
    const data: Prisma.UtilityUpdateInput = UtilityInputFormat.updateInfo(input);
    return UtilityRepository.update(ctx, id, data);
  }
}
