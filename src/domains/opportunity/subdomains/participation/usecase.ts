import {
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApproveApplicationArgs,
  GqlMutationParticipationApproveInvitationArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelInvitationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyInvitationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlMutationParticipationInviteArgs,
  GqlParticipation,
  GqlParticipationApplyPayload,
  GqlParticipationInvitePayload,
  GqlParticipationsConnection,
  GqlParticipationSetStatusPayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/domains/opportunity/subdomains/participation/service";
import ParticipationOutputFormat from "@/domains/opportunity/subdomains/participation/presenter/output";
import { clampFirst } from "@/graphql/pagination";

export default class ParticipationUseCase {
  static async visitorBrowseParticipations(
    { cursor, filter, sort, first }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);
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

  static async memberInviteUserToOpportunity(
    { input }: GqlMutationParticipationInviteArgs,
    ctx: IContext,
  ): Promise<GqlParticipationInvitePayload> {
    const res = await ParticipationService.inviteParticipation(ctx, input);
    return ParticipationOutputFormat.invite(res);
  }

  static async memberCancelInvitation(
    { id }: GqlMutationParticipationCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.cancelInvitation(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async userApproveInvitation(
    { id }: GqlMutationParticipationApproveInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.approveInvitation(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async userDenyInvitation(
    { id }: GqlMutationParticipationDenyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyInvitation(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async userApplyForOpportunity(
    { input }: GqlMutationParticipationApplyArgs,
    ctx: IContext,
  ): Promise<GqlParticipationApplyPayload> {
    const res = await ParticipationService.applyParticipation(ctx, input);
    return ParticipationOutputFormat.apply(res);
  }

  static async userCancelApplication(
    { id }: GqlMutationParticipationCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.cancelApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerApproveApplication(
    { id }: GqlMutationParticipationApproveApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.approveApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerDenyApplication(
    { id }: GqlMutationParticipationDenyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  // static async memberSubmitOutput(
  //   { id }: GqlMutationParticipationSubmitOutputArgs,
  //   ctx: IContext,
  // ): Promise<GqlParticipationSetStatusPayload> {
  //   const res = await ParticipationService.submitOutput(ctx, id);
  //   return ParticipationOutputFormat.setStatus(res);
  // }
  //
  // static async memberCancelSubmission(
  //   { id }: GqlMutationParticipationCancelSubmissionArgs,
  //   ctx: IContext,
  // ): Promise<GqlParticipationSetStatusPayload> {
  //   const res = await ParticipationService.cancelSubmission(ctx, id);
  //   return ParticipationOutputFormat.setStatus(res);
  // }

  static async managerApprovePerformance(
    { id }: GqlMutationParticipationApprovePerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.approvePerformance(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerDenyPerformance(
    { id }: GqlMutationParticipationDenyPerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyPerformance(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }
}
