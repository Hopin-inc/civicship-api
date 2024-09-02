import { Prisma } from "@prisma/client";
import {
  GqlMutationApplicationCreateArgs,
  GqlQueryActivitiesArgs,
  GqlQueryApplicationsArgs,
} from "@/types/graphql";

export default class ApplicationInputFormat {
  static filter({ filter }: GqlQueryApplicationsArgs): Prisma.ApplicationWhereInput {
    return {
      AND: [
        filter?.keyword
          ? {
              OR: [{ comment: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryActivitiesArgs): Prisma.ApplicationOrderByWithRelationInput {
    return { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc };
  }

  static create({ input }: GqlMutationApplicationCreateArgs): Prisma.ApplicationCreateInput {
    const { eventId, userId, submittedAt, ...properties } = input;

    return {
      ...properties,
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } },
      submittedAt: new Date(submittedAt ?? Date.now()).toISOString(),
    };
  }
}
