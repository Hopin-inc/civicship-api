import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/user/data/type";
import { opportunityInclude } from "@/application/domain/opportunity/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: true,
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  opportunities: { include: opportunityInclude },
});

export const articleForPortfolioInclude = Prisma.validator<Prisma.ArticleInclude>()({
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
});

export type PrismaArticle = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export type PrismaArticleForPortfolio = Prisma.ArticleGetPayload<{
  include: typeof articleForPortfolioInclude;
}>;
