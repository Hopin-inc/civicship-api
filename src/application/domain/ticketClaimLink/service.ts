import { IContext } from "@/types/server";
import TicketClaimLinkRepository from "@/application/domain/ticketClaimLink/data/repository";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { PrismaTicketClaimLink } from "@/application/domain/ticketClaimLink/data/type";
import { ClaimLinkStatus, Prisma } from "@prisma/client";

export default class TicketClaimLinkService {
  static async findTicketClaimLink(
    ctx: IContext,
    id: string,
  ): Promise<PrismaTicketClaimLink | null> {
    return await TicketClaimLinkRepository.find(ctx, id);
  }

  static async findTicketClaimLinkOrThrow(
    ctx: IContext,
    id: string,
  ): Promise<PrismaTicketClaimLink> {
    const link = await TicketClaimLinkRepository.find(ctx, id);
    if (!link) {
      throw new NotFoundError("TicketClaimLink", { id });
    }
    return link;
  }

  static async validateBeforeClaim(ctx: IContext, id: string): Promise<PrismaTicketClaimLink> {
    const link = await TicketClaimLinkRepository.find(ctx, id);

    if (!link) {
      throw new NotFoundError("TicketClaimLink", { id });
    }

    if (link.status === ClaimLinkStatus.CLAIMED) {
      throw new ValidationError("This claim link has already been used.");
    }

    if (link.status === ClaimLinkStatus.EXPIRED) {
      throw new ValidationError("This claim link has expired.");
    }

    return link;
  }

  static async markAsClaimed(
    ctx: IContext,
    claimLinkId: string,
    qty: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await TicketClaimLinkRepository.update(
      ctx,
      claimLinkId,
      {
        qty,
        status: ClaimLinkStatus.CLAIMED,
        claimedAt: new Date(),
      },
      tx,
    );
  }
}
