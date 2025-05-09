import * as ParticipationLoaders from "@/application/domain/experience/participation/controller/dataloader";
import * as ParticipationStatusHistoryLoaders from "@/application/domain/experience/participation/statusHistory/controller/dataloader";
import * as OpportunityLoaders from "@/application/domain/experience/opportunity/controller/dataloader";
import * as OpportunitySlotLoaders from "@/application/domain/experience/opportunitySlot/controller/dataloader";
import * as ReservationLoaders from "@/application/domain/experience/reservation/controller/dataloader";
import * as EvaluationLoaders from "@/application/domain/experience/evaluation/controller/dataloader";
import * as EvaluationHistoryLoaders from "@/application/domain/experience/evaluation/evaluationHistory/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createExperienceLoaders(issuer: PrismaClientIssuer) {
  return {
    opportunity: OpportunityLoaders.createOpportunityLoader(issuer),
    opportunitiesByArticle: OpportunityLoaders.createOpportunitiesByArticleLoader(issuer),
    opportunitiesByUtility: OpportunityLoaders.createOpportunitiesByUtilityLoader(issuer),
    opportunitiesByUser: OpportunityLoaders.createOpportunitiesCreatedByUserLoader(issuer),
    opportunitiesByCommunity: OpportunityLoaders.createOpportunitiesByCommunityLoader(issuer),
    opportunitiesByPlace: OpportunityLoaders.createOpportunitiesByPlaceLoader(issuer),

    opportunitySlot: OpportunitySlotLoaders.createOpportunitySlotLoader(issuer),
    opportunitySlotByOpportunity: OpportunitySlotLoaders.createSlotsByOpportunityLoader(issuer),

    reservation: ReservationLoaders.createReservationLoader(issuer),
    reservationByOpportunitySlot:
      ReservationLoaders.createReservationsByOpportunitySlotLoader(issuer),
    reservationsByUser: ReservationLoaders.createReservationsCreatedByUserLoader(issuer),

    participation: ParticipationLoaders.createParticipationLoader(issuer),
    participationsByReservation:
      ParticipationLoaders.createParticipationsByReservationLoader(issuer),
    participationsByUser: ParticipationLoaders.createParticipationsByUserLoader(issuer),
    participationsByCommunity: ParticipationLoaders.createParticipationsByCommunityLoader(issuer),

    participationStatusHistory:
      ParticipationStatusHistoryLoaders.createParticipationStatusHistoryLoader(issuer),
    participationStatusHistoriesByParticipation:
      ParticipationStatusHistoryLoaders.createParticipationStatusHistoriesByParticipationLoader(
        issuer,
      ),

    evaluation: EvaluationLoaders.createEvaluationLoader(issuer),
    evaluationsByUser: EvaluationLoaders.createEvaluationsByUserLoader(issuer),

    evaluationHistory: EvaluationHistoryLoaders.createEvaluationHistoryLoader(issuer),
    evaluationHistoriesByEvaluation:
      EvaluationHistoryLoaders.createEvaluationHistoriesByEvaluationLoader(issuer),
    evaluationHistoriesCreatedByUser:
      EvaluationHistoryLoaders.createEvaluationHistoriesCreatedByUserLoader(issuer),
  };
}
