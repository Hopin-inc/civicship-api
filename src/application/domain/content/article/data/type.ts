import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: true,
  authors: true,
  relatedUsers: true,
  opportunities: true,
  thumbnail: true,
});

export const portfolioFromArticleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  authors: { include: userInclude },
  relatedUsers: { include: userInclude },
  thumbnail: true,
});

export const articleSelectDetail = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  category: true,
  introduction: true,
  body: true,
  publishStatus: true,
  thumbnailId: true,
  communityId: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  authors: { select: { id: true } },
  relatedUsers: { select: { id: true } },
  opportunities: { select: { id: true } },
});

export const articleForPortfolioSelectDetail = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  introduction: true,
  category: true,
  body: true,
  publishStatus: true,
  thumbnailId: true,
  communityId: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  authors: { select: { id: true } },
  relatedUsers: { select: { id: true } },
  opportunities: { select: { id: true } },
});

export type PrismaArticle = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export type PrismaArticleForPortfolio = Prisma.ArticleGetPayload<{
  include: typeof portfolioFromArticleInclude;
}>;

export type PrismaArticleDetail = Prisma.ArticleGetPayload<{
  select: typeof articleSelectDetail;
}>;

export type PrismaArticleForPortfolioDetail = Prisma.ArticleGetPayload<{
  select: typeof articleForPortfolioSelectDetail;
}>;
