import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import { PrismaTicketIssuer } from "@/application/domain/reward/ticketIssuer/data/type";
import { GqlQueryTicketIssuerArgs, GqlQueryTicketIssuersArgs } from "@/types/graphql";
import { TicketIssuerUseCase } from "@/application/domain/reward/ticketIssuer/usecase";

@injectable()
export default class TicketIssuerResolver {
  constructor(
    @inject("TicketIssuerUseCase") private readonly ticketIssuerUseCase: TicketIssuerUseCase,
  ) {}

  Query = {
    ticketIssuers: (_: unknown, args: GqlQueryTicketIssuersArgs, ctx: IContext) => {
      return this.ticketIssuerUseCase.visitorBrowseTicketIssuers(ctx, args);
    },

    ticketIssuer: (_: unknown, args: GqlQueryTicketIssuerArgs, ctx: IContext) => {
      return ctx.loaders.ticketIssuer.load(args.id); // ← N+1 回避の DataLoader 利用
    },
  };

  TicketIssuer = {
    utility: (parent: PrismaTicketIssuer, _: unknown, ctx: IContext) => {
      return parent.utility || (parent.utilityId ? ctx.loaders.utility.load(parent.utilityId) : null);
    },

    owner: (parent: PrismaTicketIssuer, _: unknown, ctx: IContext) => {
      return parent.owner || (parent.ownerId ? ctx.loaders.user.load(parent.ownerId) : null);
    },

    claimLink: (parent: PrismaTicketIssuer, _: unknown, ctx: IContext) => {
      return parent.claimLink || (parent.claimLinkId ? ctx.loaders.ticketClaimLink.load(parent.claimLinkId) : null);
    },
  };
}
