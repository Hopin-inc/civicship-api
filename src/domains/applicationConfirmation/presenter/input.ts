import { Prisma } from "@prisma/client";
import {
  GqlMutationApplicationConfirmationCreateArgs,
  GqlQueryActivitiesArgs,
  GqlQueryApplicationConfirmationsArgs,
} from "@/types/graphql";

export default class ApplicationConfirmationInputFormat {
  static filter({
    filter,
  }: GqlQueryApplicationConfirmationsArgs): Prisma.ApplicationConfirmationWhereInput {
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

  static sort({
    sort,
  }: GqlQueryActivitiesArgs): Prisma.ApplicationConfirmationOrderByWithRelationInput {
    return { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc };
  }

  static create({
    input,
  }: GqlMutationApplicationConfirmationCreateArgs): Prisma.ApplicationConfirmationCreateInput {
    const { applicationId, confirmerId, ...properties } = input;

    return {
      ...properties,
      application: { connect: { id: applicationId } },
      confirmedBy: { connect: { id: confirmerId } },
    };
  }
}
