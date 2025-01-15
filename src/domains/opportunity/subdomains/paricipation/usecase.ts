import {
  GqlMutationParticipationSetApplyArgs,
  GqlMutationParticipationSetApproveArgs,
  GqlMutationParticipationSetCancelArgs,
  GqlMutationParticipationSetDenyArgs,
  GqlMutationParticipationSetNotParticipatingArgs,
  GqlMutationParticipationSetParticipatingArgs,
  GqlParticipation,
  GqlParticipationApplyPayload,
  GqlParticipationsConnection,
  GqlParticipationSetStatusPayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/domains/opportunity/subdomains/paricipation/service";
import ParticipationOutputFormat from "@/domains/opportunity/subdomains/paricipation/presenter/output";

export default class ParticipationUseCase {
  static async visitorBrowseParticipations(
    { cursor, filter, sort, first }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    const take = first ?? 10;
    const res = await ParticipationService.fetchParticipations(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlParticipation[] = res.slice(0, take).map((record) => {
      return ParticipationOutputFormat.get(record);
    });
    return ParticipationOutputFormat.query(data, hasNextPage);
  }

  static async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await ParticipationService.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationOutputFormat.get(res);
  }

  static async userApplyForOpportunity(
    { input }: GqlMutationParticipationSetApplyArgs,
    ctx: IContext,
  ): Promise<GqlParticipationApplyPayload> {
    const res = await ParticipationService.applyParticipation(ctx, input);
    return ParticipationOutputFormat.apply(res);
  }

  static async userCancelApplication(
    { id }: GqlMutationParticipationSetCancelArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.cancelApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerApproveApplication(
    { id }: GqlMutationParticipationSetParticipatingArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.approveApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerDenyApplication(
    { id }: GqlMutationParticipationSetNotParticipatingArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerApprovePerformance(
    { id }: GqlMutationParticipationSetApproveArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.approvePerformance(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerDenyPerformance(
    { id }: GqlMutationParticipationSetDenyArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyPerformance(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }
}
