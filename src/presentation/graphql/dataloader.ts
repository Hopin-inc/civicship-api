import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createUserLoader } from "@/application/domain/account/user/controller/dataloader";
import { createTransactionLoader } from "@/application/domain/transaction/controller/dataloader";
import { createOpportunityLoader } from "@/application/domain/experience/opportunity/controller/dataloader";
import { createParticipationLoader } from "@/application/domain/experience/participation/controller/dataloader";
import { createWalletLoader } from "@/application/domain/account/wallet/controller/dataloader";
import { createCommunityLoader } from "@/application/domain/account/community/controller/dataloader";
import { createMembershipLoader } from "@/application/domain/account/membership/controller/dataloader";
import { createUtilityLoader } from "@/application/domain/reward/utility/controller/dataloader";
import { createPlaceLoader } from "@/application/domain/location/place/controller/dataloader";
import { createCityLoader, createCityByCodeLoader, createStateByCodeLoader } from "@/application/domain/location/master/controller/dataloader";
import { createOpportunitySlotLoader } from "@/application/domain/experience/opportunitySlot/controller/dataloader";
import { createParticipationStatusHistoryLoader } from "@/application/domain/experience/participation/statusHistory/controller/dataloader";
import { createArticleLoader } from "@/application/domain/content/article/controller/dataloader";
import { createTicketLoader } from "@/application/domain/reward/ticket/controller/dataloader";
import { createTicketIssuerLoader } from "@/application/domain/reward/ticketIssuer/controller/dataloader";
import { createTicketClaimLinkLoader } from "@/application/domain/reward/ticketClaimLink/controller/dataloader";
import { createTicketStatusHistoryLoader } from "@/application/domain/reward/ticket/statusHistory/controller/dataloader";
import { createEvaluationLoader } from "@/application/domain/experience/evaluation/controller/dataloader";
import { createEvaluationHistoryLoader } from "@/application/domain/experience/evaluation/evaluationHistory/controller/dataloader";
import { createReservationLoader } from "@/application/domain/experience/reservation/controller/dataloader";

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
    ticketIssuer: createTicketIssuerLoader(issuer),
    ticketClaimLink: createTicketClaimLinkLoader(issuer),
    ticketStatusHistory: createTicketStatusHistoryLoader(issuer),

    place: createPlaceLoader(issuer),
    city: createCityLoader(issuer),
    cityByCode: createCityByCodeLoader(issuer),
    stateByCode: createStateByCodeLoader(issuer),
    article: createArticleLoader(issuer),

    transaction: createTransactionLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
