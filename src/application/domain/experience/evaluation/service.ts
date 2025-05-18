import { inject, injectable } from "tsyringe";
import { GqlEvaluationCreateInput, GqlQueryEvaluationsArgs } from "@/types/graphql";
import { IEvaluationRepository } from "@/application/domain/experience/evaluation/data/interface";
import EvaluationConverter from "@/application/domain/experience/evaluation/data/converter";
import { IContext } from "@/types/server";
import { EvaluationStatus, Prisma } from "@prisma/client";
import {
  AlreadyEvaluatedError,
  CannotEvaluateBeforeOpportunityStartError,
  NotFoundError,
  ValidationError,
} from "@/errors/graphql";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";

@injectable()
export default class EvaluationService {
  constructor(
    @inject("EvaluationRepository") private readonly repository: IEvaluationRepository,
    @inject("EvaluationConverter") private readonly converter: EvaluationConverter,
  ) {}

  async fetchEvaluations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryEvaluationsArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findEvaluation(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async validateEvaluatable(ctx: IContext, participationId: string) {
    const exist = await this.repository.queryByParticipation(ctx, participationId);
    if (exist.length > 0) throw new AlreadyEvaluatedError();

    const startsAt = exist[0].participation?.reservation?.opportunitySlot.startsAt;
    if (!startsAt) throw new ValidationError("OpportunitySlot startsAt is undefined.");

    const jstStartsAt = new Date(startsAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const nowJST = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (new Date(nowJST) < new Date(jstStartsAt))
      throw new CannotEvaluateBeforeOpportunityStartError();
  }

  async createEvaluation(
    ctx: IContext,
    currentUserId: string,
    input: GqlEvaluationCreateInput,
    status: EvaluationStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const isValidFinalStatus =
      status === EvaluationStatus.PASSED || status === EvaluationStatus.FAILED;

    if (!isValidFinalStatus) {
      throw new ValidationError("create evaluation allowed PASSED or FAILED status only.");
    }

    const data = this.converter.create(input.participationId, currentUserId, status, input.comment);
    return this.repository.create(ctx, data, tx);
  }

  validateParticipationHasOpportunity(evaluation: PrismaEvaluation): {
    participation: NonNullable<PrismaEvaluation["participation"]>;
    opportunity: NonNullable<
      NonNullable<PrismaEvaluation["participation"]>["reservation"]
    >["opportunitySlot"]["opportunity"];
    communityId: string;
    userId: string;
  } {
    const participation = evaluation.participation;
    const opportunity = participation?.reservation?.opportunitySlot?.opportunity;

    if (!participation || !opportunity) {
      throw new NotFoundError("Participation or Opportunity", { evaluationId: evaluation.id });
    }

    const communityId = participation?.communityId;
    if (!communityId) {
      throw new NotFoundError("Community ID", { evaluationId: evaluation.id });
    }

    const userId = participation?.userId;
    if (!userId) {
      throw new NotFoundError("User ID", { evaluationId: evaluation.id });
    }

    return { participation, opportunity, communityId, userId };
  }
}
