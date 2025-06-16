import * as TicketLoaders from "@/application/domain/reward/ticket/controller/dataloader";
import * as TicketIssuerLoaders from "@/application/domain/reward/ticketIssuer/controller/dataloader";
import * as TicketClaimLinkLoaders from "@/application/domain/reward/ticketClaimLink/controller/dataloader";
import * as TicketStatusHistoryLoaders from "@/application/domain/reward/ticket/statusHistory/controller/dataloader";
import * as UtilityLoaders from "@/application/domain/reward/utility/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createRewardLoaders(issuer: PrismaClientIssuer) {
  return {
    ticket: TicketLoaders.createTicketLoader(issuer),
    ticketsByUtility: TicketLoaders.createTicketsByUtilityLoader(issuer),
    ticketsByWallet: TicketLoaders.createTicketsByWalletLoader(issuer),
    ticketsByClaimLink: TicketLoaders.createTicketsByTicketClaimLinkLoader(issuer),

    ticketIssuer: TicketIssuerLoaders.createTicketIssuerLoader(issuer),
    ticketClaimLink: TicketClaimLinkLoaders.createTicketClaimLinkLoader(issuer),

    ticketStatusHistory: TicketStatusHistoryLoaders.createTicketStatusHistoryLoader(issuer),
    ticketStatusHistoriesByTicket:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByTicketLoader(issuer),
    ticketStatusHistoriesByTransaction:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByTransactionLoader(issuer),
    ticketStatusHistoriesByParticipation:
      TicketStatusHistoryLoaders.createTicketStatusHistoriesByParticipationLoader(issuer),

    utility: UtilityLoaders.createUtilityLoader(issuer),
    utilitiesByOpportunity: UtilityLoaders.createRequiredUtilitiesByOpportunityLoader(issuer),
    utilitiesByCommunity: UtilityLoaders.createUtilitiesByCommunityLoader(issuer),
  };
}
