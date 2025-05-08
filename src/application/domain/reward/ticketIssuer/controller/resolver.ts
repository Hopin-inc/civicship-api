import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { PrismaTicketIssuerDetail } from "@/application/domain/reward/ticketIssuer/data/type";

@injectable()
export default class TicketIssuerResolver {
  TicketIssuer = {
    utility: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.utilityId
        ? ctx.loaders.utility.load(parent.utilityId)
        : null;
    },

    owner: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.ownerId ? ctx.loaders.user.load(parent.ownerId) : null;
    },

    claimLink: (parent: PrismaTicketIssuerDetail, _: unknown, ctx: IContext) => {
      return parent.claimLinkId
        ? ctx.loaders.ticketClaimLink.load(parent.claimLinkId)
        : null;
    },
  };
}
