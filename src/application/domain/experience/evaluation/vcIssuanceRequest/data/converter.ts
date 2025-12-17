import { EvaluationCredentialPayload } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";
import logger from "@/infrastructure/logging";
import { ParticipationStatusReason, Prisma, VcIssuanceStatus } from "@prisma/client";
import { injectable } from "tsyringe";
import { GqlVcIssuanceRequestFilterInput, GqlVcIssuanceRequestSortInput } from "@/types/graphql";

@injectable()
export default class VCIssuanceRequestConverter {
  filter(filter?: GqlVcIssuanceRequestFilterInput): Prisma.VcIssuanceRequestWhereInput {
    const conditions: Prisma.VcIssuanceRequestWhereInput[] = [];

    if (!filter) return {};

    if (filter.status) conditions.push({ status: filter.status });
    if (filter.userIds?.length) {
      conditions.push({ userId: { in: filter.userIds } });
    }
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
    const { status, opportunity, opportunitySlot, user, evaluator } = this.validateParticipationHasOpportunity(evaluation);

    return {
      claims: {
        type: "EvaluationCredential",
        score: status,
        id: evaluation.id,
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
          startsAt: opportunitySlot?.startsAt?.toISOString(),
          endsAt: opportunitySlot?.endsAt?.toISOString(),
        },
      },
    };
  };

  createManyInputs(
    evaluations: Array<{
      evaluation: PrismaEvaluation;
      userId: string;
    }>
  ): Prisma.VcIssuanceRequestCreateManyInput[] {
    return evaluations.map(({ evaluation, userId }) => {
      const { claims } = this.toVCIssuanceRequestInput(evaluation);
      return {
        evaluationId: evaluation.id,
        userId,
        claims,
        credentialFormat: "JWT",
        status: VcIssuanceStatus.PENDING,
      };
    });
  }

  private validateParticipationHasOpportunity(evaluation: PrismaEvaluation) {
    const { status, evaluator } = evaluation;
    const participation = evaluation.participation;
    if (!participation) {
      throw new Error("Participation not found in evaluation");
    }

    const user = participation.user;
    if (!user) {
      throw new Error("User not found in participation");
    }

    if (!evaluator) {
      logger.error("Evaluator is missing required fields", { evaluator });
      throw new Error("Evaluator is missing required fields");
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
      throw new Error("Opportunity not found in participation");
    }

    return { status, participation, opportunity, opportunitySlot, user, evaluator };
  }
}
