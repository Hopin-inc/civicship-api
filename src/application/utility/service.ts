import {
  GqlQueryUtilitiesArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtility,
} from "@/types/graphql";
import UtilityRepository from "@/application/utility/data/repository";
import { IContext } from "@/types/server";
import UtilityConverter from "@/application/utility/data/converter";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/graphql";

export default class UtilityService {
  static async fetchUtilities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilitiesArgs,
    take: number,
  ) {
    const where = UtilityConverter.filter(filter ?? {});
    const orderBy = UtilityConverter.sort(sort ?? {});
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
    const data: Prisma.UtilityCreateInput = UtilityConverter.create(input);
    return UtilityRepository.create(ctx, data);
  }

  static async deleteUtility(ctx: IContext, id: string) {
    return UtilityRepository.delete(ctx, id);
  }

  static async updateUtilityInfo(ctx: IContext, { id, input }: GqlMutationUtilityUpdateInfoArgs) {
    const data: Prisma.UtilityUpdateInput = UtilityConverter.updateInfo(input);
    return UtilityRepository.update(ctx, id, data);
  }
}
