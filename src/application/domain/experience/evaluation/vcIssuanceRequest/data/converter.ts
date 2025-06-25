import { EvaluationCredentialPayload } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";
import logger from "@/infrastructure/logging";
import { ParticipationStatusReason, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { GqlVcIssuanceRequestFilterInput, GqlVcIssuanceRequestSortInput } from "@/types/graphql";

@injectable()
export default class VCIssuanceRequestConverter {
  filter(filter?: GqlVcIssuanceRequestFilterInput): Prisma.VcIssuanceRequestWhereInput {
    const conditions: Prisma.VcIssuanceRequestWhereInput[] = [];

    if (!filter) return {};

    if (filter.status) conditions.push({ status: filter.status });
    if (filter.userId) conditions.push({ userId: filter.userId });
    if (filter.evaluationId) conditions.push({ evaluationId: filter.evaluationId });

    return conditions.length ? { AND: conditions } : {};
  }

  sort(sort?: GqlVcIssuanceRequestSortInput): Prisma.VcIssuanceRequestOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      ...(sort?.updatedAt ? [{ updatedAt: sort.updatedAt }] : []),
    ];
  }

  toVCIssuanceRequestInput = (evaluation: PrismaEvaluation): EvaluationCredentialPayload => {
    const { status, evaluator, participation } = evaluation;

    if (!evaluator) {
      logger.error("Evaluator is missing required fields", { evaluator });
      throw new Error("Evaluator is missing required fields");
    }

    const user = participation?.user;
    if (!user) {
      logger.error("Participation user is missing required fields", { user });
      throw new Error("Participation user is missing required fields");
    }

    const reason = participation?.reason;
    const opportunitySlot =
      reason === ParticipationStatusReason.PERSONAL_RECORD
        ? participation.opportunitySlot
        : participation.reservation?.opportunitySlot;

    if (!opportunitySlot) {
      logger.error("OpportunitySlot is missing required fields", { opportunitySlot });
      throw new Error("OpportunitySlot is missing required fields");
    }

    const opportunity = opportunitySlot.opportunity;
    if (!opportunity) {
      logger.error("Opportunity is missing required fields", { opportunity });
      throw new Error("Opportunity is missing required fields");
    }

    return {
      claims: {
        type: "EvaluationCredential",
        score: status,
        evaluator: {
          id: evaluator.id,
          name: evaluator.name,
        },
        participant: {
          id: user?.id,
          name: user?.name,
        },
        opportunity: {
          id: opportunity?.id,
          title: opportunity?.title,
          startsAt: opportunitySlot?.startsAt.toISOString(),
          endsAt: opportunitySlot?.endsAt.toISOString(),
        },
      },
      credentialFormat: "JWT",
    };
  };
}
