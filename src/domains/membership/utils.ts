import { IContext } from "@/types/server";
import { MembershipStatus, Prisma, Role } from "@prisma/client";
import MembershipRepository from "@/domains/membership/repository";
import MembershipInputFormat from "@/domains/membership/presenter/input";
import {
  GqlMembershipCursorInput,
  GqlMembershipFilterInput,
  GqlMembershipsConnection,
  GqlMembershipSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/graphql/pagination";
import MembershipService from "@/domains/membership/service";
import MembershipOutputFormat from "@/domains/membership/presenter/output";

export const MembershipUtils = {
  async fetchMembershipsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: GqlMembershipCursorInput;
      filter?: GqlMembershipFilterInput;
      sort?: GqlMembershipSortInput;
      first?: number;
    },
  ): Promise<GqlMembershipsConnection> {
    const take = clampFirst(first);

    const res = await MembershipService.fetchMemberships(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data = res.slice(0, take).map((record) => {
      return MembershipOutputFormat.get(record);
    });

    return MembershipOutputFormat.query(data, hasNextPage);
  },

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
      MembershipInputFormat.setStatus(status);
    return MembershipRepository.setStatus(
      ctx,
      { userId_communityId: { userId, communityId } },
      data,
    );
  },

  async setMembershipRole(ctx: IContext, userId: string, communityId: string, role: Role) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    const data: Prisma.EnumRoleFieldUpdateOperationsInput = MembershipInputFormat.setRole(role);
    return MembershipRepository.setRole(ctx, { userId_communityId: { userId, communityId } }, data);
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
