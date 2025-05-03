import { GqlQueryTicketIssuerArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import TicketIssuerUseCase from "@/application/domain/reward/ticketIssuer/usecase";
import { PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";

@injectable()
export default class TicketIssuerResolver {
  constructor(@inject("TicketIssuerUseCase") private readonly usecase: TicketIssuerUseCase) {}

  Query = {
    ticketIssuer: (_: unknown, args: GqlQueryTicketIssuerArgs, ctx: IContext) => {
      if (!ctx.loaders?.ticketIssuer) {
        return this.usecase.findTicketIssuer(ctx, args.id);
      }
      return ctx.loaders.ticketIssuer.load(args.id);
    },
  };

  TicketIssuer = {
    utility: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.utilityId && ctx.loaders?.utility ? ctx.loaders.utility.load(parent.utilityId) : null;
    },
    
    owner: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.ownerId && ctx.loaders?.user ? ctx.loaders.user.load(parent.ownerId) : null;
    },
    
    claimLink: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.claimLinkId && ctx.loaders?.ticketClaimLink ? ctx.loaders.ticketClaimLink.load(parent.claimLinkId) : null;
    },
  };
}
