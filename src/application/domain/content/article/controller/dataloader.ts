import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createArticleLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaArticleDetail, GqlArticle>(async (ids) => {
    return issuer.internal((tx) =>
      tx.article.findMany({
        where: { id: { in: [...ids] } },
        select: articleSelectDetail,
      }),
    );
  }, ArticlePresenter.get);
}

export function createArticlesByOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle[]>(async (opportunityIds) => {
    const opportunities = await issuer.internal((tx) =>
      tx.opportunity.findMany({
        where: { id: { in: [...opportunityIds] } },
        include: { articles: true },
      }),
    );

    const map = new Map<string, GqlArticle[]>();
    for (const o of opportunities) {
      map.set(o.id, o.articles.map(ArticlePresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesWrittenByMeLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle[]>(async (userIds) => {
    const users = await issuer.internal((tx) =>
      tx.user.findMany({
        where: { id: { in: [...userIds] } },
        include: { articlesWrittenByMe: true },
      }),
    );

    const map = new Map<string, GqlArticle[]>();
    for (const user of users) {
      map.set(user.id, user.articlesWrittenByMe.map(ArticlePresenter.get));
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesAboutMeLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle[]>(async (userIds) => {
    const users = await issuer.internal((tx) =>
      tx.user.findMany({
        where: { id: { in: [...userIds] } },
        include: { articlesAboutMe: true },
      }),
    );

    const map = new Map<string, GqlArticle[]>();
    for (const user of users) {
      map.set(user.id, user.articlesAboutMe.map(ArticlePresenter.get));
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export function createArticlesByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaArticleDetail, GqlArticle>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.article.findMany({
          where: { communityId: { in: [...communityIds] } },
        }),
      );
    },
    ArticlePresenter.get,
  );
}
