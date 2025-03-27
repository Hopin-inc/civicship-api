import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createUserLoader } from "@/application/domain/user/controller/dataloader";
import { createTransactionLoader } from "@/application/domain/transaction/controller/dataloader";
import { createOpportunityLoader } from "@/application/domain/opportunity/controller/dataloader";
import { createParticipationLoader } from "@/application/domain/participation/controller/dataloader";
import { createWalletLoader } from "@/application/domain/membership/wallet/controller/dataloader";
import { createCommunityLoader } from "@/application/domain/community/controller/dataloader";
import { createMembershipLoader } from "@/application/domain/membership/controller/dataloader";
import { createUtilityLoader } from "@/application/domain/utility/controller/dataloader";
import { createPlaceLoader } from "@/application/domain/place/controller/dataloader";
import { createOpportunitySlotLoader } from "@/application/domain/opportunitySlot/controller/dataloader";
import { createParticipationStatusHistoryLoader } from "@/application/domain/participation/statusHistory/controller/dataloader";
import { createArticleLoader } from "@/application/domain/article/controller/dataloader";
import { createTicketLoader } from "@/application/domain/ticket/controller/dataloader";
import { createTicketStatusHistoryLoader } from "@/application/domain/ticket/statusHistory/controller/dataloader";
import { createEvaluationLoader } from "@/application/domain/evaluation/controller/dataloader";
import { createEvaluationHistoryLoader } from "@/application/domain/evaluation/evaluationHistory/controller/dataloader";
import { createReservationLoader } from "@/application/domain/reservation/controller/dataloader";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    user: createUserLoader(issuer),
    community: createCommunityLoader(issuer),

    membership: createMembershipLoader(issuer),
    wallet: createWalletLoader(issuer),

    opportunity: createOpportunityLoader(issuer),
    opportunitySlot: createOpportunitySlotLoader(issuer),

    reservation: createReservationLoader(issuer),

    participation: createParticipationLoader(issuer),
    participationStatusHistory: createParticipationStatusHistoryLoader(issuer),

    evaluation: createEvaluationLoader(issuer),
    evaluationHistory: createEvaluationHistoryLoader(issuer),

    utility: createUtilityLoader(issuer),
    ticket: createTicketLoader(issuer),
    ticketStatusHistory: createTicketStatusHistoryLoader(issuer),

    place: createPlaceLoader(issuer),
    article: createArticleLoader(issuer),

    transaction: createTransactionLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
