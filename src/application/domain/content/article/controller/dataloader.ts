import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlArticle } from "@/types/graphql";
import {
  articleSelectDetail,
  PrismaArticleDetail,
} from "@/application/domain/content/article/data/type";
import ArticlePresenter from "@/application/domain/content/article/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createArticleLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaArticleDetail, GqlArticle>(async (ids) => {
    return prisma.article.findMany({
      where: { id: { in: [...ids] } },
      select: articleSelectDetail,
    });
  }, ArticlePresenter.get);
}

export function createArticlesByOpportunityLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlArticle[]>(async (opportunityIds) => {
    const opportunities = await prisma.opportunity.findMany({
      where: { id: { in: [...opportunityIds] } },
      include: { articles: true },
    });

    const map = new Map<string, GqlArticle[]>();
    for (const o of opportunities) {
      map.set(o.id, o.articles.map(ArticlePresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesWrittenByMeLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlArticle[]>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
      include: { articlesWrittenByMe: true },
    });

    const map = new Map<string, GqlArticle[]>();
    for (const user of users) {
      map.set(user.id, user.articlesWrittenByMe.map(ArticlePresenter.get));
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesAboutMeLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlArticle[]>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
      include: { articlesAboutMe: true },
    });

    const map = new Map<string, GqlArticle[]>();
    for (const user of users) {
      map.set(user.id, user.articlesAboutMe.map(ArticlePresenter.get));
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaArticleDetail, GqlArticle>(
    "communityId",
    async (communityIds) => {
      return prisma.article.findMany({
        where: { communityId: { in: [...communityIds] } },
      });
    },
    ArticlePresenter.get,
  );
}
