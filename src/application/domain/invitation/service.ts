import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationCreateInput,
  GqlQueryOpportunityInvitationsArgs,
} from "@/types/graphql";
import OpportunityInvitationConverter from "@/application/domain/invitation/data/converter";
import OpportunityInvitationRepository from "@/application/domain/invitation/data/repository";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError } from "@/errors/graphql";

export default class OpportunityInvitationService {
  static async fetchOpportunityInvitations(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunityInvitationsArgs,
    take: number,
  ) {
    const where = OpportunityInvitationConverter.filter(filter ?? {});
    const orderBy = OpportunityInvitationConverter.sort(sort ?? {});

    return await OpportunityInvitationRepository.query(ctx, where, orderBy, take, cursor);
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
