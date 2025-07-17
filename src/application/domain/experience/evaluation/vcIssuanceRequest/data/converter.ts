import { EvaluationCredentialPayload, VCClaimsData } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";
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

  createManyInputs(
    evaluations: Array<{
      evaluation: PrismaEvaluation;
      userId: string;
    }>
  ): Prisma.VcIssuanceRequestCreateManyInput[] {
    return evaluations.map(({ evaluation, userId }) => {
      const detailedClaims = this.createDetailedClaims(evaluation);
      return {
        evaluationId: evaluation.id,
        userId,
        claims: detailedClaims,
        credentialFormat: "JWT",
        status: VcIssuanceStatus.PENDING,
      };
    });
  }

  private createDetailedClaims(evaluation: PrismaEvaluation): VCClaimsData {
    const { participation, opportunity, userId } = this.validateParticipationHasOpportunity(evaluation);
    const user = participation.user;

    const claims: VCClaimsData = {
      type: "EvaluationCredential",
      score: evaluation.status.toString(),
      participationId: evaluation.participationId,
      evaluationId: evaluation.id,
      evaluator: {
        id: userId, // Use the current user as evaluator since we don't have createdBy
        name: "Manager",
      },
      participant: {
        id: userId,
        name: user?.name || "Unknown",
        slug: user?.slug || "unknown",
      },
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        category: opportunity.category.toString(),
        pointsToEarn: opportunity.pointsToEarn || 0,
      },
    };

    if (evaluation.comment) {
      claims.comment = evaluation.comment;
    }

    return claims;
  }

  private validateParticipationHasOpportunity(evaluation: PrismaEvaluation) {
    const participation = evaluation.participation;
    if (!participation) {
      throw new Error("Participation not found in evaluation");
    }

    const opportunity = participation.reservation?.opportunitySlot?.opportunity || 
                       participation.opportunitySlot?.opportunity;
    if (!opportunity) {
      throw new Error("Opportunity not found in participation");
    }

    const userId = participation.userId;
    if (!userId) {
      throw new Error("User ID not found in participation");
    }

    return { participation, opportunity, userId };
  }
}
