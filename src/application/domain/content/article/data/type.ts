import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";
import { opportunityInclude } from "@/application/domain/experience/opportunity/data/type";
import { communityInclude } from "@/application/domain/account/community/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: { include: communityInclude },
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  opportunities: { include: opportunityInclude },
});

export const articleForPortfolioInclude = Prisma.validator<Prisma.ArticleInclude>()({
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  thumbnail: true,
});

export type PrismaArticle = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export type PrismaArticleForPortfolio = Prisma.ArticleGetPayload<{
  include: typeof articleForPortfolioInclude;
}>;
