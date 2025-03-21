import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationCreateInput,
  GqlQueryOpportunityInvitationsArgs,
} from "@/types/graphql";
import OpportunityInvitationConverter from "@/application/invitation/data/converter";
import OpportunityInvitationRepository from "@/application/invitation/data/repository";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import { NotFoundError } from "@/errors/graphql";
import OpportunityInvitationPresenter from "@/application/invitation/presenter";

export default class OpportunityInvitationService {
  static async fetchOpportunityInvitations(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryOpportunityInvitationsArgs,
  ) {
    const take = clampFirst(first);

    const where = OpportunityInvitationConverter.filter(filter ?? {});
    const orderBy = OpportunityInvitationConverter.sort(sort ?? {});

    const rows = await OpportunityInvitationRepository.query(ctx, where, orderBy, take + 1, cursor);

    const hasNextPage = rows.length > take;
    const data = rows.slice(0, take).map((record) => OpportunityInvitationPresenter.get(record));

    return OpportunityInvitationPresenter.query(data, hasNextPage);
  }

  static async findOpportunityInvitation(ctx: IContext, id: string) {
    return OpportunityInvitationRepository.find(ctx, id);
  }

  static async findOpportunityInvitationOrThrow(ctx: IContext, id: string) {
    const opportunityInvitation = await OpportunityInvitationRepository.find(ctx, id);
    if (!opportunityInvitation) {
      throw new NotFoundError("OpportunityInvitation", { id });
    }
    return opportunityInvitation;
  }

  static async createOpportunityInvitation(
    ctx: IContext,
    input: GqlOpportunityInvitationCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);

    const data = OpportunityInvitationConverter.create(currentUserId, input);
    return OpportunityInvitationRepository.create(data, tx);
  }

  static async disableOpportunityInvitation(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunityInvitationOrThrow(ctx, id);
    return OpportunityInvitationRepository.disable(id, false, tx);
  }
}
