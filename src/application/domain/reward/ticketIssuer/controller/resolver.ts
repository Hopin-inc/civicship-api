import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import { PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";
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
      return this.ticketIssuerUseCase.visitorViewTicketIssuer(ctx, args);
    },
  };

  TicketIssuer = {
    utility: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.utilityId ? ctx.loaders.utility.load(parent.utilityId) : null;
    },

    owner: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.ownerId ? ctx.loaders.user.load(parent.ownerId) : null;
    },
  };
}
