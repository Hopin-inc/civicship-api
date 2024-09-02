import { GqlMutationActivityCreateArgs, GqlQueryActivitiesArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts";

export default class ActivityInputFormat {
  static filter({ filter }: GqlQueryActivitiesArgs): Prisma.ActivityWhereInput {
    return {
      AND: [
        { isPublic: true },
        filter?.userId ? { user: { id: filter?.userId } } : {},
        filter?.eventId ? { event: { id: filter?.eventId } } : {},
        filter?.keyword
          ? {
              OR: [
                { description: { contains: filter?.keyword } },
                { remark: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryActivitiesArgs): Prisma.ActivityOrderByWithRelationInput {
    return { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc };
  }

  static create({ input }: GqlMutationActivityCreateArgs): Prisma.ActivityCreateInput {
    const { userId, eventId, ...properties } = input;

    return {
      ...properties,
      user: userId ? { connect: { id: userId } } : undefined,
      event: eventId ? { connect: { id: eventId } } : undefined,
    };
  }

  static updateUser(userId: string, action: RELATION_ACTION): Prisma.ActivityUpdateInput {
    const data: Prisma.ActivityUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.user = {
          connect: {
            id: userId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.user = {
          disconnect: {
            id: userId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateEvent(eventId: string, action: RELATION_ACTION): Prisma.ActivityUpdateInput {
    const data: Prisma.ActivityUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT:
        data.event = {
          connect: {
            id: eventId,
          },
        };
        break;

      case RELATION_ACTION.DISCONNECT:
        data.event = {
          disconnect: {
            id: eventId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
