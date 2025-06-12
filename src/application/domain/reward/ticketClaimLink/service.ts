import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { ITicketClaimLinkRepository, ITicketClaimLinkService } from "./data/interface";
import { GqlQueryTicketClaimLinksArgs } from "@/types/graphql";
import { clampFirst } from "@/application/domain/utils";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";
import TicketClaimLinkConverter from "@/application/domain/reward/ticketClaimLink/data/converter";

@injectable()
export default class TicketClaimLinkService implements ITicketClaimLinkService {
  constructor(
    @inject("TicketClaimLinkRepository") private readonly repository: ITicketClaimLinkRepository,
    @inject("TicketClaimLinkConverter") private readonly converter: TicketClaimLinkConverter,
  ) {}

  async fetchTicketClaimLinks(ctx: IContext, { first, sort, filter, cursor }: GqlQueryTicketClaimLinksArgs) {
    const take = clampFirst(first);
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    const res = await this.repository.query(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => TicketClaimLinkPresenter.get(record));
    return TicketClaimLinkPresenter.query(data, hasNextPage);
  }

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

    if (link.status === "CLAIMED") {
      throw new ValidationError("This claim link has already been used.");
    }

    if (link.status === "EXPIRED") {
      throw new ValidationError("This claim link has expired.");
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
        status: "CLAIMED",
        claimedAt: new Date(),
      },
      tx,
    );
  }
}
