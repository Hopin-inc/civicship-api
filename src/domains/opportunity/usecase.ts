import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunityEditContentArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlOpportunitiesConnection,
  GqlOpportunity,
  GqlOpportunityCreatePayload,
  GqlOpportunityDeletePayload,
  GqlOpportunityEditContentPayload,
  GqlOpportunitySetPublishStatusPayload,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityService from "@/domains/opportunity/service";
import OpportunityOutputFormat from "@/domains/opportunity/presenter/output";
import { clampFirst } from "@/graphql/pagination";

export default class OpportunityUseCase {
  static async visitorBrowsePublicOpportunities(
    { cursor, filter, sort, first }: GqlQueryOpportunitiesArgs,
    ctx: IContext,
  ): Promise<GqlOpportunitiesConnection> {
    const take = clampFirst(first);
    const res = await OpportunityService.fetchPublicOpportunities(
      ctx,
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = res.length > take;

    const data: GqlOpportunity[] = res.slice(0, take).map((record) => {
      return OpportunityOutputFormat.get(record);
    });
    return OpportunityOutputFormat.query(data, hasNextPage);
  }

  static async visitorViewOpportunity(
    { id }: GqlQueryOpportunityArgs,
    ctx: IContext,
  ): Promise<GqlOpportunity | null> {
    const res = await OpportunityService.findOpportunity(ctx, id);
    if (!res) {
      return null;
    }
    return OpportunityOutputFormat.get(res);
  }

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

  static async managerEditOpportunityContent(
    { id, input }: GqlMutationOpportunityEditContentArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityEditContentPayload> {
    const res = await OpportunityService.editOpportunityContent(ctx, id, input);
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
