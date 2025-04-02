import { GqlEvaluationCreateInput, GqlQueryEvaluationsArgs } from "@/types/graphql";
import EvaluationRepository from "@/application/domain/evaluation/data/repository";
import EvaluationConverter from "@/application/domain/evaluation/data/converter";
import { IContext } from "@/types/server";
import { EvaluationStatus, Prisma } from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import { ValidationError } from "@/errors/graphql";
import { PrismaEvaluation } from "@/application/domain/evaluation/data/type";

export default class EvaluationService {
  static async fetchEvaluations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryEvaluationsArgs,
    take: number,
  ) {
    const where = EvaluationConverter.filter(filter ?? {});
    const orderBy = EvaluationConverter.sort(sort ?? {});

    return await EvaluationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findEvaluation(ctx: IContext, id: string) {
    return await EvaluationRepository.find(ctx, id);
  }

  static async createEvaluation(
    ctx: IContext,
    input: GqlEvaluationCreateInput,
    status: EvaluationStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const isValidFinalStatus =
      status === EvaluationStatus.PASSED || status === EvaluationStatus.FAILED;

    if (!isValidFinalStatus) {
      throw new ValidationError("Invalid status. Only PASSED or FAILED are allowed.", [status]);
    }

    const currentUserId = getCurrentUserId(ctx);
    const data = EvaluationConverter.create(
      input.participationId,
      currentUserId,
      status,
      input.comment,
    );

    return EvaluationRepository.create(ctx, data, tx);
  }

  static validateParticipationHasOpportunity(evaluation: PrismaEvaluation) {
    const participation = evaluation.participation;
    const opportunity = participation?.reservation?.opportunitySlot?.opportunity;

    if (!participation || !opportunity) {
      throw new ValidationError("Participation or Opportunity not found for evaluation", [
        evaluation.id,
      ]);
    }

    const communityId = participation?.communityId;
    if (!communityId) {
      throw new ValidationError("Community ID not found for participation", [evaluation.id]);
    }

    return { participation, opportunity, communityId };
  }
}
