import {
  GqlMutationOpportunityInvitationCreateArgs,
  GqlMutationOpportunityInvitationDisableArgs,
  GqlMutationOpportunityInvitationDeleteArgs,
  GqlOpportunityInvitationCreatePayload,
  GqlOpportunityInvitationDisablePayload,
  GqlOpportunityInvitationDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import OpportunityInvitationService from "@/app/opportunity/invitation/service";
import OpportunityInvitationOutputFormat from "@/presen/graphql/dto/opportunity/invitation/output";

export default class OpportunityInvitationWriteUseCase {
  private static issuer = new PrismaClientIssuer();

  static async memberCreateOpportunityInvitation(
    { input }: GqlMutationOpportunityInvitationCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.createOpportunityInvitation(
        ctx,
        input,
        tx,
      );
      return OpportunityInvitationOutputFormat.create(invitation);
    });
  }

  static async memberDisableOpportunityInvitation(
    { id, input }: GqlMutationOpportunityInvitationDisableArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationDisablePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.disableOpportunityInvitation(
        ctx,
        id,
        input,
        tx,
      );
      return OpportunityInvitationOutputFormat.disable(invitation);
    });
  }

  static async memberDeleteOpportunityInvitation(
    { id }: GqlMutationOpportunityInvitationDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationDeletePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.deleteOpportunityInvitation(
        ctx,
        id,
        tx,
      );
      return OpportunityInvitationOutputFormat.delete(invitation);
    });
  }
}
