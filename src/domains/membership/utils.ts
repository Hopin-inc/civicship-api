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
import WalletService from "@/domains/membership/wallet/service";
import { PrismaClientIssuer } from "@/prisma/client";

export default class MembershipUtils {
  private static issuer = new PrismaClientIssuer();

  static async fetchMembershipsCommon(
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
  }

  static async joinCommunityAndCreateMemberWallet(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    userId: string,
    communityId: string,
  ) {
    let membership = await MembershipRepository.find(
      ctx,
      { userId_communityId: { userId, communityId } },
      tx,
    );

    if (!membership) {
      const data: Prisma.MembershipCreateInput = MembershipInputFormat.join({
        userId,
        communityId,
      });
      membership = await MembershipRepository.create(ctx, data, tx);
    } else {
      const data: Prisma.EnumMembershipStatusFieldUpdateOperationsInput =
        MembershipInputFormat.setStatus(MembershipStatus.JOINED);

      membership = await MembershipRepository.setStatus(
        ctx,
        { userId_communityId: { userId, communityId } },
        data,
        tx,
      );
    }

    const wallet = await WalletService.createMemberWallet(ctx, userId, communityId, tx);

    return { membership, wallet };
  }

  static async withdrawCommunityAndDeleteMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
  ) {
    return this.issuer.public(ctx, async (tx) => {
      const membership = await MembershipRepository.find(
        ctx,
        { userId_communityId: { userId, communityId } },
        tx,
      );
      if (!membership) {
        throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
      }

      await MembershipRepository.delete(ctx, { userId_communityId: { userId, communityId } }, tx);
      await WalletService.deleteMemberWallet(ctx, userId, communityId, tx);

      return { userId, communityId };
    });
  }

  static async setMembershipStatus(
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
  }

  static async setMembershipRole(ctx: IContext, userId: string, communityId: string, role: Role) {
    const membership = await MembershipRepository.find(ctx, {
      userId_communityId: { userId, communityId },
    });
    if (!membership) {
      throw new Error(`MembershipNotFound: userId=${userId}, communityId=${communityId}`);
    }

    const data: Prisma.EnumRoleFieldUpdateOperationsInput = MembershipInputFormat.setRole(role);
    return MembershipRepository.setRole(ctx, { userId_communityId: { userId, communityId } }, data);
  }
}
