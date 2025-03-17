import {
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtilityCreateInput,
  GqlUtility,
  GqlUtilityFilterInput,
  GqlUtilitiesConnection,
  GqlUtilitySortInput,
} from "@/types/graphql";
import UtilityRepository from "@/application/utility/data/repository";
import { IContext } from "@/types/server";
import UtilityConverter from "@/application/utility/data/converter";
import { Prisma, PublishStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { clampFirst } from "@/application/utils";
import UtilityPresenter from "@/application/utility/presenter";

export default class UtilityService {
  static async fetchUtilities(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlUtilityFilterInput;
      sort?: GqlUtilitySortInput;
      first?: number;
    },
  ): Promise<GqlUtilitiesConnection> {
    const take = clampFirst(first);

    const where = UtilityConverter.filter(filter ?? {});
    const orderBy = UtilityConverter.sort(sort ?? {});

    const res = await UtilityRepository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => UtilityPresenter.get(record));
    return UtilityPresenter.query(data, hasNextPage);
  }

  static async findUtility(ctx: IContext, id: string, filter: GqlUtilityFilterInput) {
    const where = UtilityConverter.findAccessible(id, filter ?? {});
    const utility = await UtilityRepository.findAccessible(ctx, where);
    if (!utility) {
      return null;
    }
    return utility;
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
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((publishStatus) => allowedStatuses.includes(publishStatus))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }
}
