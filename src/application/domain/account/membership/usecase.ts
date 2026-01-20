import {
  GqlQueryMembershipsArgs,
  GqlMembershipsConnection,
  GqlMutationMembershipInviteArgs,
  GqlMutationMembershipCancelInvitationArgs,
  GqlMutationMembershipAcceptMyInvitationArgs,
  GqlMutationMembershipDenyMyInvitationArgs,
  GqlMutationMembershipWithdrawArgs,
  GqlMutationMembershipRemoveArgs,
  GqlMutationMembershipAssignOwnerArgs,
  GqlMutationMembershipAssignManagerArgs,
  GqlMutationMembershipAssignMemberArgs,
  GqlQueryMembershipArgs,
  GqlMembership,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import MembershipPresenter from "@/application/domain/account/membership/presenter";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";
import NotificationService from "@/application/domain/notification/service";
import IncentiveGrantService from "@/application/domain/transaction/incentiveGrant/service";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import CommunityService from "@/application/domain/account/community/service";
import logger from "@/infrastructure/logging";
import { inject, injectable } from "tsyringe";

@injectable()
export default class MembershipUseCase {
  constructor(
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("NotificationService")
    private readonly notificationService: NotificationService,
    @inject("IncentiveGrantService")
    private readonly incentiveGrantService: IncentiveGrantService,
    @inject("TransactionService")
    private readonly transactionService: ITransactionService,
    @inject("CommunityService")
    private readonly communityService: CommunityService,
  ) {}

  async visitorBrowseMemberships(
    args: GqlQueryMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    const take = clampFirst(args.first);
    const records = await this.membershipService.fetchMemberships(ctx, args, take);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take);
    return MembershipPresenter.query(data, hasNextPage, args.cursor ? args.cursor.userId + "_" + args.cursor.communityId : undefined);
  }

  async visitorViewMembership(
    args: GqlQueryMembershipArgs,
    ctx: IContext,
  ): Promise<GqlMembership | null> {
    const membership = await this.membershipService.findMembershipDetail(
      ctx,
      args.userId,
      args.communityId,
    );
    return membership ? MembershipPresenter.get(membership) : null;
  }

  async ownerInviteMember(args: GqlMutationMembershipInviteArgs, ctx: IContext) {
    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.membershipService.inviteMember(ctx, args.input, tx);
    });
    return MembershipPresenter.invite(membership);
  }

  async ownerCancelInvitation(args: GqlMutationMembershipCancelInvitationArgs, ctx: IContext) {
    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.membershipService.setStatus(
        ctx,
        args.input,
        MembershipStatus.LEFT,
        MembershipStatusReason.CANCELED_INVITATION,
        tx,
      );
    });
    return MembershipPresenter.setInvitationStatus(membership);
  }

  async userAcceptMyInvitation(args: GqlMutationMembershipAcceptMyInvitationArgs, ctx: IContext) {
    const currentUserId = getCurrentUserId(ctx);

    // Use composite key as sourceId for idempotency
    const membershipSourceId = `${currentUserId}_${args.input.communityId}`;

    // Execute membership initialization and signup bonus grant in transaction
    const { membership, signupBonusResult } = await ctx.issuer.public(ctx, async (tx) => {
      const membership = await this.membershipService.joinIfNeeded(
        ctx,
        currentUserId,
        args.input.communityId,
        tx,
      );
      await this.walletService.createMemberWalletIfNeeded(
        ctx,
        currentUserId,
        args.input.communityId,
        tx,
      );

      // Grant signup bonus if enabled (returns transaction details)
      const signupBonusResult = await this.incentiveGrantService.grantSignupBonusIfEnabled(
        ctx,
        currentUserId,
        args.input.communityId,
        membershipSourceId,
        tx,
      );

      return { membership, signupBonusResult };
    });

    // Refresh materialized view
    await ctx.issuer.internal(async (tx) => {
      await this.transactionService.refreshCurrentPoint(ctx, tx);
    });

    // Switch rich menu
    await this.notificationService.switchRichMenuByRole(ctx, membership);

    // Send signup bonus notification (best-effort, after transaction commits)
    if (signupBonusResult.granted && signupBonusResult.transaction) {
      const community = await this.communityService.findCommunityOrThrow(ctx, args.input.communityId);
      this.notificationService
        .pushSignupBonusGrantedMessage(
          ctx,
          signupBonusResult.transaction.id,
          signupBonusResult.transaction.toPointChange,
          signupBonusResult.transaction.comment,
          community.name,
          currentUserId,
        )
        .catch((error) => {
          logger.error("Failed to send signup bonus notification", {
            transactionId: signupBonusResult.transaction!.id,
            userId: currentUserId,
            communityId: args.input.communityId,
            error,
          });
        });
    }

    return MembershipPresenter.setInvitationStatus(membership);
  }

  async userDenyMyInvitation(args: GqlMutationMembershipDenyMyInvitationArgs, ctx: IContext) {
    const userId = getCurrentUserId(ctx);

    const membership = await ctx.issuer.public(ctx, async (tx) => {
      return await this.membershipService.setStatus(
        ctx,
        { userId, communityId: args.input.communityId },
        MembershipStatus.LEFT,
        MembershipStatusReason.DECLINED_INVITATION,
        tx,
      );
    });

    return MembershipPresenter.setInvitationStatus(membership);
  }

  async memberWithdrawCommunity(args: GqlMutationMembershipWithdrawArgs, ctx: IContext) {
    const userId = getCurrentUserId(ctx);

    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const membership = await this.membershipService.deleteMembership(
        ctx,
        tx,
        userId,
        args.input.communityId,
      );
      await this.walletService.deleteMemberWallet(ctx, userId, args.input.communityId, tx);
      return membership;
    });

    await this.notificationService.switchRichMenuByRole(ctx, membership);
    return MembershipPresenter.withdraw(membership);
  }

  async ownerRemoveMember(args: GqlMutationMembershipRemoveArgs, ctx: IContext) {
    const { userId, communityId } = args.input;

    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const membership = await this.membershipService.deleteMembership(
        ctx,
        tx,
        userId,
        communityId,
      );
      await this.walletService.deleteMemberWallet(ctx, userId, communityId, tx);
      return membership;
    });

    await this.notificationService.switchRichMenuByRole(ctx, membership);
    return MembershipPresenter.remove(membership);
  }

  async ownerAssignOwner(args: GqlMutationMembershipAssignOwnerArgs, ctx: IContext) {
    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.membershipService.setRole(ctx, args.input, Role.OWNER, tx);
    });

    await this.notificationService.switchRichMenuByRole(ctx, membership);
    return MembershipPresenter.setRole(membership);
  }

  async managerAssignManager(args: GqlMutationMembershipAssignManagerArgs, ctx: IContext) {
    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.membershipService.setRole(ctx, args.input, Role.MANAGER, tx);
    });

    await this.notificationService.switchRichMenuByRole(ctx, membership);
    return MembershipPresenter.setRole(membership);
  }

  async managerAssignMember(args: GqlMutationMembershipAssignMemberArgs, ctx: IContext) {
    const membership = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return await this.membershipService.setRole(ctx, args.input, Role.MEMBER, tx);
    });

    await this.notificationService.switchRichMenuByRole(ctx, membership);
    return MembershipPresenter.setRole(membership);
  }
}
