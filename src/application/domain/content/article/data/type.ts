import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: true,
  authors: true,
  relatedUsers: true,
  opportunities: true,
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

  publishedAt: true,

  createdAt: true,
  updatedAt: true,
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

export const articlePortfolioInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: true,
  thumbnail: true,
  relatedUsers: { include: userInclude },
  authors: { include: userInclude },
});

export type PrismaArticle = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

export type PrismaArticleDetail = Prisma.ArticleGetPayload<{
  select: typeof articleSelectDetail;
}>;

export type PrismaArticleForPortfolio = Prisma.ArticleGetPayload<{
  include: typeof articlePortfolioInclude;
}>;
