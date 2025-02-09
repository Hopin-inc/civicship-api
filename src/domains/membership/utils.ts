import { IContext } from "@/types/server";
import { MembershipStatus, Prisma, Role } from "@prisma/client";
import MembershipRepository from "@/domains/membership/repository";
import MembershipInputFormat from "@/domains/membership/presenter/input";

export const MembershipUtils = {
  async setMembershipStatus(
    ctx: IContext,
    userId: string,
    communityId: string,
    status: MembershipStatus,
  ) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    const data: Prisma.EnumMembershipStatusFieldUpdateOperationsInput =
      MembershipInputFormat.updateStatus(status);
    return MembershipRepository.updateStatus(
      ctx,
      { userId_communityId: { userId, communityId } },
      data,
    );
  },

  async updateMembershipRole(ctx: IContext, userId: string, communityId: string, role: Role) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    const data: Prisma.EnumRoleFieldUpdateOperationsInput = MembershipInputFormat.updateRole(role);
    return MembershipRepository.updateRole(
      ctx,
      { userId_communityId: { userId, communityId } },
      data,
    );
  },

  async deleteMembership(ctx: IContext, userId: string, communityId: string) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    return MembershipRepository.delete(ctx, { userId_communityId: { userId, communityId } });
  },
};
