import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunitySetPublishStatusPayload,
  GqlOpportunityUpdateContentPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityService from "@/app/opportunity/service";
import OpportunityOutputFormat from "@/presen/graphql/dto/opportunity/output";

export default class OpportunityWriteUseCase {
  static async managerCreateOpportunity(
    { input }: GqlMutationOpportunityCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityCreatePayload> {
    const res = await OpportunityService.createOpportunity(ctx, input);
    return OpportunityOutputFormat.create(res);
  }

  static async managerDeleteOpportunity(
    { id }: GqlMutationOpportunityDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityDeletePayload> {
    const res = await OpportunityService.deleteOpportunity(ctx, id);
    return OpportunityOutputFormat.delete(res);
  }

  static async managerUpdateOpportunityContent(
    { id, input }: GqlMutationOpportunityUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityUpdateContentPayload> {
    const res = await OpportunityService.updateOpportunityContent(ctx, id, input);
    return OpportunityOutputFormat.update(res);
  }

  static async managerSetOpportunityPublishStatus(
    { id, input }: GqlMutationOpportunitySetPublishStatusArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitySetPublishStatusPayload> {
    const res = await OpportunityService.setOpportunityStatus(ctx, id, input.status);
    return OpportunityOutputFormat.setPublishStatus(res);
  }
}
