import { GqlQueryTicketClaimLinkArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import TicketClaimLinkUseCase from "@/application/domain/reward/ticketClaimLink/usecase";
import { PrismaTicketClaimLinkDetail } from "@/application/domain/reward/ticketClaimLink/data/type";

@injectable()
export default class TicketClaimLinkResolver {
  constructor(@inject("TicketClaimLinkUseCase") private readonly usecase: TicketClaimLinkUseCase) {}

  Query = {
    ticketClaimLink: async (_: unknown, args: GqlQueryTicketClaimLinkArgs, ctx: IContext) => {
      if (!ctx.loaders?.ticketClaimLink) {
        return this.usecase.visitorViewTicketClaimLink(ctx, args.id);
      }
      return ctx.loaders.ticketClaimLink.load(args.id);
    },
  };
  
  TicketClaimLink = {
    issuer: (parent: PrismaTicketClaimLinkDetail, _: unknown, ctx: IContext) => {
      return parent.issuerId && ctx.loaders?.ticketIssuer ? ctx.loaders.ticketIssuer.load(parent.issuerId) : null;
    },
  };
}
