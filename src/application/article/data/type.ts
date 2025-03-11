import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { userInclude } from "@/application/user/data/type";
import { opportunityInclude } from "@/application/opportunity/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: { include: communityInclude },
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  opportunities: { include: opportunityInclude },
});

export type ArticlePayloadWithArgs = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;
