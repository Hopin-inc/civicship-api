import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationCreateInput,
  GqlOpportunityInvitationDisableInput,
  GqlQueryOpportunityInvitationsArgs,
} from "@/types/graphql";
import OpportunityInvitationInputFormat from "@/presentation/graphql/dto/opportunity/invitation/input";
import OpportunityInvitationRepository from "@/infra/repositories/opportunity/invitation";
import { getCurrentUserId } from "@/utils";

export default class OpportunityInvitationService {
  static async fetchOpportunityInvitations(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryOpportunityInvitationsArgs,
    take: number,
  ) {
    const where = OpportunityInvitationInputFormat.filter(filter ?? {});
    const orderBy = OpportunityInvitationInputFormat.sort(sort ?? {});
    return OpportunityInvitationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunityInvitation(ctx: IContext, id: string) {
    return OpportunityInvitationRepository.find(ctx, id);
  }

  static async createOpportunityInvitation(
    ctx: IContext,
    input: GqlOpportunityInvitationCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const userId = getCurrentUserId(ctx);

    const data = OpportunityInvitationInputFormat.create(userId, input);
    return OpportunityInvitationRepository.create(ctx, data, tx);
  }

  static async disableOpportunityInvitation(
    ctx: IContext,
    id: string,
    input: GqlOpportunityInvitationDisableInput,
    tx: Prisma.TransactionClient,
  ) {
    return OpportunityInvitationRepository.disable(ctx, id, false, tx);
  }

  static async deleteOpportunityInvitation(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    return OpportunityInvitationRepository.delete(ctx, id, tx);
  }
}
