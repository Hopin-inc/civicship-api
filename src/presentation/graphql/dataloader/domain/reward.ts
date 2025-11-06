import * as TicketLoaders from "@/application/domain/reward/ticket/controller/dataloader";
import * as TicketIssuerLoaders from "@/application/domain/reward/ticketIssuer/controller/dataloader";
import * as TicketClaimLinkLoaders from "@/application/domain/reward/ticketClaimLink/controller/dataloader";
import * as TicketStatusHistoryLoaders from "@/application/domain/reward/ticket/statusHistory/controller/dataloader";
import * as UtilityLoaders from "@/application/domain/reward/utility/controller/dataloader";
import { PrismaClient } from "@prisma/client";

export function createRewardLoaders(prisma: PrismaClient) {
  return {
    ticket: TicketLoaders.createTicketLoader(prisma),
    ticketsByUtility: TicketLoaders.createTicketsByUtilityLoader(prisma),
    ticketsByWallet: TicketLoaders.createTicketsByWalletLoader(prisma),
    ticketsByClaimLink: TicketLoaders.createTicketsByTicketClaimLinkLoader(prisma),

    ticketIssuer: TicketIssuerLoaders.createTicketIssuerLoader(prisma),
    ticketClaimLink: TicketClaimLinkLoaders.createTicketClaimLinkLoader(prisma),

    ticketStatusHistory: TicketStatusHistoryLoaders.createTicketStatusHistoryLoader(prisma),
    ticketStatusHistoriesByTicket:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByTicketLoader(prisma),
    ticketStatusHistoriesByTransaction:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByTransactionLoader(prisma),
    ticketStatusHistoriesByParticipation:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByParticipationLoader(prisma),

    utility: UtilityLoaders.createUtilityLoader(prisma),
    utilitiesByOpportunity: UtilityLoaders.createRequiredUtilitiesByOpportunityLoader(prisma),
    utilitiesByCommunity: UtilityLoaders.createUtilitiesByCommunityLoader(prisma),
  };
}
