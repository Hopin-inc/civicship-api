import {
  GqlEvaluationFilterInput,
  GqlEvaluationsConnection,
  GqlEvaluationSortInput,
} from "@/types/graphql";
import EvaluationRepository from "@/application/evaluation/data/repository";
import EvaluationPresenter from "@/application/evaluation/presenter";
import EvaluationConverter from "@/application/evaluation/data/converter";
import { IContext } from "@/types/server";
import { EvaluationStatus } from "@prisma/client";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import { ValidationError } from "@/errors/graphql";

export default class EvaluationService {
  static async fetchEvaluations(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlEvaluationFilterInput;
      sort?: GqlEvaluationSortInput;
      first?: number;
    },
  ): Promise<GqlEvaluationsConnection> {
    const take = clampFirst(first);
    const where = EvaluationConverter.filter(filter ?? {});
    const orderBy = EvaluationConverter.sort(sort ?? {});

    const res = await EvaluationRepository.query(ctx, where, orderBy, take, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map(EvaluationPresenter.get);
    return EvaluationPresenter.query(data, hasNextPage);
  }

  static async findEvaluation(ctx: IContext, id: string) {
    return await EvaluationRepository.find(ctx, id);
  }

  static async findEvaluationOrThrow(ctx: IContext, id: string) {
    const record = await this.findEvaluation(ctx, id);
    if (!record) {
      throw new ValidationError("Evaluation not found", [id]);
    }
    return record;
  }

  static async createEvaluation(
    ctx: IContext,
    participationId: string,
    status: EvaluationStatus,
    comment?: string,
  ) {
    const isValidFinalStatus =
      status === EvaluationStatus.PASSED || status === EvaluationStatus.FAILED;

    if (!isValidFinalStatus) {
      throw new ValidationError("Invalid status. Only PASSED or FAILED are allowed.", [status]);
    }

    const currentUserId = getCurrentUserId(ctx);
    const data = EvaluationConverter.create(participationId, currentUserId, status, comment);

    return EvaluationRepository.create(ctx, data);
  }
}
