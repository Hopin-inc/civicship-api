import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { NotFoundError, AlreadyUsedClaimLinkError, ClaimLinkExpiredError } from "@/errors/graphql";
import { ClaimLinkStatus } from "@prisma/client";
import { ITicketClaimLinkRepository, ITicketClaimLinkService } from "./data/interface";

@injectable()
export default class TicketClaimLinkService implements ITicketClaimLinkService {
  constructor(
    @inject("TicketClaimLinkRepository") private readonly repository: ITicketClaimLinkRepository,
  ) {}

  async findTicketClaimLink(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findTicketClaimLinkOrThrow(ctx: IContext, id: string) {
    const link = await this.repository.find(ctx, id);
    if (!link) {
      throw new NotFoundError("TicketClaimLink", { id });
    }
    return link;
  }

  async validateBeforeClaim(ctx: IContext, id: string) {
    const link = await this.repository.find(ctx, id);

    if (!link) {
      throw new NotFoundError("TicketClaimLink", { id });
    }

    if (link.status === ClaimLinkStatus.CLAIMED) {
      throw new AlreadyUsedClaimLinkError();
    }

    if (link.status === ClaimLinkStatus.EXPIRED) {
      throw new ClaimLinkExpiredError();
    }

    return link;
  }

  async markAsClaimed(
    ctx: IContext,
    claimLinkId: string,
    qty: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.repository.update(
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
