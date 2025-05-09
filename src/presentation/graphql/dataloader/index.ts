import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  createAuthorsByArticleLoader,
  createRelatedUsersByArticleLoader,
  createUserLoader,
} from "@/application/domain/account/user/controller/dataloader";
import {
  createTransactionLoader,
  createTransactionsByParticipationLoader,
  createTransactionsByWalletLoader,
} from "@/application/domain/transaction/controller/dataloader";
import {
  createOpportunitiesByArticleLoader,
  createOpportunitiesByCommunityLoader,
  createOpportunitiesByUtilityLoader,
  createOpportunitiesCreatedByUserLoader,
  createOpportunityLoader,
} from "@/application/domain/experience/opportunity/controller/dataloader";
import {
  createParticipationLoader,
  createParticipationsByCommunityLoader,
  createParticipationsByReservationLoader,
  createParticipationsByUserLoader,
} from "@/application/domain/experience/participation/controller/dataloader";
import {
  createWalletLoader,
  createWalletsByCommunityLoader,
  createWalletsByUserLoader,
} from "@/application/domain/account/wallet/controller/dataloader";
import { createCommunityLoader } from "@/application/domain/account/community/controller/dataloader";
import {
  createMembershipLoader,
  createMembershipsByCommunityLoader,
  createMembershipsByUserLoader,
} from "@/application/domain/account/membership/controller/dataloader";
import {
  createRequiredUtilitiesByOpportunityLoader,
  createUtilitiesByCommunityLoader,
  createUtilityLoader,
} from "@/application/domain/reward/utility/controller/dataloader";
import {
  createPlaceLoader,
  createPlacesByCommunityLoader,
} from "@/application/domain/location/place/controller/dataloader";
import {
  createCityByCodeLoader,
  createStateByCodeLoader,
} from "@/application/domain/location/master/controller/dataloader";
import {
  createOpportunitySlotLoader,
  createSlotsByOpportunityLoader,
} from "@/application/domain/experience/opportunitySlot/controller/dataloader";
import {
  createParticipationStatusHistoriesByParticipationLoader,
  createParticipationStatusHistoryLoader,
} from "@/application/domain/experience/participation/statusHistory/controller/dataloader";
import {
  createArticleLoader,
  createArticlesAboutMeLoader,
  createArticlesByCommunityLoader,
  createArticlesByOpportunityLoader,
  createArticlesWrittenByMeLoader,
} from "@/application/domain/content/article/controller/dataloader";
import {
  createTicketLoader,
  createTicketsByUtilityLoader,
  createTicketsByWalletLoader,
} from "@/application/domain/reward/ticket/controller/dataloader";
import { createTicketIssuerLoader } from "@/application/domain/reward/ticketIssuer/controller/dataloader";
import { createTicketClaimLinkLoader } from "@/application/domain/reward/ticketClaimLink/controller/dataloader";
import {
  createTicketStatusHistoriesByTicketLoader,
  createTicketStatusHistoryLoader,
} from "@/application/domain/reward/ticket/statusHistory/controller/dataloader";
import {
  createEvaluationLoader,
  createEvaluationsByUserLoader,
} from "@/application/domain/experience/evaluation/controller/dataloader";
import {
  createEvaluationHistoriesByEvaluationLoader,
  createEvaluationHistoriesCreatedByUserLoader,
  createEvaluationHistoryLoader,
} from "@/application/domain/experience/evaluation/evaluationHistory/controller/dataloader";
import {
  createReservationLoader,
  createReservationsByOpportunitySlotLoader,
  createReservationsCreatedByUserLoader,
} from "@/application/domain/experience/reservation/controller/dataloader";
import {
  createImageLoader,
  createImagesByOpportunityLoader,
  createImagesByParticipationLoader,
  createImagesByUtilityLoader,
} from "@/application/domain/content/image/controller/dataloader";
import {
  createIdentitiesByUserLoader,
  createIdentityLoader,
} from "@/application/domain/account/identity/controller/dataloader";
import {
  createPortfolioArticleLoader,
  createPortfolioParticipationLoader,
} from "@/application/view/controller/dataloader";
import { createMembershipHistoriesCreatedByUserLoader } from "@/application/domain/account/membership/history/controller/dataloader";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    identity: createIdentityLoader(issuer),
    identitiesByUser: createIdentitiesByUserLoader(issuer),

    user: createUserLoader(issuer),
    authorsByArticle: createAuthorsByArticleLoader(issuer),
    relatedUsersByArticle: createRelatedUsersByArticleLoader(issuer),

    community: createCommunityLoader(issuer),

    membership: createMembershipLoader(issuer),
    membershipsByUser: createMembershipsByUserLoader(issuer),
    membershipsByCommunity: createMembershipsByCommunityLoader(issuer),

    membershipHistoriesByUser: createMembershipHistoriesCreatedByUserLoader(issuer),

    wallet: createWalletLoader(issuer),
    walletsByUser: createWalletsByUserLoader(issuer),
    walletsByCommunity: createWalletsByCommunityLoader(issuer),

    opportunity: createOpportunityLoader(issuer),
    opportunitiesByArticle: createOpportunitiesByArticleLoader(issuer),
    opportunitiesByUtility: createOpportunitiesByUtilityLoader(issuer),
    opportunitiesByUser: createOpportunitiesCreatedByUserLoader(issuer),
    opportunitiesByCommunity: createOpportunitiesByCommunityLoader(issuer),

    opportunitySlot: createOpportunitySlotLoader(issuer),
    opportunitySlotByOpportunity: createSlotsByOpportunityLoader(issuer),

    reservation: createReservationLoader(issuer),
    reservationByOpportunitySlot: createReservationsByOpportunitySlotLoader(issuer),
    reservationsByUser: createReservationsCreatedByUserLoader(issuer),

    participation: createParticipationLoader(issuer),
    participationsByReservation: createParticipationsByReservationLoader(issuer),
    participationsByUser: createParticipationsByUserLoader(issuer),
    participationsByCommunity: createParticipationsByCommunityLoader(issuer),

    participationStatusHistory: createParticipationStatusHistoryLoader(issuer),
    participationStatusHistoriesByParticipation:
      createParticipationStatusHistoriesByParticipationLoader(issuer),

    evaluation: createEvaluationLoader(issuer),
    evaluationsByUser: createEvaluationsByUserLoader(issuer),

    evaluationHistory: createEvaluationHistoryLoader(issuer),
    evaluationHistoriesByEvaluation: createEvaluationHistoriesByEvaluationLoader(issuer),
    evaluationHistoriesCreatedByUser: createEvaluationHistoriesCreatedByUserLoader(issuer),

    utility: createUtilityLoader(issuer),
    utilitiesByOpportunity: createRequiredUtilitiesByOpportunityLoader(issuer),
    utilitiesByCommunity: createUtilitiesByCommunityLoader(issuer),

    ticket: createTicketLoader(issuer),
    ticketsByUtility: createTicketsByUtilityLoader(issuer),
    ticketsByWallet: createTicketsByWalletLoader(issuer),

    ticketIssuer: createTicketIssuerLoader(issuer),
    ticketClaimLink: createTicketClaimLinkLoader(issuer),

    ticketStatusHistory: createTicketStatusHistoryLoader(issuer),
    ticketStatusHistoriesByTicket: createTicketStatusHistoriesByTicketLoader(issuer),

    place: createPlaceLoader(issuer),
    placesByCommunity: createPlacesByCommunityLoader(issuer),

    city: createCityByCodeLoader(issuer),
    state: createStateByCodeLoader(issuer),

    article: createArticleLoader(issuer),
    articlesByOpportunity: createArticlesByOpportunityLoader(issuer),
    articlesWrittenByMe: createArticlesWrittenByMeLoader(issuer),
    articlesAboutMe: createArticlesAboutMeLoader(issuer),
    articlesByCommunity: createArticlesByCommunityLoader(issuer),

    image: createImageLoader(issuer),
    imagesByParticipation: createImagesByParticipationLoader(issuer),
    imagesByOpportunity: createImagesByOpportunityLoader(issuer),
    imagesByUtility: createImagesByUtilityLoader(issuer),

    portfolioArticle: createPortfolioArticleLoader(issuer),
    portfolioParticipation: createPortfolioParticipationLoader(issuer),

    transaction: createTransactionLoader(issuer),
    transactionsByParticipation: createTransactionsByParticipationLoader(issuer),
    transactionsByWallet: createTransactionsByWalletLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
