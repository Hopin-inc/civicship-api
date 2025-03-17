import {
  GqlQueryUtilitiesArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtility,
  GqlUtilityFilterInput,
} from "@/types/graphql";
import UtilityRepository from "@/application/utility/data/repository";
import { IContext } from "@/types/server";
import UtilityConverter from "@/application/utility/data/converter";
import { Prisma, PublishStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";

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
    await this.findUtilityOrThrow(ctx, id);
    return UtilityRepository.delete(ctx, id);
  }

  static async updateUtilityInfo(ctx: IContext, { id, input }: GqlMutationUtilityUpdateInfoArgs) {
    await this.findUtilityOrThrow(ctx, id);

    const data: Prisma.UtilityUpdateInput = UtilityConverter.updateInfo(input);
    return UtilityRepository.update(ctx, id, data);
  }

  static async validatePublishStatus(
    allowedStatuses: PublishStatus[],
    filter?: GqlUtilityFilterInput,
  ) {
    if (filter?.status && !filter.status.every((status) => allowedStatuses.includes(status))) {
      throw new ValidationError(
        `Validation error: status must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.status)],
      );
    }
  }
}
