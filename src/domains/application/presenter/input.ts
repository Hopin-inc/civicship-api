import { Prisma } from "@prisma/client";
import {
  GqlMutationApplicationAddConfirmationArgs,
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

  static addConfirmation({
    id,
    input,
  }: GqlMutationApplicationAddConfirmationArgs): Prisma.ApplicationConfirmationCreateInput {
    const { isApproved, confirmerId, comment } = input;
    return {
      isApproved,
      application: { connect: { id } },
      confirmedBy: { connect: { id: confirmerId } },
      comment,
    };
  }
}
