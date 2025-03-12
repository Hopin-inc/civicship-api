import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";
import { opportunityInclude } from "@/application/opportunity/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: true,
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  opportunities: { include: opportunityInclude },
});

export type PrismaArticle = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;
