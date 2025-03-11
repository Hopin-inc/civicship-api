import { IContext } from "@/types/server";
import { MembershipStatus, Prisma } from "@prisma/client";
import MembershipRepository from "@/application/membership/data/repository";
import MembershipInputFormat from "@/application/membership/data/converter";
import {
  GqlMembershipCursorInput,
  GqlMembershipFilterInput,
  GqlMembershipsConnection,
  GqlMembershipSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import MembershipService from "@/application/membership/service";
import MembershipOutputFormat from "@/application/membership/presenter";
import { NotFoundError } from "@/errors/graphql";

export default class MembershipUtils {
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
      throw new NotFoundError("Membership", { userId, communityId });
    }

    const data: Prisma.EnumMembershipStatusFieldUpdateOperationsInput =
      MembershipInputFormat.setStatus(status);

    return MembershipRepository.setStatus(
      ctx,
      { userId_communityId: { userId, communityId } },
      data,
    );
  }
}
