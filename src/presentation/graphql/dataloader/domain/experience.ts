import * as ParticipationLoaders from "@/application/domain/experience/participation/controller/dataloader";
import * as ParticipationStatusHistoryLoaders from "@/application/domain/experience/participation/statusHistory/controller/dataloader";
import * as OpportunityLoaders from "@/application/domain/experience/opportunity/controller/dataloader";
import * as OpportunitySlotLoaders from "@/application/domain/experience/opportunitySlot/controller/dataloader";
import * as ReservationLoaders from "@/application/domain/experience/reservation/controller/dataloader";
import * as EvaluationLoaders from "@/application/domain/experience/evaluation/controller/dataloader";
import * as EvaluationHistoryLoaders from "@/application/domain/experience/evaluation/evaluationHistory/controller/dataloader";
import * as VcIssuanceRequestLoaders from "@/application/domain/experience/evaluation/vcIssuanceRequest/controller/dataloader";
import { PrismaClient } from "@prisma/client";

export function createExperienceLoaders(prisma: PrismaClient) {
  return {
    opportunity: OpportunityLoaders.createOpportunityLoader(prisma),
    opportunitiesByArticle: OpportunityLoaders.createOpportunitiesByArticleLoader(prisma),
    opportunitiesByUtility: OpportunityLoaders.createOpportunitiesByUtilityLoader(prisma),
    opportunitiesByUser: OpportunityLoaders.createOpportunitiesCreatedByUserLoader(prisma),
    opportunitiesByCommunity: OpportunityLoaders.createOpportunitiesByCommunityLoader(prisma),
    opportunitiesByPlace: OpportunityLoaders.createOpportunitiesByPlaceLoader(prisma),

    isReservableWithTicket: OpportunityLoaders.createIsReservableWithTicketLoader(prisma),

    opportunitySlot: OpportunitySlotLoaders.createOpportunitySlotLoader(prisma),
    opportunitySlotByOpportunity: OpportunitySlotLoaders.createSlotsByOpportunityLoader(prisma),

    reservation: ReservationLoaders.createReservationLoader(prisma),
    reservationByOpportunitySlot:
      ReservationLoaders.createReservationsByOpportunitySlotLoader(prisma),
    reservationsByUser: ReservationLoaders.createReservationsCreatedByUserLoader(prisma),

    participation: ParticipationLoaders.createParticipationLoader(prisma),
    participationsByReservation:
      ParticipationLoaders.createParticipationsByReservationLoader(prisma),
    participationsByUser: ParticipationLoaders.createParticipationsByUserLoader(prisma),
    participationsByCommunity: ParticipationLoaders.createParticipationsByCommunityLoader(prisma),

    participationStatusHistory:
      ParticipationStatusHistoryLoaders.createParticipationStatusHistoryLoader(prisma),
    participationStatusHistoriesByParticipation:
      ParticipationStatusHistoryLoaders.createParticipationStatusHistoriesByParticipationLoader(
        issuer,
      ),

    evaluation: EvaluationLoaders.createEvaluationLoader(prisma),
    evaluationsByUser: EvaluationLoaders.createEvaluationsByUserLoader(prisma),

    evaluationHistory: EvaluationHistoryLoaders.createEvaluationHistoryLoader(prisma),
    evaluationHistoriesByEvaluation:
      EvaluationHistoryLoaders.createEvaluationHistoriesByEvaluationLoader(prisma),
    evaluationHistoriesCreatedByUser:
      EvaluationHistoryLoaders.createEvaluationHistoriesCreatedByUserLoader(prisma),

    vcIssuanceRequestByEvaluation: VcIssuanceRequestLoaders.createVcIssuanceRequestByEvaluationLoader(prisma),
  };
}
